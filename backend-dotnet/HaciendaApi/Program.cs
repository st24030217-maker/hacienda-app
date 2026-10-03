using HaciendaApi.Models;
using HaciendaApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Configurar puerto por defecto 5080 para conexión local segura
builder.WebHost.UseUrls("http://localhost:5080");

builder.Services.AddSingleton<RestaurantService>();

// Política CORS restringida únicamente a orígenes locales autorizados
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins(
                  "http://localhost:5080",
                  "http://127.0.0.1:5080",
                  "http://localhost",
                  "http://127.0.0.1",
                  "http://localhost:5173"
              )
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Middleware de Cabeceras de Seguridad HTTP
app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["X-Frame-Options"] = "SAMEORIGIN";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    context.Response.Headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()";
    await next();
});

app.UseCors();
app.UseDefaultFiles();
app.UseStaticFiles();

static UsuarioDto? ObtenerOperador(HttpContext ctx, RestaurantService svc)
{
    var authHeader = ctx.Request.Headers.Authorization.FirstOrDefault();
    return svc.ValidarToken(authHeader);
}

// =============================================================================
// ENDPOINTS REST API (.NET BACKEND BLINDADO)
// =============================================================================

// 1. Estado del servidor y configuración de precios
app.MapGet("/api/status", (RestaurantService svc) => Results.Ok(new
{
    servicio = "La Hacienda - API REST (.NET)",
    version = "1.1.0-sec",
    almacenamiento = svc.ModoAlmacenamiento,
    precios = new
    {
        adulto = RestaurantService.PRECIO_ADULTO,
        nino = RestaurantService.PRECIO_NINO
    },
    capacidadesMesas = new[] { 4, 6, 10 },
    fechaServidor = DateTime.Now
}));

// 2. Autenticación (Login con PBKDF2 + Rate-Limiting + Token HMAC-SHA256)
app.MapPost("/api/auth/login", (HttpContext ctx, LoginRequest req, RestaurantService svc) =>
{
    var ipKey = ctx.Connection.RemoteIpAddress?.ToString() ?? "local";
    var res = svc.Login(req, ipKey);
    return res.Exito ? Results.Ok(res) : Results.BadRequest(res);
});

// 2b. Verificación criptográfica de token activo
app.MapGet("/api/auth/verify", (HttpContext ctx, RestaurantService svc) =>
{
    var operador = ObtenerOperador(ctx, svc);
    if (operador == null)
    {
        return Results.Json(new { exito = false, mensaje = "Sesión expirada o token inválido." }, statusCode: 401);
    }
    return Results.Ok(new { exito = true, usuario = operador });
});

// 3. Resumen general y Corte de Caja
app.MapGet("/api/dashboard", (RestaurantService svc) =>
{
    return Results.Ok(new
    {
        corte = svc.ObtenerCorteCaja(),
        mesas = svc.ObtenerMesas(),
        ultimosPagos = svc.ObtenerPagos().Take(10),
        productosExtra = svc.ObtenerProductosExtra()
    });
});

// 4. Listar Mesas (todas o filtradas por capacidad: 4, 6 o 10)
app.MapGet("/api/mesas", (int? capacidad, RestaurantService svc) =>
{
    return Results.Ok(svc.ObtenerMesas(capacidad));
});

// 5. Detalle de una mesa
app.MapGet("/api/mesas/{id:int}", (int id, RestaurantService svc) =>
{
    var mesa = svc.ObtenerMesaPorId(id);
    return mesa != null ? Results.Ok(mesa) : Results.NotFound(new { exito = false, mensaje = "Mesa no encontrada" });
});

// 6. Abrir mesa con conteo de Buffet Adulto ($280) y Niño ($180)
app.MapPost("/api/mesas/{id:int}/abrir", (int id, AbrirMesaRequest req, HttpContext ctx, RestaurantService svc) =>
{
    var operador = ObtenerOperador(ctx, svc);
    if (operador == null)
        return Results.Json(new { exito = false, mensaje = "Debes iniciar sesión para abrir una mesa." }, statusCode: 401);

    var res = svc.AbrirMesa(id, req, operador);
    return res.Exito
        ? Results.Ok(new { exito = true, mensaje = res.Mensaje, mesa = res.Mesa })
        : Results.BadRequest(new { exito = false, mensaje = res.Mensaje });
});

