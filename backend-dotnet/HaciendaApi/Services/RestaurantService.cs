using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using HaciendaApi.Models;
using MySqlConnector;

namespace HaciendaApi.Services;

public class RestaurantService
{
    private readonly string _connectionString;
    private readonly string _jsonFilePath;
    private readonly byte[] _hmacSecretKey;
    private readonly object _lock = new();
    private readonly Dictionary<string, (int Intentos, DateTime BloqueadoHasta)> _intentosLogin = new();
    private bool _mysqlAvailable = false;
    private StoreData _store = new();

    public const decimal PRECIO_ADULTO = 280.00m;
    public const decimal PRECIO_NINO = 180.00m;
    public const decimal MAX_DESCUENTO_PORCENTAJE = 0.50m; // Máximo 50% de descuento autorizado

    public string ModoAlmacenamiento => _mysqlAvailable ? "MySQL (hacienda_buffet)" : "Persistencia Local (.NET + JSON)";

    public RestaurantService(IConfiguration config, IWebHostEnvironment env)
    {
        _connectionString = Environment.GetEnvironmentVariable("HACIENDA_MYSQL_CONN")
            ?? config.GetConnectionString("MySql")
            ?? "Server=localhost;Port=3306;Database=hacienda_buffet;User=root;Password=;";
        var dataDir = Path.Combine(env.ContentRootPath, "Data");
        Directory.CreateDirectory(dataDir);
        _jsonFilePath = Path.Combine(dataDir, "hacienda_store_v2.json");

        // Clave secreta HMAC-SHA256 persistente para firmar tokens de sesión
        var keyPath = Path.Combine(dataDir, "hmac_secret.key");
        if (File.Exists(keyPath))
        {
            _hmacSecretKey = File.ReadAllBytes(keyPath);
        }
        else
        {
            _hmacSecretKey = RandomNumberGenerator.GetBytes(32);
            File.WriteAllBytes(keyPath, _hmacSecretKey);
        }

        InicializarAlmacenamiento();
    }

