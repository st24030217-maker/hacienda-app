-- =============================================================================
-- SISTEMA DE GESTIÓN RESTAURANTE BUFFET "LA HACIENDA"
-- Base de Datos: MySQL / MariaDB (Compatible con XAMPP / Laragon / MySQL Workbench)
-- Precios Buffet: Adulto $280.00 MXN | Niño $180.00 MXN
-- Capacidades de Mesas: 4, 6 y 10 personas
-- =============================================================================

CREATE DATABASE IF NOT EXISTS hacienda_buffet
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hacienda_buffet;

-- -----------------------------------------------------------------------------
-- 1. Tabla de Usuarios (Login y Roles)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    rol ENUM('Administrador', 'Cajero', 'Mesero') NOT NULL DEFAULT 'Cajero',
    activo TINYINT(1) NOT NULL DEFAULT 1,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 2. Tabla de Mesas (Capacidades de 4, 6 y 10 personas)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mesas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    numero INT NOT NULL UNIQUE,
    nombre VARCHAR(50) NOT NULL,
    capacidad INT NOT NULL COMMENT 'Capacidad de 4, 6 o 10 personas',
    zona VARCHAR(50) NOT NULL DEFAULT 'Salón Principal',
    estado ENUM('Libre', 'Ocupada', 'Por Pagar') NOT NULL DEFAULT 'Libre',
    orden_actual_id INT NULL
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 3. Catálogo de Consumo Extra (Bebidas y Postres fuera del buffet)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS productos_extra (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoria ENUM('Bebida', 'Postre', 'Especial') NOT NULL DEFAULT 'Bebida',
    precio DECIMAL(10, 2) NOT NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 4. Tabla de Órdenes / Cuentas por Mesa
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ordenes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    folio VARCHAR(30) NOT NULL UNIQUE,
    mesa_id INT NOT NULL,
    mesa_numero INT NOT NULL,
    mesa_capacidad INT NOT NULL,
    mesero VARCHAR(100) NOT NULL DEFAULT 'General',
    cant_adultos INT NOT NULL DEFAULT 0,
    precio_adulto DECIMAL(10, 2) NOT NULL DEFAULT 280.00,
    cant_ninos INT NOT NULL DEFAULT 0,
    precio_nino DECIMAL(10, 2) NOT NULL DEFAULT 180.00,
    subtotal_buffet DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    subtotal_extras DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    descuento DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    propina DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    notas VARCHAR(255) NULL,
    estado ENUM('Abierta', 'Pagada', 'Cancelada') NOT NULL DEFAULT 'Abierta',
    fecha_apertura DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_cierre DATETIME NULL,
    CONSTRAINT fk_orden_mesa FOREIGN KEY (mesa_id) REFERENCES mesas(id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 5. Detalle de Consumo Extra por Orden
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orden_extras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    orden_id INT NOT NULL,
    producto_id INT NOT NULL,
    nombre_producto VARCHAR(100) NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    cantidad INT NOT NULL DEFAULT 1,
    subtotal DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_extra_orden FOREIGN KEY (orden_id) REFERENCES ordenes(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- 6. Tabla de Reflejo de Pagos / Historial de Cobros
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pagos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    folio_ticket VARCHAR(30) NOT NULL UNIQUE,
    orden_id INT NOT NULL,
    mesa_numero INT NOT NULL,
    mesa_capacidad INT NOT NULL,
    cant_adultos INT NOT NULL DEFAULT 0,
    cant_ninos INT NOT NULL DEFAULT 0,
    subtotal_buffet DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    subtotal_extras DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    descuento DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    propina DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    monto_total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    metodo_pago ENUM('Efectivo', 'Tarjeta', 'Transferencia') NOT NULL DEFAULT 'Efectivo',
    monto_recibido DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    cambio DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    referencia VARCHAR(100) NULL,
    cajero VARCHAR(100) NOT NULL,
    fecha_pago DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pago_orden FOREIGN KEY (orden_id) REFERENCES ordenes(id)
) ENGINE=InnoDB;

-- =============================================================================
-- DATOS SEMILLA (SEED DATA)
-- =============================================================================

-- Usuarios por defecto
INSERT IGNORE INTO usuarios (id, username, password, nombre, rol) VALUES
(1, 'admin', 'admin123', 'Administrador General', 'Administrador'),
(2, 'cajero', 'cajero123', 'Laura Méndez (Caja)', 'Cajero'),
(3, 'mesero', 'mesero123', 'Carlos Rivera (Piso)', 'Mesero');

-- Mesas del restaurante según plano arquitectónico (23 mesas de 4, 6 y 10 personas)
INSERT IGNORE INTO mesas (id, numero, nombre, capacidad, zona, estado) VALUES
-- Pasillo superior (7 mesas)
(1,  1,  'Mesa 1',  6,  'Pasillo superior', 'Libre'),
(2,  2,  'Mesa 2',  6,  'Pasillo superior', 'Libre'),
(3,  3,  'Mesa 3',  10, 'Pasillo superior', 'Libre'),
(4,  4,  'Mesa 4',  10, 'Pasillo superior', 'Libre'),
(5,  5,  'Mesa 5',  10, 'Pasillo superior', 'Libre'),
(6,  6,  'Mesa 6',  6,  'Pasillo superior', 'Libre'),
(7,  7,  'Mesa 7',  6,  'Pasillo superior', 'Libre'),
-- Pasillo lateral izquierdo (4 mesas)
(8,  8,  'Mesa 8',  4,  'Pasillo lateral izquierdo', 'Libre'),
(9,  9,  'Mesa 9',  4,  'Pasillo lateral izquierdo', 'Libre'),
(10, 10, 'Mesa 10', 6,  'Pasillo lateral izquierdo', 'Libre'),
(11, 11, 'Mesa 11', 6,  'Pasillo lateral izquierdo', 'Libre'),
-- Pasillo lateral derecho (4 mesas)
(12, 12, 'Mesa 12', 4,  'Pasillo lateral derecho', 'Libre'),
(13, 13, 'Mesa 13', 4,  'Pasillo lateral derecho', 'Libre'),
(14, 14, 'Mesa 14', 6,  'Pasillo lateral derecho', 'Libre'),
(15, 15, 'Mesa 15', 6,  'Pasillo lateral derecho', 'Libre'),
-- Acceso / Cuarto trasero (8 mesas en cuadrícula 4x2)
(16, 16, 'Mesa 16', 4,  'Acceso / Cuarto trasero', 'Libre'),
(17, 17, 'Mesa 17', 4,  'Acceso / Cuarto trasero', 'Libre'),
(18, 18, 'Mesa 18', 4,  'Acceso / Cuarto trasero', 'Libre'),
(19, 19, 'Mesa 19', 4,  'Acceso / Cuarto trasero', 'Libre'),
(20, 20, 'Mesa 20', 4,  'Acceso / Cuarto trasero', 'Libre'),
(21, 21, 'Mesa 21', 4,  'Acceso / Cuarto trasero', 'Libre'),
(22, 22, 'Mesa 22', 10, 'Acceso / Cuarto trasero', 'Libre'),
(23, 23, 'Mesa 23', 10, 'Acceso / Cuarto trasero', 'Libre');

-- Catálogo de Consumo Extra
INSERT IGNORE INTO productos_extra (id, nombre, categoria, precio) VALUES
(1, 'Refresco lata 355ml', 'Bebida', 35.00),
(2, 'Jarra de Agua Fresca (2L)', 'Bebida', 95.00),
(3, 'Vaso de Agua del Día', 'Bebida', 30.00),
(4, 'Cerveza Nacional', 'Bebida', 55.00),
(5, 'Cerveza Artesanal', 'Bebida', 80.00),
(6, 'Café de Olla Refill', 'Bebida', 40.00),
(7, 'Limonada / Naranjada Mineral', 'Bebida', 45.00),
(8, 'Postre Especial (Pastel de Elote)', 'Postre', 65.00),
(9, 'Flan Napolitano de la Casa', 'Postre', 55.00),
(10, 'Paquete Cumpleaños (Pastelito + Vela)', 'Especial', 120.00);
