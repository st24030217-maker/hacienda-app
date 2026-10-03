namespace HaciendaApi.Models;

public class Usuario
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Rol { get; set; } = "Cajero";
    public bool Activo { get; set; } = true;
}

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class LoginResponse
{
    public bool Exito { get; set; }
    public string Mensaje { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public UsuarioDto? Usuario { get; set; }
}

public class UsuarioDto
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
}

public class Mesa
{
    public int Id { get; set; }
    public int Numero { get; set; }
    public string Nombre { get; set; } = string.Empty;
    /// <summary>Capacidad de la mesa: 4, 6 o 10 personas</summary>
    public int Capacidad { get; set; }
    public string Zona { get; set; } = "Salón Principal";
    /// <summary>Estado: Libre, Ocupada, Por Pagar</summary>
    public string Estado { get; set; } = "Libre";
    public int? OrdenActualId { get; set; }
    public Orden? OrdenActiva { get; set; }
}

public class ProductoExtra
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Categoria { get; set; } = "Bebida";
    public decimal Precio { get; set; }
    public bool Activo { get; set; } = true;
}

public class OrdenExtra
{
    public int Id { get; set; }
    public int OrdenId { get; set; }
    public int ProductoId { get; set; }
    public string NombreProducto { get; set; } = string.Empty;
    public decimal PrecioUnitario { get; set; }
    public int Cantidad { get; set; }
    public decimal Subtotal { get; set; }
}

public class Orden
{
    public int Id { get; set; }
    public string Folio { get; set; } = string.Empty;
    public int MesaId { get; set; }
    public int MesaNumero { get; set; }
    public int MesaCapacidad { get; set; }
    public string Mesero { get; set; } = "General";
    public int CantAdultos { get; set; }
    public decimal PrecioAdulto { get; set; } = 280.00m;
    public int CantNinos { get; set; }
    public decimal PrecioNino { get; set; } = 180.00m;
    public decimal SubtotalBuffet { get; set; }
    public decimal SubtotalExtras { get; set; }
    public decimal Descuento { get; set; }
    public decimal Propina { get; set; }
    public decimal Total { get; set; }
    public string? Notas { get; set; }
    public string Estado { get; set; } = "Abierta";
    public DateTime FechaApertura { get; set; } = DateTime.Now;
    public DateTime? FechaCierre { get; set; }
    public List<OrdenExtra> Extras { get; set; } = new();
}

public class Pago
{
    public int Id { get; set; }
    public string FolioTicket { get; set; } = string.Empty;
    public int OrdenId { get; set; }
    public int MesaNumero { get; set; }
    public int MesaCapacidad { get; set; }
    public int CantAdultos { get; set; }
    public int CantNinos { get; set; }
    public decimal SubtotalBuffet { get; set; }
    public decimal SubtotalExtras { get; set; }
    public decimal Descuento { get; set; }
    public decimal Propina { get; set; }
    public decimal MontoTotal { get; set; }
    /// <summary>Efectivo, Tarjeta, Transferencia</summary>
    public string MetodoPago { get; set; } = "Efectivo";
    public decimal MontoRecibido { get; set; }
    public decimal Cambio { get; set; }
    public string? Referencia { get; set; }
    public string Cajero { get; set; } = "Caja General";
    public DateTime FechaPago { get; set; } = DateTime.Now;
    public List<OrdenExtra> Extras { get; set; } = new();
}

public class AbrirMesaRequest
{
    public int CantAdultos { get; set; }
    public int CantNinos { get; set; }
    public string Mesero { get; set; } = "Carlos Rivera";
    public string? Notas { get; set; }
}

public class ActualizarCuentaRequest
{
    public int CantAdultos { get; set; }
    public int CantNinos { get; set; }
    public string? Mesero { get; set; }
    public decimal Descuento { get; set; }
    public decimal Propina { get; set; }
    public string? Notas { get; set; }
    public string? EstadoMesa { get; set; }
}

public class AgregarExtraRequest
{
    public int ProductoId { get; set; }
    public int Cantidad { get; set; } = 1;
}

public class ProcesarPagoRequest
{
    public string MetodoPago { get; set; } = "Efectivo";
    public decimal MontoRecibido { get; set; }
    public decimal Propina { get; set; }
    public decimal Descuento { get; set; }
    public string? Referencia { get; set; }
    public string Cajero { get; set; } = "Caja Principal";
}

public class CorteCajaResumen
{
    public string Fecha { get; set; } = DateTime.Now.ToString("yyyy-MM-dd");
    public string ModoAlmacenamiento { get; set; } = "MySQL";
    public decimal PrecioAdulto { get; set; } = 280.00m;
    public decimal PrecioNino { get; set; } = 180.00m;
    public int TotalPagosRegistrados { get; set; }
    public int TotalAdultosAtendidos { get; set; }
    public int TotalNinosAtendidos { get; set; }
    public int TotalComensales => TotalAdultosAtendidos + TotalNinosAtendidos;
    public decimal IngresoBuffetAdultos { get; set; }
    public decimal IngresoBuffetNinos { get; set; }
    public decimal IngresoTotalBuffet { get; set; }
    public decimal IngresoTotalExtras { get; set; }
    public decimal TotalDescuentos { get; set; }
    public decimal TotalPropinas { get; set; }
    public decimal GranTotalCobrado { get; set; }
    public decimal TotalEfectivo { get; set; }
    public decimal TotalTarjeta { get; set; }
    public decimal TotalTransferencia { get; set; }
    public int MesasLibres { get; set; }
    public int MesasOcupadas { get; set; }
    public int MesasPorPagar { get; set; }
    public decimal CuentasAbiertasPorCobrar { get; set; }
}

public class StoreData
{
    public List<Usuario> Usuarios { get; set; } = new();
    public List<Mesa> Mesas { get; set; } = new();
    public List<ProductoExtra> ProductosExtra { get; set; } = new();
    public List<Orden> Ordenes { get; set; } = new();
    public List<Pago> Pagos { get; set; } = new();
}