    public static string HashPasswordPbkdf2(string plainPassword)
    {
        if (plainPassword.StartsWith("PBKDF2$", StringComparison.Ordinal))
            return plainPassword;

        byte[] salt = RandomNumberGenerator.GetBytes(16);
        byte[] hash = Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(plainPassword),
            salt,
            100_000,
            HashAlgorithmName.SHA256,
            32);
        return $"PBKDF2${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
    }

    public static bool VerifyPasswordPbkdf2(string plainPassword, string storedHash)
    {
        if (string.IsNullOrEmpty(plainPassword) || string.IsNullOrEmpty(storedHash))
            return false;

        if (!storedHash.StartsWith("PBKDF2$", StringComparison.Ordinal))
        {
            byte[] a = Encoding.UTF8.GetBytes(plainPassword);
            byte[] b = Encoding.UTF8.GetBytes(storedHash);
            return CryptographicOperations.FixedTimeEquals(a, b);
        }

        var parts = storedHash.Split('$');
        if (parts.Length != 3) return false;

        byte[] salt = Convert.FromBase64String(parts[1]);
        byte[] expectedHash = Convert.FromBase64String(parts[2]);
        byte[] actualHash = Rfc2898DeriveBytes.Pbkdf2(
            Encoding.UTF8.GetBytes(plainPassword),
            salt,
            100_000,
            HashAlgorithmName.SHA256,
            32);
        return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
    }

    private void MigrarHashesUsuarios()
    {
        bool modificado = false;
        foreach (var u in _store.Usuarios)
        {
            if (!string.IsNullOrEmpty(u.Password) && !u.Password.StartsWith("PBKDF2$", StringComparison.Ordinal))
            {
                u.Password = HashPasswordPbkdf2(u.Password);
                modificado = true;
            }
        }
        if (modificado)
        {
            GuardarJsonLocal();
        }
    }

    private void InicializarAlmacenamiento()
    {
        try
        {
            var builder = new MySqlConnectionStringBuilder(_connectionString)
            {
                ConnectionTimeout = 2
            };
            using var conn = new MySqlConnection(builder.ConnectionString);
            conn.Open();
            _mysqlAvailable = true;
            CargarDesdeMySql(conn);
            MigrarHashesUsuarios();
            GuardarJsonLocal();
            return;
        }
        catch
        {
            _mysqlAvailable = false;
        }

        if (File.Exists(_jsonFilePath))
        {
            try
            {
                var raw = File.ReadAllText(_jsonFilePath);
                var data = JsonSerializer.Deserialize<StoreData>(raw);
                if (data != null && data.Mesas.Count >= 23)
                {
                    _store = data;
                    MigrarHashesUsuarios();
                    RehidratarMesas();
                    return;
                }
            }
            catch
            {
                // Regenerar datos semilla si hay cambio de versión
            }
        }

        GenerarDatosSemilla();
        MigrarHashesUsuarios();
        GuardarJsonLocal();
    }

    private void CargarDesdeMySql(MySqlConnection conn)
    {
        GenerarDatosSemilla();
        try
        {
            using var cmdMesas = new MySqlCommand("SELECT id, numero, nombre, capacidad, zona, estado, orden_actual_id FROM mesas ORDER BY numero", conn);
            using var reader = cmdMesas.ExecuteReader();
            var mesasDb = new List<Mesa>();
            while (reader.Read())
            {
                mesasDb.Add(new Mesa
                {
                    Id = reader.GetInt32("id"),
                    Numero = reader.GetInt32("numero"),
                    Nombre = reader.GetString("nombre"),
                    Capacidad = reader.GetInt32("capacidad"),
                    Zona = reader.GetString("zona"),
                    Estado = reader.GetString("estado"),
                    OrdenActualId = reader.IsDBNull(reader.GetOrdinal("orden_actual_id")) ? null : reader.GetInt32("orden_actual_id")
                });
            }
            if (mesasDb.Count >= 23)
            {
                _store.Mesas = mesasDb;
            }
        }
        catch
        {
            // Usar las 23 mesas del mapa arquitectónico por defecto
        }
        RehidratarMesas();
    }

    private void SincronizarMySqlPago(Pago pago, Orden orden, Mesa mesa)
    {
        if (!_mysqlAvailable) return;
        try
        {
            using var conn = new MySqlConnection(_connectionString);
            conn.Open();
            using var cmdMesa = new MySqlCommand("UPDATE mesas SET estado = @estado, orden_actual_id = NULL WHERE id = @id", conn);
            cmdMesa.Parameters.AddWithValue("@estado", mesa.Estado);
            cmdMesa.Parameters.AddWithValue("@id", mesa.Id);
            cmdMesa.ExecuteNonQuery();

            using var cmdPago = new MySqlCommand(@"
                INSERT IGNORE INTO pagos 
                (folio_ticket, orden_id, mesa_numero, mesa_capacidad, cant_adultos, cant_ninos, subtotal_buffet, subtotal_extras, descuento, propina, monto_total, metodo_pago, monto_recibido, cambio, referencia, cajero, fecha_pago)
                VALUES (@folio, @ordenId, @mesaNum, @mesaCap, @adultos, @ninos, @subBuffet, @subExtras, @desc, @propina, @total, @metodo, @recibido, @cambio, @ref, @cajero, @fecha)", conn);
            cmdPago.Parameters.AddWithValue("@folio", pago.FolioTicket);
            cmdPago.Parameters.AddWithValue("@ordenId", pago.OrdenId);
            cmdPago.Parameters.AddWithValue("@mesaNum", pago.MesaNumero);
            cmdPago.Parameters.AddWithValue("@mesaCap", pago.MesaCapacidad);
            cmdPago.Parameters.AddWithValue("@adultos", pago.CantAdultos);
            cmdPago.Parameters.AddWithValue("@ninos", pago.CantNinos);
            cmdPago.Parameters.AddWithValue("@subBuffet", pago.SubtotalBuffet);
            cmdPago.Parameters.AddWithValue("@subExtras", pago.SubtotalExtras);
            cmdPago.Parameters.AddWithValue("@desc", pago.Descuento);
            cmdPago.Parameters.AddWithValue("@propina", pago.Propina);
            cmdPago.Parameters.AddWithValue("@total", pago.MontoTotal);
            cmdPago.Parameters.AddWithValue("@metodo", pago.MetodoPago);
            cmdPago.Parameters.AddWithValue("@recibido", pago.MontoRecibido);
            cmdPago.Parameters.AddWithValue("@cambio", pago.Cambio);
            cmdPago.Parameters.AddWithValue("@ref", (object?)pago.Referencia ?? DBNull.Value);
            cmdPago.Parameters.AddWithValue("@cajero", pago.Cajero);
            cmdPago.Parameters.AddWithValue("@fecha", pago.FechaPago);
            cmdPago.ExecuteNonQuery();
        }
        catch
        {
            // Continuar con respaldo JSON
        }
    }

    private void GenerarDatosSemilla()
    {
        _store = new StoreData
        {
            Usuarios = new List<Usuario>
            {
                new() { Id = 1, Username = "admin", Password = "admin123", Nombre = "Administrador General", Rol = "Administrador", Activo = true },
                new() { Id = 2, Username = "cajero", Password = "cajero123", Nombre = "Laura Méndez (Caja)", Rol = "Cajero", Activo = true },
                new() { Id = 3, Username = "mesero", Password = "mesero123", Nombre = "Carlos Rivera (Piso)", Rol = "Mesero", Activo = true }
            },
            ProductosExtra = new List<ProductoExtra>
            {
                new() { Id = 1, Nombre = "Refresco lata 355ml", Categoria = "Bebida", Precio = 35.00m },
                new() { Id = 2, Nombre = "Jarra de Agua Fresca (2L)", Categoria = "Bebida", Precio = 95.00m },
                new() { Id = 3, Nombre = "Vaso de Agua del Día", Categoria = "Bebida", Precio = 30.00m },
                new() { Id = 4, Nombre = "Cerveza Nacional", Categoria = "Bebida", Precio = 55.00m },
                new() { Id = 5, Nombre = "Cerveza Artesanal", Categoria = "Bebida", Precio = 80.00m },
                new() { Id = 6, Nombre = "Café de Olla Refill", Categoria = "Bebida", Precio = 40.00m },
                new() { Id = 7, Nombre = "Limonada / Naranjada Mineral", Categoria = "Bebida", Precio = 45.00m },
                new() { Id = 8, Nombre = "Postre Especial (Pastel de Elote)", Categoria = "Postre", Precio = 65.00m },
                new() { Id = 9, Nombre = "Flan Napolitano de la Casa", Categoria = "Postre", Precio = 55.00m },
                new() { Id = 10, Nombre = "Paquete Cumpleaños (Pastelito + Vela)", Categoria = "Especial", Precio = 120.00m }
            },
            // 23 Mesas exactas del Plano Arquitectónico de La Hacienda:
            // - Pasillo superior: 7 mesas (Mesas 1 a 7)
            // - Pasillo lateral izquierdo: 4 mesas (Mesas 8 a 11)
            // - Pasillo lateral derecho: 4 mesas (Mesas 12 a 15)
            // - Acceso / Cuarto trasero: 8 mesas en cuadrícula 4x2 (Mesas 16 a 23)
            Mesas = new List<Mesa>
            {
                // PASILLO SUPERIOR (7 Mesas: M1 a M7)
                new() { Id = 1,  Numero = 1,  Nombre = "Mesa 1",  Capacidad = 6,  Zona = "Pasillo superior", Estado = "Ocupada", OrdenActualId = 102 },
                new() { Id = 2,  Numero = 2,  Nombre = "Mesa 2",  Capacidad = 6,  Zona = "Pasillo superior", Estado = "Libre" },
                new() { Id = 3,  Numero = 3,  Nombre = "Mesa 3",  Capacidad = 10, Zona = "Pasillo superior", Estado = "Libre" },
                new() { Id = 4,  Numero = 4,  Nombre = "Mesa 4",  Capacidad = 10, Zona = "Pasillo superior", Estado = "Por Pagar", OrdenActualId = 103 },
                new() { Id = 5,  Numero = 5,  Nombre = "Mesa 5",  Capacidad = 10, Zona = "Pasillo superior", Estado = "Libre" },
                new() { Id = 6,  Numero = 6,  Nombre = "Mesa 6",  Capacidad = 6,  Zona = "Pasillo superior", Estado = "Libre" },
                new() { Id = 7,  Numero = 7,  Nombre = "Mesa 7",  Capacidad = 6,  Zona = "Pasillo superior", Estado = "Libre" },

                // PASILLO LATERAL IZQUIERDO (4 Mesas: M8 a M11)
                new() { Id = 8,  Numero = 8,  Nombre = "Mesa 8",  Capacidad = 4,  Zona = "Pasillo lateral izquierdo", Estado = "Libre" },
                new() { Id = 9,  Numero = 9,  Nombre = "Mesa 9",  Capacidad = 4,  Zona = "Pasillo lateral izquierdo", Estado = "Ocupada", OrdenActualId = 104 },
                new() { Id = 10, Numero = 10, Nombre = "Mesa 10", Capacidad = 6,  Zona = "Pasillo lateral izquierdo", Estado = "Libre" },
                new() { Id = 11, Numero = 11, Nombre = "Mesa 11", Capacidad = 6,  Zona = "Pasillo lateral izquierdo", Estado = "Libre" },

                // PASILLO LATERAL DERECHO (4 Mesas: M12 a M15)
                new() { Id = 12, Numero = 12, Nombre = "Mesa 12", Capacidad = 4,  Zona = "Pasillo lateral derecho", Estado = "Libre" },
                new() { Id = 13, Numero = 13, Nombre = "Mesa 13", Capacidad = 4,  Zona = "Pasillo lateral derecho", Estado = "Libre" },
                new() { Id = 14, Numero = 14, Nombre = "Mesa 14", Capacidad = 6,  Zona = "Pasillo lateral derecho", Estado = "Libre" },
                new() { Id = 15, Numero = 15, Nombre = "Mesa 15", Capacidad = 6,  Zona = "Pasillo lateral derecho", Estado = "Libre" },

                // ACCESO / CUARTO TRASERO (8 Mesas en 2 filas x 4 columnas: M16 a M23)
                new() { Id = 16, Numero = 16, Nombre = "Mesa 16", Capacidad = 4,  Zona = "Acceso / Cuarto trasero", Estado = "Libre" },
                new() { Id = 17, Numero = 17, Nombre = "Mesa 17", Capacidad = 4,  Zona = "Acceso / Cuarto trasero", Estado = "Libre" },
                new() { Id = 18, Numero = 18, Nombre = "Mesa 18", Capacidad = 4,  Zona = "Acceso / Cuarto trasero", Estado = "Libre" },
                new() { Id = 19, Numero = 19, Nombre = "Mesa 19", Capacidad = 4,  Zona = "Acceso / Cuarto trasero", Estado = "Libre" },
                new() { Id = 20, Numero = 20, Nombre = "Mesa 20", Capacidad = 4,  Zona = "Acceso / Cuarto trasero", Estado = "Libre" },
                new() { Id = 21, Numero = 21, Nombre = "Mesa 21", Capacidad = 4,  Zona = "Acceso / Cuarto trasero", Estado = "Libre" },
                new() { Id = 22, Numero = 22, Nombre = "Mesa 22", Capacidad = 10, Zona = "Acceso / Cuarto trasero", Estado = "Libre" },
                new() { Id = 23, Numero = 23, Nombre = "Mesa 23", Capacidad = 10, Zona = "Acceso / Cuarto trasero", Estado = "Libre" }
            }
        };

        var ordenPagada1 = new Orden
        {
            Id = 100,
            Folio = "ORD-0100",
            MesaId = 8,
            MesaNumero = 8,
            MesaCapacidad = 4,
            Mesero = "Carlos Rivera",
            CantAdultos = 2,
            PrecioAdulto = PRECIO_ADULTO,
            CantNinos = 1,
            PrecioNino = PRECIO_NINO,
            SubtotalBuffet = (2 * PRECIO_ADULTO) + (1 * PRECIO_NINO),
            SubtotalExtras = 95.00m,
            Propina = 80.00m,
            Total = 915.00m,
            Estado = "Pagada",
            FechaApertura = DateTime.Now.AddHours(-2),
            FechaCierre = DateTime.Now.AddHours(-1),
            Extras = new List<OrdenExtra>
            {
                new() { Id = 1, OrdenId = 100, ProductoId = 2, NombreProducto = "Jarra de Agua Fresca (2L)", PrecioUnitario = 95.00m, Cantidad = 1, Subtotal = 95.00m }
            }
        };

        var ordenPagada2 = new Orden
        {
            Id = 101,
            Folio = "ORD-0101",
            MesaId = 3,
            MesaNumero = 3,
            MesaCapacidad = 10,
            Mesero = "Laura Méndez",
            CantAdultos = 6,
            PrecioAdulto = PRECIO_ADULTO,
            CantNinos = 3,
            PrecioNino = PRECIO_NINO,
            SubtotalBuffet = (6 * PRECIO_ADULTO) + (3 * PRECIO_NINO),
            SubtotalExtras = 190.00m,
            Propina = 240.00m,
            Total = 2650.00m,
            Estado = "Pagada",
            FechaApertura = DateTime.Now.AddMinutes(-95),
            FechaCierre = DateTime.Now.AddMinutes(-30),
            Extras = new List<OrdenExtra>
            {
                new() { Id = 2, OrdenId = 101, ProductoId = 2, NombreProducto = "Jarra de Agua Fresca (2L)", PrecioUnitario = 95.00m, Cantidad = 2, Subtotal = 190.00m }
            }
        };

        var ordenActivaMesa1 = new Orden
        {
            Id = 102,
            Folio = "ORD-0102",
            MesaId = 1,
            MesaNumero = 1,
            MesaCapacidad = 6,
            Mesero = "Carlos Rivera",
            CantAdultos = 3,
            PrecioAdulto = PRECIO_ADULTO,
            CantNinos = 2,
            PrecioNino = PRECIO_NINO,
            SubtotalBuffet = (3 * PRECIO_ADULTO) + (2 * PRECIO_NINO), // 840 + 360 = 1200
            SubtotalExtras = 70.00m,
            Total = 1270.00m,
            Estado = "Abierta",
            Notas = "Pasillo superior vista patio",
            FechaApertura = DateTime.Now.AddMinutes(-40),
            Extras = new List<OrdenExtra>
            {
                new() { Id = 3, OrdenId = 102, ProductoId = 1, NombreProducto = "Refresco lata 355ml", PrecioUnitario = 35.00m, Cantidad = 2, Subtotal = 70.00m }
            }
        };

        var ordenActivaMesa4 = new Orden
        {
            Id = 103,
            Folio = "ORD-0103",
            MesaId = 4,
            MesaNumero = 4,
            MesaCapacidad = 10,
            Mesero = "Carlos Rivera",
            CantAdultos = 6,
            PrecioAdulto = PRECIO_ADULTO,
            CantNinos = 2,
            PrecioNino = PRECIO_NINO,
            SubtotalBuffet = (6 * PRECIO_ADULTO) + (2 * PRECIO_NINO), // 1680 + 360 = 2040
            SubtotalExtras = 155.00m,
            Total = 2195.00m,
            Estado = "Abierta",
            Notas = "Grupo familiar - Solicitaron la cuenta",
            FechaApertura = DateTime.Now.AddMinutes(-55),
            Extras = new List<OrdenExtra>
            {
                new() { Id = 4, OrdenId = 103, ProductoId = 2, NombreProducto = "Jarra de Agua Fresca (2L)", PrecioUnitario = 95.00m, Cantidad = 1, Subtotal = 95.00m },
                new() { Id = 5, OrdenId = 103, ProductoId = 3, NombreProducto = "Vaso de Agua del Día", PrecioUnitario = 30.00m, Cantidad = 2, Subtotal = 60.00m }
            }
        };

        var ordenActivaMesa9 = new Orden
        {
            Id = 104,
            Folio = "ORD-0104",
            MesaId = 9,
            MesaNumero = 9,
            MesaCapacidad = 4,
            Mesero = "Carlos Rivera",
            CantAdultos = 2,
            PrecioAdulto = PRECIO_ADULTO,
            CantNinos = 1,
            PrecioNino = PRECIO_NINO,
            SubtotalBuffet = (2 * PRECIO_ADULTO) + (1 * PRECIO_NINO), // 560 + 180 = 740
            SubtotalExtras = 0.00m,
            Total = 740.00m,
            Estado = "Abierta",
            Notas = "Pasillo lateral izquierdo",
            FechaApertura = DateTime.Now.AddMinutes(-20),
            Extras = new List<OrdenExtra>()
        };

        _store.Ordenes.AddRange(new[] { ordenPagada1, ordenPagada2, ordenActivaMesa1, ordenActivaMesa4, ordenActivaMesa9 });

        _store.Pagos.AddRange(new[]
        {
            new Pago
            {
                Id = 1,
                FolioTicket = "TCK-0001",
                OrdenId = 100,
                MesaNumero = 8,
                MesaCapacidad = 4,
                CantAdultos = 2,
                CantNinos = 1,
                SubtotalBuffet = 740.00m,
                SubtotalExtras = 95.00m,
                Propina = 80.00m,
                MontoTotal = 915.00m,
                MetodoPago = "Efectivo",
                MontoRecibido = 1000.00m,
                Cambio = 85.00m,
                Cajero = "Laura Méndez (Caja)",
                FechaPago = DateTime.Now.AddHours(-1),
                Extras = ordenPagada1.Extras
            },
            new Pago
            {
                Id = 2,
                FolioTicket = "TCK-0002",
                OrdenId = 101,
                MesaNumero = 3,
                MesaCapacidad = 10,
                CantAdultos = 6,
                CantNinos = 3,
                SubtotalBuffet = 2220.00m,
                SubtotalExtras = 190.00m,
                Propina = 240.00m,
                MontoTotal = 2650.00m,
                MetodoPago = "Tarjeta",
                MontoRecibido = 2650.00m,
                Cambio = 0.00m,
                Referencia = "AUT-88412",
                Cajero = "Laura Méndez (Caja)",
                FechaPago = DateTime.Now.AddMinutes(-30),
                Extras = ordenPagada2.Extras
            }
        });

        RehidratarMesas();
    }

    private void RehidratarMesas()
    {
        foreach (var mesa in _store.Mesas)
        {
            if (mesa.OrdenActualId.HasValue)
            {
                mesa.OrdenActiva = _store.Ordenes.FirstOrDefault(o => o.Id == mesa.OrdenActualId.Value && o.Estado == "Abierta");
                if (mesa.OrdenActiva == null)
                {
                    mesa.OrdenActualId = null;
                    mesa.Estado = "Libre";
                }
            }
            else
            {
                mesa.OrdenActiva = null;
            }
        }
    }

    private void GuardarJsonLocal()
    {
        try
        {
            var options = new JsonSerializerOptions { WriteIndented = true };
            var json = JsonSerializer.Serialize(_store, options);
            File.WriteAllText(_jsonFilePath, json);
        }
        catch
        {
            // Ignorar errores secundarios
        }
    }

    private void RecalcularOrden(Orden orden)
    {
        orden.PrecioAdulto = PRECIO_ADULTO;
        orden.PrecioNino = PRECIO_NINO;
        orden.SubtotalBuffet = (orden.CantAdultos * PRECIO_ADULTO) + (orden.CantNinos * PRECIO_NINO);
        orden.SubtotalExtras = orden.Extras.Sum(e => e.Subtotal);

        decimal subtotalGeneral = orden.SubtotalBuffet + orden.SubtotalExtras;
        decimal maxDescuentoPermitido = Math.Round(subtotalGeneral * MAX_DESCUENTO_PORCENTAJE, 2);
        if (orden.Descuento > maxDescuentoPermitido)
        {
            orden.Descuento = maxDescuentoPermitido;
        }

        var bruto = subtotalGeneral - orden.Descuento + orden.Propina;
        orden.Total = bruto < 0 ? 0 : bruto;
    }

    private string GenerarTokenFirmado(Usuario user)
    {
        long expUnix = DateTimeOffset.UtcNow.AddHours(12).ToUnixTimeSeconds();
        var payloadObj = new
        {
            Id = user.Id,
            Username = user.Username,
            Nombre = user.Nombre,
            Rol = user.Rol,
            Exp = expUnix
        };
        string payloadJson = JsonSerializer.Serialize(payloadObj);
        string payloadB64 = Convert.ToBase64String(Encoding.UTF8.GetBytes(payloadJson));

        using var hmac = new HMACSHA256(_hmacSecretKey);
        byte[] sigBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(payloadB64));
        string sigB64 = Convert.ToBase64String(sigBytes);

        return $"{payloadB64}.{sigB64}";
    }

    public UsuarioDto? ValidarToken(string? authHeaderOrToken)
    {
        if (string.IsNullOrWhiteSpace(authHeaderOrToken))
            return null;

        string token = authHeaderOrToken.Trim();
        if (token.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            token = token.Substring(7).Trim();
        }

        var parts = token.Split('.');
        if (parts.Length != 2)
            return null;

        try
        {
            string payloadB64 = parts[0];
            byte[] providedSig = Convert.FromBase64String(parts[1]);

            using var hmac = new HMACSHA256(_hmacSecretKey);
            byte[] expectedSig = hmac.ComputeHash(Encoding.UTF8.GetBytes(payloadB64));

            if (!CryptographicOperations.FixedTimeEquals(providedSig, expectedSig))
                return null;

            string payloadJson = Encoding.UTF8.GetString(Convert.FromBase64String(payloadB64));
            using var doc = JsonDocument.Parse(payloadJson);
            var root = doc.RootElement;

            long exp = root.GetProperty("Exp").GetInt64();
            if (DateTimeOffset.UtcNow.ToUnixTimeSeconds() > exp)
                return null;

            return new UsuarioDto
            {
                Id = root.GetProperty("Id").GetInt32(),
                Username = root.GetProperty("Username").GetString() ?? "",
                Nombre = root.GetProperty("Nombre").GetString() ?? "",
                Rol = root.GetProperty("Rol").GetString() ?? "Mesero"
            };
        }
        catch
        {
            return null;
        }
    }

    public LoginResponse Login(LoginRequest req, string clientKey = "local")
    {
        lock (_lock)
        {
            var username = (req.Username ?? "").Trim().ToLowerInvariant();
            var password = (req.Password ?? "").Trim();
            string rateKey = $"{clientKey}:{username}";

            if (_intentosLogin.TryGetValue(rateKey, out var estadoRate))
            {
                if (estadoRate.BloqueadoHasta > DateTime.UtcNow)
                {
                    int segs = (int)Math.Ceiling((estadoRate.BloqueadoHasta - DateTime.UtcNow).TotalSeconds);
                    return new LoginResponse
                    {
                        Exito = false,
                        Mensaje = $"Demasiados intentos fallidos. Espera {segs} segundos antes de volver a intentar."
                    };
                }
            }

            var user = _store.Usuarios.FirstOrDefault(u =>
                u.Activo &&
                u.Username.Equals(username, StringComparison.OrdinalIgnoreCase) &&
                VerifyPasswordPbkdf2(password, u.Password));

            if (user == null)
            {
                int nuevosIntentos = (_intentosLogin.TryGetValue(rateKey, out var prev) ? prev.Intentos : 0) + 1;
                DateTime bloqueo = nuevosIntentos >= 5 ? DateTime.UtcNow.AddSeconds(60) : DateTime.MinValue;
                _intentosLogin[rateKey] = (nuevosIntentos, bloqueo);

                return new LoginResponse
                {
                    Exito = false,
                    Mensaje = "Usuario o contraseña inválidos."
                };
            }

            _intentosLogin.Remove(rateKey);
            var token = GenerarTokenFirmado(user);

            return new LoginResponse
            {
                Exito = true,
                Mensaje = $"Bienvenido(a), {user.Nombre}",
                Token = token,
                Usuario = new UsuarioDto
                {
                    Id = user.Id,
                    Username = user.Username,
                    Nombre = user.Nombre,
                    Rol = user.Rol
                }
            };
        }
    }

    public List<Mesa> ObtenerMesas(int? capacidad = null)
    {
        lock (_lock)
        {
            RehidratarMesas();
            var query = _store.Mesas.AsEnumerable();
            if (capacidad.HasValue && capacidad.Value > 0)
            {
                query = query.Where(m => m.Capacidad == capacidad.Value);
            }
            return query.OrderBy(m => m.Numero).ToList();
        }
    }

    public Mesa? ObtenerMesaPorId(int id)
    {
        lock (_lock)
        {
            RehidratarMesas();
            return _store.Mesas.FirstOrDefault(m => m.Id == id);
        }
    }

    public (bool Exito, string Mensaje, Mesa? Mesa) CambiarCapacidadMesa(int mesaId, int nuevaCapacidad, UsuarioDto? operador = null)
    {
        lock (_lock)
        {
            if (nuevaCapacidad != 4 && nuevaCapacidad != 6 && nuevaCapacidad != 10)
                return (false, "La capacidad de la mesa debe ser de 4, 6 o 10 personas.", null);

            var mesa = _store.Mesas.FirstOrDefault(m => m.Id == mesaId);
            if (mesa == null)
                return (false, "Mesa no encontrada.", null);

            mesa.Capacidad = nuevaCapacidad;
            if (mesa.OrdenActiva != null)
            {
                mesa.OrdenActiva.MesaCapacidad = nuevaCapacidad;
            }
            GuardarJsonLocal();
            return (true, $"Capacidad de {mesa.Nombre} actualizada a {nuevaCapacidad} personas.", mesa);
        }
    }

    public (bool Exito, string Mensaje, Mesa? Mesa) AbrirMesa(int mesaId, AbrirMesaRequest req, UsuarioDto? operador = null)
    {
        lock (_lock)
        {
            RehidratarMesas();
            var mesa = _store.Mesas.FirstOrDefault(m => m.Id == mesaId);
            if (mesa == null)
                return (false, "La mesa seleccionada no existe.", null);

            if (mesa.Estado != "Libre" && mesa.OrdenActiva != null)
                return (false, $"La {mesa.Nombre} ya se encuentra ocupada.", mesa);

            int cantAdultos = Math.Clamp(req.CantAdultos, 0, 50);
            int cantNinos = Math.Clamp(req.CantNinos, 0, 50);
            int totalPersonas = cantAdultos + cantNinos;
            if (totalPersonas <= 0)
                return (false, "Debes registrar al menos 1 comensal (Adulto o Niño) para abrir la mesa.", null);

            int nuevoId = (_store.Ordenes.Any() ? _store.Ordenes.Max(o => o.Id) : 100) + 1;
            string nombreMesero = !string.IsNullOrWhiteSpace(req.Mesero)
                ? req.Mesero.Trim()
                : (operador?.Nombre ?? "Carlos Rivera");

            var nuevaOrden = new Orden
            {
                Id = nuevoId,
                Folio = $"ORD-{nuevoId:D4}",
                MesaId = mesa.Id,
                MesaNumero = mesa.Numero,
                MesaCapacidad = mesa.Capacidad,
                Mesero = nombreMesero,
                CantAdultos = cantAdultos,
                PrecioAdulto = PRECIO_ADULTO,
                CantNinos = cantNinos,
                PrecioNino = PRECIO_NINO,
                Notas = req.Notas,
                Estado = "Abierta",
                FechaApertura = DateTime.Now
            };

            RecalcularOrden(nuevaOrden);
            _store.Ordenes.Add(nuevaOrden);

            mesa.Estado = "Ocupada";
            mesa.OrdenActualId = nuevaOrden.Id;
            mesa.OrdenActiva = nuevaOrden;

            GuardarJsonLocal();
            return (true, $"{mesa.Nombre} ({mesa.Zona} · {mesa.Capacidad}p) abierta con {nuevaOrden.CantAdultos} adulto(s) y {nuevaOrden.CantNinos} niño(s).", mesa);
        }
    }

    public (bool Exito, string Mensaje, Mesa? Mesa) ActualizarCuentaMesa(int mesaId, ActualizarCuentaRequest req, UsuarioDto? operador = null)
    {
        lock (_lock)
        {
            RehidratarMesas();
            var mesa = _store.Mesas.FirstOrDefault(m => m.Id == mesaId);
            if (mesa == null || mesa.OrdenActiva == null)
                return (false, "La mesa no tiene una cuenta activa.", null);

            if (req.Descuento > 0 && operador != null && operador.Rol.Equals("Mesero", StringComparison.OrdinalIgnoreCase))
            {
                return (false, "Permiso denegado: Solo Caja o Administración pueden aplicar descuentos.", mesa);
            }

            var orden = mesa.OrdenActiva;
            int nuevosAdultos = Math.Clamp(req.CantAdultos, 0, 50);
            int nuevosNinos = Math.Clamp(req.CantNinos, 0, 50);
            if (nuevosAdultos + nuevosNinos <= 0)
            {
                return (false, "La cuenta activa debe mantener al menos 1 comensal registrado.", mesa);
            }

            orden.CantAdultos = nuevosAdultos;
            orden.CantNinos = nuevosNinos;
            if (!string.IsNullOrWhiteSpace(req.Mesero))
                orden.Mesero = req.Mesero.Trim();
            orden.Descuento = Math.Max(0, req.Descuento);
            orden.Propina = Math.Max(0, req.Propina);
            orden.Notas = req.Notas;

            if (!string.IsNullOrWhiteSpace(req.EstadoMesa) &&
                (req.EstadoMesa == "Ocupada" || req.EstadoMesa == "Por Pagar"))
            {
                mesa.Estado = req.EstadoMesa;
            }

            RecalcularOrden(orden);
            GuardarJsonLocal();
            return (true, $"Cuenta de {mesa.Nombre} actualizada correctamente. Total: ${orden.Total:N2}", mesa);
        }
    }

    public (bool Exito, string Mensaje, Mesa? Mesa) AgregarExtraMesa(int mesaId, AgregarExtraRequest req, UsuarioDto? operador = null)
    {
        lock (_lock)
        {
            RehidratarMesas();
            var mesa = _store.Mesas.FirstOrDefault(m => m.Id == mesaId);
            if (mesa == null || mesa.OrdenActiva == null)
                return (false, "La mesa no tiene una cuenta abierta.", null);

            var prod = _store.ProductosExtra.FirstOrDefault(p => p.Id == req.ProductoId);
            if (prod == null)
                return (false, "El producto extra no existe.", null);

            var orden = mesa.OrdenActiva;
            var existente = orden.Extras.FirstOrDefault(e => e.ProductoId == prod.Id);
            if (existente != null)
            {
                existente.Cantidad += req.Cantidad;
                if (existente.Cantidad <= 0)
                {
                    orden.Extras.Remove(existente);
                }
                else
                {
                    existente.Subtotal = existente.Cantidad * existente.PrecioUnitario;
                }
            }
            else if (req.Cantidad > 0)
            {
                int nextExtraId = orden.Extras.Any() ? orden.Extras.Max(e => e.Id) + 1 : 1;
                orden.Extras.Add(new OrdenExtra
                {
                    Id = nextExtraId,
                    OrdenId = orden.Id,
                    ProductoId = prod.Id,
                    NombreProducto = prod.Nombre,
                    PrecioUnitario = prod.Precio,
                    Cantidad = req.Cantidad,
                    Subtotal = prod.Precio * req.Cantidad
                });
            }

            RecalcularOrden(orden);
            GuardarJsonLocal();
            return (true, $"Consumo extra actualizado en {mesa.Nombre}.", mesa);
        }
    }

    public (bool Exito, string Mensaje, Pago? Pago, Mesa? Mesa) ProcesarPagoMesa(int mesaId, ProcesarPagoRequest req, UsuarioDto? operador = null)
    {
        lock (_lock)
        {
            RehidratarMesas();
            var mesa = _store.Mesas.FirstOrDefault(m => m.Id == mesaId);
            if (mesa == null || mesa.OrdenActiva == null)
                return (false, "Esta mesa no tiene una cuenta pendiente por cobrar.", null, null);

            if (operador != null && operador.Rol.Equals("Mesero", StringComparison.OrdinalIgnoreCase))
            {
                return (false, "Permiso denegado: El perfil Mesero no está autorizado para cobrar cuentas en caja.", null, mesa);
            }

            var orden = mesa.OrdenActiva;
            if (req.Descuento >= 0) orden.Descuento = req.Descuento;
            if (req.Propina >= 0) orden.Propina = req.Propina;
            RecalcularOrden(orden);

            var metodo = string.IsNullOrWhiteSpace(req.MetodoPago) ? "Efectivo" : req.MetodoPago.Trim();
            decimal recibido = req.MontoRecibido;
            if (metodo != "Efectivo" && recibido < orden.Total)
            {
                recibido = orden.Total;
            }

            if (metodo == "Efectivo" && recibido < orden.Total)
            {
                return (false, $"El monto recibido (${recibido:N2}) es menor al total a pagar (${orden.Total:N2}).", null, mesa);
            }

            decimal cambio = recibido - orden.Total;
            int nextPagoId = (_store.Pagos.Any() ? _store.Pagos.Max(p => p.Id) : 0) + 1;

            // El cajero se toma prioritariamente del token verificado en el servidor para evitar suplantación
            string cajeroVerificado = operador?.Nombre
                ?? (string.IsNullOrWhiteSpace(req.Cajero) ? "Caja General" : req.Cajero.Trim());

            var nuevoPago = new Pago
            {
                Id = nextPagoId,
                FolioTicket = $"TCK-{nextPagoId:D4}",
                OrdenId = orden.Id,
                MesaNumero = mesa.Numero,
                MesaCapacidad = mesa.Capacidad,
                CantAdultos = orden.CantAdultos,
                CantNinos = orden.CantNinos,
                SubtotalBuffet = orden.SubtotalBuffet,
                SubtotalExtras = orden.SubtotalExtras,
                Descuento = orden.Descuento,
                Propina = orden.Propina,
                MontoTotal = orden.Total,
                MetodoPago = metodo,
                MontoRecibido = recibido,
                Cambio = cambio,
                Referencia = req.Referencia,
                Cajero = cajeroVerificado,
                FechaPago = DateTime.Now,
                Extras = orden.Extras.Select(e => new OrdenExtra
                {
                    Id = e.Id,
                    OrdenId = e.OrdenId,
                    ProductoId = e.ProductoId,
                    NombreProducto = e.NombreProducto,
                    PrecioUnitario = e.PrecioUnitario,
                    Cantidad = e.Cantidad,
                    Subtotal = e.Subtotal
                }).ToList()
            };

            orden.Estado = "Pagada";
            orden.FechaCierre = DateTime.Now;

            mesa.Estado = "Libre";
            mesa.OrdenActualId = null;
            mesa.OrdenActiva = null;

            _store.Pagos.Insert(0, nuevoPago);

            SincronizarMySqlPago(nuevoPago, orden, mesa);
            GuardarJsonLocal();

            return (true, $"Pago registrado con éxito ({nuevoPago.FolioTicket}). Cambio: ${nuevoPago.Cambio:N2}", nuevoPago, mesa);
        }
    }

    public (bool Exito, string Mensaje, Mesa? Mesa) LiberarMesa(int mesaId, UsuarioDto? operador = null)
    {
        lock (_lock)
        {
            RehidratarMesas();
            var mesa = _store.Mesas.FirstOrDefault(m => m.Id == mesaId);
            if (mesa == null)
                return (false, "La mesa no existe.", null);

            if (mesa.OrdenActiva != null && operador != null && operador.Rol.Equals("Mesero", StringComparison.OrdinalIgnoreCase))
            {
                return (false, "Permiso denegado: Solo Caja o Administración pueden cancelar una mesa con cuenta abierta.", mesa);
            }

            if (mesa.OrdenActiva != null)
            {
                string autor = operador != null ? $"{operador.Nombre} ({operador.Rol})" : "Sistema";
                mesa.OrdenActiva.Estado = "Cancelada";
                mesa.OrdenActiva.FechaCierre = DateTime.Now;
                mesa.OrdenActiva.Notas = $"{mesa.OrdenActiva.Notas} [CANCELADA POR {autor} @ {DateTime.Now:yyyy-MM-dd HH:mm:ss}]".Trim();
            }

            mesa.Estado = "Libre";
            mesa.OrdenActualId = null;
            mesa.OrdenActiva = null;

            GuardarJsonLocal();
            return (true, $"{mesa.Nombre} ha sido liberada y auditada.", mesa);
        }
    }

    public List<Pago> ObtenerPagos(string? metodoPago = null)
    {
        lock (_lock)
        {
            var query = _store.Pagos.AsEnumerable();
            if (!string.IsNullOrWhiteSpace(metodoPago) && !metodoPago.Equals("Todos", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(p => p.MetodoPago.Equals(metodoPago, StringComparison.OrdinalIgnoreCase));
            }
            return query.OrderByDescending(p => p.FechaPago).ToList();
        }
    }

    public Pago? ObtenerPagoPorId(int id)
    {
        lock (_lock)
        {
            return _store.Pagos.FirstOrDefault(p => p.Id == id);
        }
    }

    public List<ProductoExtra> ObtenerProductosExtra()
    {
        lock (_lock)
        {
            return _store.ProductosExtra.Where(p => p.Activo).ToList();
        }
    }

    public CorteCajaResumen ObtenerCorteCaja()
    {
        lock (_lock)
        {
            RehidratarMesas();
            var pagos = _store.Pagos;
            int adultos = pagos.Sum(p => p.CantAdultos);
            int ninos = pagos.Sum(p => p.CantNinos);

            return new CorteCajaResumen
            {
                Fecha = DateTime.Now.ToString("yyyy-MM-dd HH:mm"),
                ModoAlmacenamiento = ModoAlmacenamiento,
                PrecioAdulto = PRECIO_ADULTO,
                PrecioNino = PRECIO_NINO,
                TotalPagosRegistrados = pagos.Count,
                TotalAdultosAtendidos = adultos,
                TotalNinosAtendidos = ninos,
                IngresoBuffetAdultos = adultos * PRECIO_ADULTO,
                IngresoBuffetNinos = ninos * PRECIO_NINO,
                IngresoTotalBuffet = pagos.Sum(p => p.SubtotalBuffet),
                IngresoTotalExtras = pagos.Sum(p => p.SubtotalExtras),
                TotalDescuentos = pagos.Sum(p => p.Descuento),
                TotalPropinas = pagos.Sum(p => p.Propina),
                GranTotalCobrado = pagos.Sum(p => p.MontoTotal),
                TotalEfectivo = pagos.Where(p => p.MetodoPago.Equals("Efectivo", StringComparison.OrdinalIgnoreCase)).Sum(p => p.MontoTotal),
                TotalTarjeta = pagos.Where(p => p.MetodoPago.Equals("Tarjeta", StringComparison.OrdinalIgnoreCase)).Sum(p => p.MontoTotal),
                TotalTransferencia = pagos.Where(p => p.MetodoPago.Equals("Transferencia", StringComparison.OrdinalIgnoreCase)).Sum(p => p.MontoTotal),
                MesasLibres = _store.Mesas.Count(m => m.Estado == "Libre"),
                MesasOcupadas = _store.Mesas.Count(m => m.Estado == "Ocupada"),
                MesasPorPagar = _store.Mesas.Count(m => m.Estado == "Por Pagar"),
                CuentasAbiertasPorCobrar = _store.Mesas.Where(m => m.OrdenActiva != null).Sum(m => m.OrdenActiva!.Total)
            };
        }
    }
}
