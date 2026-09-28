export type UserRole = "Administrador" | "Técnico" | "Cliente";

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  activo: boolean;
  rol: {
    id: number;
    nombre: UserRole;
  };
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface Equipo {
  id: number;
  categoria_id: number;
  numero_serie: string;
  marca: string;
  modelo: string;
  descripcion?: string;
  estado: "disponible" | "rentado" | "en_mantenimiento" | "en_bodega" | "de_baja";
  fecha_compra?: string;
  garantia_hasta?: string;
  qr_codigo?: string;
  categoria?: {
    id: number;
    nombre: string;
  };
}

export interface CategoriaEquipo {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface ServicioCatalogo {
  id: number;
  nombre: string;
  descripcion?: string;
  precio_mano_obra: number;
  horas_estimadas: number;
  activo?: boolean;
}

export interface ProductoExterno {
  id: number;
  proveedor_id: number;
  nombre: string;
  descripcion?: string;
  costo_proveedor: number;
  margen_ganancia: number;
  precio_venta_sugerido?: number;
  stock_disponible: number;
  tiempo_entrega_dias: number;
}

export interface ItemCotizacion {
  id?: number;
  descripcion: string;
  tipo_item?: "servicio" | "producto";
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Cotizacion {
  id: number;
  cliente_id: number;
  conversacion_id?: number;
  subtotal: number;
  total: number;
  estado: "pendiente" | "aceptada" | "rechazada" | "ajuste_solicitado";
  url_pdf?: string;
  creado_en: string;
  items?: ItemCotizacion[];
}

export interface MensajeChat {
  id?: number;
  rol: "user" | "assistant";
  contenido: string;
  creado_en?: string;
}

export interface ComentarioTicket {
  id: number;
  ticket_id: number;
  usuario_id: number;
  contenido: string;
  es_interno: boolean;
  creado_en: string;
  usuario?: {
    nombre: string;
    apellido: string;
    rol?: { nombre: string };
  };
}

export interface Ticket {
  id: number;
  cliente_id: number;
  equipo_id?: number;
  tecnico_id?: number;
  titulo: string;
  descripcion: string;
  prioridad: "baja" | "media" | "alta";
  estado: "abierto" | "en_proceso" | "resuelto" | "cerrado";
  creado_en: string;
  cerrado_en?: string;
  comentarios?: ComentarioTicket[];
  equipo?: Equipo;
}

export interface DashboardFinanciero {
  ingresos_mes_actual: number;
  gastos_mes_actual: number;
  utilidad_neta_mes_actual: number;
  margen_operativo_mes_actual: number;
  contratos_activos: number;
  contratos_por_vencer_15_dias: number;
  cotizaciones_aceptadas_mes: number;
}