// 7. Actualizar cuenta de mesa (Adultos, Niños, Propina, Descuento, Estado)
app.MapPut("/api/mesas/{id:int}/actualizar", (int id, ActualizarCuentaRequest req, HttpContext ctx, RestaurantService svc) =>
{
    var operador = ObtenerOperador(ctx, svc);
    if (operador == null)
        return Results.Json(new { exito = false, mensaje = "Debes iniciar sesión para modificar una cuenta." }, statusCode: 401);

    var res = svc.ActualizarCuentaMesa(id, req, operador);
    return res.Exito
        ? Results.Ok(new { exito = true, mensaje = res.Mensaje, mesa = res.Mesa })
        : Results.BadRequest(new { exito = false, mensaje = res.Mensaje });
});

// 7b. Cambiar capacidad de mesa (4, 6 o 10 personas)
app.MapPut("/api/mesas/{id:int}/capacidad", (int id, int capacidad, HttpContext ctx, RestaurantService svc) =>
{
    var operador = ObtenerOperador(ctx, svc);
    if (operador == null)
        return Results.Json(new { exito = false, mensaje = "Debes iniciar sesión para cambiar la capacidad de una mesa." }, statusCode: 401);

    var res = svc.CambiarCapacidadMesa(id, capacidad, operador);
    return res.Exito
        ? Results.Ok(new { exito = true, mensaje = res.Mensaje, mesa = res.Mesa })
        : Results.BadRequest(new { exito = false, mensaje = res.Mensaje });
});

// 8. Agregar o quitar Consumo Extra (Bebidas / Postres)
app.MapPost("/api/mesas/{id:int}/extras", (int id, AgregarExtraRequest req, HttpContext ctx, RestaurantService svc) =>
{
    var operador = ObtenerOperador(ctx, svc);
    if (operador == null)
        return Results.Json(new { exito = false, mensaje = "Debes iniciar sesión para modificar consumos extra." }, statusCode: 401);

    var res = svc.AgregarExtraMesa(id, req, operador);
    return res.Exito
        ? Results.Ok(new { exito = true, mensaje = res.Mensaje, mesa = res.Mesa })
        : Results.BadRequest(new { exito = false, mensaje = res.Mensaje });
});

// 9. Cobrar cuenta de la mesa y registrar en Reflejo de Pagos (Solo Cajero / Administrador)
app.MapPost("/api/mesas/{id:int}/pagar", (int id, ProcesarPagoRequest req, HttpContext ctx, RestaurantService svc) =>
{
    var operador = ObtenerOperador(ctx, svc);
    if (operador == null)
        return Results.Json(new { exito = false, mensaje = "Debes iniciar sesión con perfil autorizado para cobrar cuentas." }, statusCode: 401);

    var res = svc.ProcesarPagoMesa(id, req, operador);
    return res.Exito
        ? Results.Ok(new { exito = true, mensaje = res.Mensaje, pago = res.Pago, mesa = res.Mesa })
        : Results.BadRequest(new { exito = false, mensaje = res.Mensaje });
});

// 10. Liberar / Cancelar mesa (Solo Cajero / Administrador cuando hay cuenta abierta)
app.MapPost("/api/mesas/{id:int}/liberar", (int id, HttpContext ctx, RestaurantService svc) =>
{
    var operador = ObtenerOperador(ctx, svc);
    if (operador == null)
        return Results.Json(new { exito = false, mensaje = "Debes iniciar sesión para liberar una mesa." }, statusCode: 401);

    var res = svc.LiberarMesa(id, operador);
    return res.Exito
        ? Results.Ok(new { exito = true, mensaje = res.Mensaje, mesa = res.Mesa })
        : Results.BadRequest(new { exito = false, mensaje = res.Mensaje });
});

// 11. Reflejo de Pagos / Historial y Corte de Caja
app.MapGet("/api/pagos", (string? metodo, RestaurantService svc) =>
{
    return Results.Ok(new
    {
        resumen = svc.ObtenerCorteCaja(),
        pagos = svc.ObtenerPagos(metodo)
    });
});

// 12. Consultar un Ticket específico por ID
app.MapGet("/api/pagos/{id:int}", (int id, RestaurantService svc) =>
{
    var pago = svc.ObtenerPagoPorId(id);
    return pago != null ? Results.Ok(pago) : Results.NotFound(new { exito = false, mensaje = "Pago no encontrado" });
});

// 13. Catálogo de Productos Extra
app.MapGet("/api/extras", (RestaurantService svc) =>
{
    return Results.Ok(svc.ObtenerProductosExtra());
});

app.Run();
