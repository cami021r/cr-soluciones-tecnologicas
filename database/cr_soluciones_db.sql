-- ============================================================
-- C&R SOLUCIONES TECNOLÓGICAS — Base de Datos Completa
-- Motor: MySQL 8.0+
-- Creado: 2026
-- ============================================================

CREATE DATABASE IF NOT EXISTS cr_soluciones
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE cr_soluciones;

-- ============================================================
-- MÓDULO 1: USUARIOS Y SEGURIDAD
-- ============================================================

CREATE TABLE roles (
  id          INT           NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(50)   NOT NULL,
  descripcion VARCHAR(150),
  PRIMARY KEY (id)
);

CREATE TABLE usuarios (
  id             INT          NOT NULL AUTO_INCREMENT,
  rol_id         INT          NOT NULL,
  nombre         VARCHAR(100) NOT NULL,
  apellido       VARCHAR(100) NOT NULL,
  email          VARCHAR(150) NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,
  telefono       VARCHAR(20),
  activo         BOOLEAN      NOT NULL DEFAULT TRUE,
  creado_en      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME     ON UPDATE CURRENT_TIMESTAMP,
  eliminado_en   DATETIME     DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_usuarios_email (email),
  CONSTRAINT fk_usuarios_rol FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- ============================================================
-- MÓDULO 2: CLIENTES
-- ============================================================

CREATE TABLE clientes (
  id             INT          NOT NULL AUTO_INCREMENT,
  usuario_id     INT          NOT NULL,
  nombre_empresa VARCHAR(150),
  tipo           ENUM('persona','empresa') NOT NULL DEFAULT 'persona',
  documento      VARCHAR(20)  NOT NULL,
  telefono_alt   VARCHAR(20),
  creado_en      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  eliminado_en   DATETIME     DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_clientes_documento (documento),
  CONSTRAINT fk_clientes_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE direcciones_cliente (
  id         INT          NOT NULL AUTO_INCREMENT,
  cliente_id INT          NOT NULL,
  direccion  VARCHAR(200) NOT NULL,
  ciudad     VARCHAR(100) NOT NULL DEFAULT 'Bogotá',
  principal  BOOLEAN      NOT NULL DEFAULT FALSE,
  PRIMARY KEY (id),
  CONSTRAINT fk_dir_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- ============================================================
-- MÓDULO 3: INVENTARIO FÍSICO
-- ============================================================

CREATE TABLE categorias_equipo (
  id          INT          NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(100) NOT NULL,
  descripcion VARCHAR(200),
  PRIMARY KEY (id)
);

CREATE TABLE equipos (
  id             INT          NOT NULL AUTO_INCREMENT,
  categoria_id   INT          NOT NULL,
  numero_serie   VARCHAR(100) NOT NULL,
  marca          VARCHAR(100) NOT NULL,
  modelo         VARCHAR(100) NOT NULL,
  descripcion    TEXT,
  estado         ENUM('disponible','rentado','en_bodega','en_mantenimiento')
                 NOT NULL DEFAULT 'disponible',
  fecha_compra   DATE,
  garantia_hasta DATE,
  qr_codigo      VARCHAR(255),
  creado_en      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  eliminado_en   DATETIME     DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_equipos_serie (numero_serie),
  CONSTRAINT fk_equipos_categoria FOREIGN KEY (categoria_id) REFERENCES categorias_equipo(id)
);

CREATE TABLE fotos_equipo (
  id           INT          NOT NULL AUTO_INCREMENT,
  equipo_id    INT          NOT NULL,
  url_foto     VARCHAR(500) NOT NULL,
  es_principal BOOLEAN      NOT NULL DEFAULT FALSE,
  creado_en    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_fotos_equipo FOREIGN KEY (equipo_id) REFERENCES equipos(id)
);

CREATE TABLE historial_movimientos_equipo (
  id              INT          NOT NULL AUTO_INCREMENT,
  equipo_id       INT          NOT NULL,
  usuario_id      INT          NOT NULL,
  estado_anterior VARCHAR(50),
  estado_nuevo    VARCHAR(50)  NOT NULL,
  observacion     TEXT,
  fecha           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_mov_equipo   FOREIGN KEY (equipo_id)  REFERENCES equipos(id),
  CONSTRAINT fk_mov_usuario  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- ============================================================
-- MÓDULO 4: CATÁLOGO DE CONOCIMIENTO
-- ============================================================

CREATE TABLE proveedores (
  id        INT          NOT NULL AUTO_INCREMENT,
  nombre    VARCHAR(150) NOT NULL,
  contacto  VARCHAR(100),
  telefono  VARCHAR(20),
  email     VARCHAR(150),
  activo    BOOLEAN      NOT NULL DEFAULT TRUE,
  creado_en DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

CREATE TABLE servicios_catalogo (
  id               INT            NOT NULL AUTO_INCREMENT,
  nombre           VARCHAR(150)   NOT NULL,
  descripcion      TEXT,
  precio_mano_obra DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  horas_estimadas  DECIMAL(5,2)   NOT NULL DEFAULT 1.00,
  activo           BOOLEAN        NOT NULL DEFAULT TRUE,
  creado_en        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  eliminado_en     DATETIME       DEFAULT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE preguntas_clave_servicio (
  id             INT          NOT NULL AUTO_INCREMENT,
  servicio_id    INT          NOT NULL,
  pregunta       VARCHAR(300) NOT NULL,
  tipo_respuesta ENUM('numero','texto','si_no','seleccion') NOT NULL DEFAULT 'texto',
  obligatoria    BOOLEAN      NOT NULL DEFAULT TRUE,
  orden          INT          NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  CONSTRAINT fk_preguntas_servicio FOREIGN KEY (servicio_id) REFERENCES servicios_catalogo(id)
);

CREATE TABLE productos_externos (
  id                  INT            NOT NULL AUTO_INCREMENT,
  proveedor_id        INT            NOT NULL,
  nombre              VARCHAR(150)   NOT NULL,
  descripcion         TEXT,
  costo_proveedor     DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  margen_ganancia     DECIMAL(5,2)   NOT NULL DEFAULT 0.30,
  tiempo_entrega_dias INT            NOT NULL DEFAULT 1,
  stock_disponible    INT            NOT NULL DEFAULT 0,
  activo              BOOLEAN        NOT NULL DEFAULT TRUE,
  creado_en           DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  eliminado_en        DATETIME       DEFAULT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_productos_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
);

-- ============================================================
-- MÓDULO 5: CHAT Y COTIZACIONES
-- ============================================================

CREATE TABLE conversaciones_chat (
  id         INT      NOT NULL AUTO_INCREMENT,
  cliente_id INT      NOT NULL,
  estado     ENUM('activa','cerrada','cotizacion_generada') NOT NULL DEFAULT 'activa',
  creado_en  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_conv_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE TABLE mensajes_chat (
  id               INT      NOT NULL AUTO_INCREMENT,
  conversacion_id  INT      NOT NULL,
  rol              ENUM('user','assistant') NOT NULL,
  contenido        TEXT     NOT NULL,
  creado_en        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_msg_conversacion FOREIGN KEY (conversacion_id) REFERENCES conversaciones_chat(id)
);

CREATE TABLE cotizaciones (
  id               INT            NOT NULL AUTO_INCREMENT,
  cliente_id       INT            NOT NULL,
  conversacion_id  INT            DEFAULT NULL,
  subtotal         DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  total            DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  estado           ENUM('pendiente','aceptada','rechazada','ajuste_solicitado')
                   NOT NULL DEFAULT 'pendiente',
  url_pdf          VARCHAR(500)   DEFAULT NULL,
  fecha_vencimiento DATE,
  creado_en        DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  eliminado_en     DATETIME       DEFAULT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_cot_cliente       FOREIGN KEY (cliente_id)      REFERENCES clientes(id),
  CONSTRAINT fk_cot_conversacion  FOREIGN KEY (conversacion_id) REFERENCES conversaciones_chat(id)
);

CREATE TABLE items_cotizacion (
  id              INT            NOT NULL AUTO_INCREMENT,
  cotizacion_id   INT            NOT NULL,
  tipo_item       ENUM('servicio','producto') NOT NULL,
  servicio_id     INT            DEFAULT NULL,
  producto_id     INT            DEFAULT NULL,
  descripcion     VARCHAR(300)   NOT NULL,
  cantidad        DECIMAL(8,2)   NOT NULL DEFAULT 1.00,
  precio_unitario DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  subtotal        DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  PRIMARY KEY (id),
  CONSTRAINT fk_items_cotizacion FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones(id),
  CONSTRAINT fk_items_servicio   FOREIGN KEY (servicio_id)   REFERENCES servicios_catalogo(id),
  CONSTRAINT fk_items_producto   FOREIGN KEY (producto_id)   REFERENCES productos_externos(id)
);

-- ============================================================
-- MÓDULO 6: CONTRATOS
-- ============================================================

CREATE TABLE contratos (
  id                INT            NOT NULL AUTO_INCREMENT,
  cliente_id        INT            NOT NULL,
  cotizacion_id     INT            DEFAULT NULL,
  tipo              ENUM('renta','compra') NOT NULL,
  fecha_inicio      DATE           NOT NULL,
  fecha_vencimiento DATE           DEFAULT NULL,
  valor_total       DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  estado            ENUM('activo','vencido','cancelado','finalizado')
                    NOT NULL DEFAULT 'activo',
  observaciones     TEXT,
  creado_en         DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  eliminado_en      DATETIME       DEFAULT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_contratos_cliente     FOREIGN KEY (cliente_id)    REFERENCES clientes(id),
  CONSTRAINT fk_contratos_cotizacion  FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones(id)
);

CREATE TABLE equipos_contrato (
  id             INT            NOT NULL AUTO_INCREMENT,
  contrato_id    INT            NOT NULL,
  equipo_id      INT            NOT NULL,
  valor_unitario DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  PRIMARY KEY (id),
  CONSTRAINT fk_eq_cont_contrato FOREIGN KEY (contrato_id) REFERENCES contratos(id),
  CONSTRAINT fk_eq_cont_equipo   FOREIGN KEY (equipo_id)   REFERENCES equipos(id)
);

-- ============================================================
-- MÓDULO 7: TICKETS DE SOPORTE
-- ============================================================

CREATE TABLE tickets (
  id          INT          NOT NULL AUTO_INCREMENT,
  cliente_id  INT          NOT NULL,
  equipo_id   INT          DEFAULT NULL,
  tecnico_id  INT          DEFAULT NULL,
  titulo      VARCHAR(200) NOT NULL,
  descripcion TEXT         NOT NULL,
  prioridad   ENUM('baja','media','alta') NOT NULL DEFAULT 'media',
  estado      ENUM('abierto','en_proceso','resuelto','cerrado')
              NOT NULL DEFAULT 'abierto',
  creado_en   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cerrado_en  DATETIME     DEFAULT NULL,
  eliminado_en DATETIME    DEFAULT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_tickets_cliente  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  CONSTRAINT fk_tickets_equipo   FOREIGN KEY (equipo_id)  REFERENCES equipos(id),
  CONSTRAINT fk_tickets_tecnico  FOREIGN KEY (tecnico_id) REFERENCES usuarios(id)
);

CREATE TABLE comentarios_ticket (
  id          INT      NOT NULL AUTO_INCREMENT,
  ticket_id   INT      NOT NULL,
  usuario_id  INT      NOT NULL,
  contenido   TEXT     NOT NULL,
  es_interno  BOOLEAN  NOT NULL DEFAULT FALSE,
  creado_en   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_com_ticket  FOREIGN KEY (ticket_id)  REFERENCES tickets(id),
  CONSTRAINT fk_com_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- ============================================================
-- MÓDULO 8: MOTOR FINANCIERO
-- ============================================================

CREATE TABLE categorias_financieras (
  id          INT          NOT NULL AUTO_INCREMENT,
  nombre      VARCHAR(100) NOT NULL,
  tipo        ENUM('ingreso','gasto') NOT NULL,
  descripcion VARCHAR(200),
  PRIMARY KEY (id)
);

CREATE TABLE transacciones_financieras (
  id            INT            NOT NULL AUTO_INCREMENT,
  categoria_id  INT            NOT NULL,
  cotizacion_id INT            DEFAULT NULL,
  descripcion   VARCHAR(300)   NOT NULL,
  monto         DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  tipo          ENUM('ingreso','gasto') NOT NULL,
  es_fijo       BOOLEAN        NOT NULL DEFAULT FALSE,
  fecha         DATE           NOT NULL,
  creado_en     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_trans_categoria  FOREIGN KEY (categoria_id)  REFERENCES categorias_financieras(id),
  CONSTRAINT fk_trans_cotizacion FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones(id)
);

CREATE TABLE proyecciones_mensuales (
  id                  INT            NOT NULL AUTO_INCREMENT,
  mes                 INT            NOT NULL,
  anio                INT            NOT NULL,
  ingreso_proyectado  DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  gasto_proyectado    DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  ingreso_real        DECIMAL(10,2)  DEFAULT NULL,
  gasto_real          DECIMAL(10,2)  DEFAULT NULL,
  creado_en           DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_proyeccion_mes_anio (mes, anio)
);

-- ============================================================
-- MÓDULO 9: NOTIFICACIONES
-- ============================================================

CREATE TABLE log_notificaciones (
  id          INT          NOT NULL AUTO_INCREMENT,
  usuario_id  INT          NOT NULL,
  tipo_evento VARCHAR(100) NOT NULL,
  canal       ENUM('telegram','email') NOT NULL,
  mensaje     TEXT         NOT NULL,
  estado      ENUM('enviado','fallido','reintentando') NOT NULL DEFAULT 'enviado',
  intentos    INT          NOT NULL DEFAULT 1,
  creado_en   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  CONSTRAINT fk_notif_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- ============================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ============================================================

CREATE INDEX idx_equipos_estado        ON equipos(estado);
CREATE INDEX idx_equipos_categoria     ON equipos(categoria_id);
CREATE INDEX idx_tickets_estado        ON tickets(estado);
CREATE INDEX idx_tickets_prioridad     ON tickets(prioridad);
CREATE INDEX idx_tickets_cliente       ON tickets(cliente_id);
CREATE INDEX idx_cotizaciones_estado   ON cotizaciones(estado);
CREATE INDEX idx_cotizaciones_cliente  ON cotizaciones(cliente_id);
CREATE INDEX idx_transacciones_fecha   ON transacciones_financieras(fecha);
CREATE INDEX idx_transacciones_tipo    ON transacciones_financieras(tipo);
CREATE INDEX idx_contratos_estado      ON contratos(estado);
CREATE INDEX idx_contratos_vencimiento ON contratos(fecha_vencimiento);
CREATE INDEX idx_mov_equipo_fecha      ON historial_movimientos_equipo(equipo_id, fecha);
CREATE INDEX idx_mensajes_conv         ON mensajes_chat(conversacion_id);

-- ============================================================
-- DATOS DE PRUEBA (SEEDERS)
-- ============================================================

-- Roles
INSERT INTO roles (nombre, descripcion) VALUES
  ('Administrador', 'Acceso total al sistema'),
  ('Técnico',       'Gestión de tickets y equipos asignados'),
  ('Cliente',       'Acceso al portal personal del cliente');

-- Usuarios (contraseña: Test1234! - hash bcrypt de ejemplo)
INSERT INTO usuarios (rol_id, nombre, apellido, email, password_hash, telefono) VALUES
  (1, 'Camila',  'Quintero', 'admin@crsoluciones.com',    '$2b$12$ejemplo_hash_admin',    '3115389889'),
  (3, 'Carlos',  'Mendoza',  'carlos@empresa.com',        '$2b$12$ejemplo_hash_cliente1', '3001234567'),
  (3, 'María',   'López',    'maria@hogar.com',           '$2b$12$ejemplo_hash_cliente2', '3109876543'),
  (3, 'Empresa', 'Tech SAS', 'contacto@techsas.com',     '$2b$12$ejemplo_hash_cliente3', '6017001122');

-- Clientes
INSERT INTO clientes (usuario_id, nombre_empresa, tipo, documento) VALUES
  (2, NULL,         'persona',  '1020304050'),
  (3, NULL,         'persona',  '1060708090'),
  (4, 'Tech SAS',   'empresa',  '900123456-1');

-- Direcciones
INSERT INTO direcciones_cliente (cliente_id, direccion, ciudad, principal) VALUES
  (1, 'Calle 80 # 45-20 Apto 301', 'Bogotá', TRUE),
  (2, 'Carrera 15 # 100-50 Casa 5', 'Bogotá', TRUE),
  (3, 'Av. El Dorado # 68-90 Of. 402', 'Bogotá', TRUE);

-- Categorías de equipos
INSERT INTO categorias_equipo (nombre, descripcion) VALUES
  ('Cámara de seguridad', 'Dispositivos de vigilancia IP y análogos'),
  ('Switch',              'Equipos de conmutación de red'),
  ('Router',              'Equipos de enrutamiento y conectividad'),
  ('Computador',          'Equipos de cómputo de escritorio y portátiles'),
  ('Cable estructurado',  'Rollos de cable UTP/FTP Cat5e/Cat6');

-- Equipos en inventario
INSERT INTO equipos (categoria_id, numero_serie, marca, modelo, descripcion, estado, fecha_compra, garantia_hasta) VALUES
  (1, 'CAM-DAHUA-001', 'Dahua',   'IPC-HDW2831T', 'Cámara IP 4MP domo exterior',     'disponible',      '2025-01-10', '2027-01-10'),
  (1, 'CAM-HIKVISION-002', 'Hikvision', 'DS-2CD2T47G2', 'Cámara IP 4MP bala exterior', 'rentado',        '2025-03-15', '2027-03-15'),
  (2, 'SW-TPLINK-003', 'TP-Link', 'TL-SG108',     'Switch 8 puertos Gigabit',         'disponible',      '2025-06-01', '2027-06-01'),
  (3, 'RT-MIKROTIK-004', 'MikroTik', 'hAP ac²',   'Router WiFi doble banda AC1200',   'en_bodega',       '2024-11-20', '2026-11-20'),
  (4, 'PC-LENOVO-005', 'Lenovo',  'ThinkCentre M70q', 'Minicomputador i5 12va gen',   'en_mantenimiento','2024-08-05', '2026-08-05');

-- Proveedores
INSERT INTO proveedores (nombre, contacto, telefono, email) VALUES
  ('Districomp',   'Andrés Torres', '6013456789', 'ventas@districomp.com'),
  ('Secundum',     'Paula Gómez',   '3012345678', 'comercial@secundum.com'),
  ('Ingram Micro', 'Soporte ventas','6017001234', 'ventas@ingrammicro.com.co');

-- Catálogo de servicios
INSERT INTO servicios_catalogo (nombre, descripcion, precio_mano_obra, horas_estimadas) VALUES
  ('Instalación cableado Cat6',      'Instalación punto a punto con certificación',   35000.00, 1.50),
  ('Configuración de router',        'Setup y hardening de equipo de enrutamiento',   80000.00, 1.00),
  ('Instalación cámara IP',          'Montaje, configuración y prueba de cámara IP',  60000.00, 1.00),
  ('Mantenimiento preventivo PC',    'Limpieza, actualización y diagnóstico completo',70000.00, 2.00),
  ('Configuración red inalámbrica',  'Diseño e implementación de WiFi empresarial',  120000.00, 3.00);

-- Preguntas clave por servicio
INSERT INTO preguntas_clave_servicio (servicio_id, pregunta, tipo_respuesta, obligatoria, orden) VALUES
  (1, '¿Cuántos puntos de red necesitas?',              'numero',    TRUE, 1),
  (1, '¿En cuántos pisos se instalará?',                'numero',    TRUE, 2),
  (1, '¿Hay cielorraso o piso falso?',                  'si_no',     TRUE, 3),
  (2, '¿Cuántos dispositivos se conectarán?',           'numero',    TRUE, 1),
  (2, '¿El servicio de internet es fibra óptica?',      'si_no',     TRUE, 2),
  (3, '¿Cuántas cámaras necesitas?',                    'numero',    TRUE, 1),
  (3, '¿Son para interior o exterior?',                 'seleccion', TRUE, 2),
  (3, '¿Necesitas grabación local (DVR/NVR)?',          'si_no',     TRUE, 3),
  (4, '¿Cuántos equipos se van a revisar?',             'numero',    TRUE, 1),
  (5, '¿Cuántos puntos de acceso WiFi necesitas?',      'numero',    TRUE, 1);

-- Productos externos del catálogo
INSERT INTO productos_externos (proveedor_id, nombre, descripcion, costo_proveedor, margen_ganancia, tiempo_entrega_dias) VALUES
  (1, 'Cámara Dahua 4MP exterior',   'IPC-HFW2849S-S-IL StarLight',  280000.00, 0.30, 2),
  (1, 'Switch TP-Link 8p Gigabit',   'TL-SG108 no administrable',    145000.00, 0.25, 1),
  (2, 'Cable UTP Cat6 rollo 305m',   'Marca Panduit certificado',    185000.00, 0.20, 1),
  (2, 'Router MikroTik hAP ac²',     'Doble banda AC1200 RouterOS',  320000.00, 0.28, 3),
  (3, 'Licencia antivirus Kaspersky', 'Internet Security 1 año 1 PC',  95000.00, 0.40, 0);

-- Categorías financieras
INSERT INTO categorias_financieras (nombre, tipo, descripcion) VALUES
  ('Cotización aceptada',    'ingreso', 'Ingreso por servicio cotizado y aprobado'),
  ('Renta de equipos',       'ingreso', 'Ingreso mensual por arrendamiento de equipos'),
  ('Compra de insumos',      'gasto',   'Materiales y repuestos para instalaciones'),
  ('Transporte',             'gasto',   'Gastos de desplazamiento a clientes'),
  ('Compra a proveedor',     'gasto',   'Equipos adquiridos a proveedores externos'),
  ('Servicios públicos',     'gasto',   'Gastos fijos de operación de la oficina');

