export type UserRole = "Administrador" | "Técnico" | "Cliente";

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  nombre_completo?: string;
  email: string;
  telefono?: string;
  rol: {
    id: number;
    nombre: UserRole;
  };
  activo?: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  usuario: User;
}

export interface ServiceItem {
  id: number;
  nombre: string;
  descripcion?: string;
  precio_mano_obra: number;
  horas_estimadas: number;
  activo: boolean;
  preguntas_clave?: {
    id: number;
    pregunta: string;
    tipo_respuesta: "numero" | "texto" | "si_no" | "seleccion";
    obligatoria: boolean;
  }[];
}

export interface ProductItem {
  id: number;
  proveedor_id: number;
  nombre: string;
  descripcion?: string;
  costo_proveedor: number;
  margen_ganancia: number;
  precio_venta_sugerido: number;
  tiempo_entrega_dias: number;
  stock_disponible: number;
  activo: boolean;
}

export interface QuoteItem {
  id: number;
  tipo_item: "servicio" | "producto";
  descripcion: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface Quote {
  id: number;
  cliente_id: number;
  conversacion_id?: number;
  subtotal: number;
  total: number;
  estado: "pendiente" | "aceptada" | "rechazada" | "ajuste_solicitado";
  url_pdf?: string;
  fecha_vencimiento?: string;
  creado_en: string;
  items?: QuoteItem[];
}

export interface TicketComment {
  id: number;
  ticket_id: number;
  usuario_id: number;
  usuario_nombre?: string;
  usuario_rol?: string;
  contenido: string;
  es_interno: boolean;
  creado_en: string;
}

export interface Ticket {
  id: number;
  cliente_id: number;
  equipo_id?: number;
  tecnico_id?: number;
  tecnico_nombre?: string;
  titulo: string;
  descripcion: string;
  prioridad: "baja" | "media" | "alta";
  estado: "abierto" | "en_proceso" | "resuelto" | "cerrado";
  creado_en: string;
  cerrado_en?: string;
  sla_limite_horas: number;
  comentarios?: TicketComment[];
}

export interface Equipment {
  id: number;
  numero_serie: string;
  marca: string;
  modelo: string;
  descripcion?: string;
  estado: "disponible" | "rentado" | "en_bodega" | "en_mantenimiento";
  qr_codigo?: string;
  fecha_compra?: string;
  garantia_hasta?: string;
  categoria?: {
    id: number;
    nombre: string;
  };
}
