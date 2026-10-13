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

export interface QuoteHistory {
  id: number;
  cotizacion_id: number;
  estado: string;
  usuario_id?: number;
  usuario_nombre?: string;
  observacion?: string;
  creado_en: string;
}

export interface Quote {
  id: number;
  cliente_id: number;
  cliente_nombre?: string;
  cliente_email?: string;
  cliente_telefono?: string;
  cliente_empresa?: string;
  conversacion_id?: number;
  subtotal: number;
  descuento?: number;
  porcentaje_iva?: number;
  iva?: number;
  total: number;
  estado: string;
  notas_internas?: string;
  ingreso_confirmado?: boolean;
  fecha_visita_agendada?: string;
  url_pdf?: string;
  fecha_vencimiento?: string;
  creado_en: string;
  eliminado_en?: string;
  items?: QuoteItem[];
  historial?: QuoteHistory[];
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
  cliente_nombre?: string | null;
  cliente_empresa?: string | null;
  cliente_telefono?: string | null;
  cliente_email?: string | null;
  equipo_id?: number;
  tecnico_id?: number;
  tecnico_nombre?: string | null;
  titulo: string;
  descripcion: string;
  prioridad: "baja" | "media" | "alta";
  estado: "abierto" | "en_proceso" | "resuelto" | "cerrado";
  categoria?: "software" | "hardware" | "red" | "cctv" | string;
  modalidad?: "remota" | "presencial" | string;
  fecha_visita?: string | null;
  creado_en: string;
  cerrado_en?: string | null;
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

export interface GananciaItem {
  id: number;
  nombre: string;
  tipo: "servicio" | "producto";
  precio_venta: number;
  costo: number;
  ganancia_unitaria: number;
  margen_porcentaje: number;
  unidades_vendidas: number;
  ganancia_total_generada: number;
}

export interface FlujoComparativoItem {
  etiqueta: string;
  monto: number;
  color: string;
}

export interface MetricasFinancierasAvanzadas {
  periodo: "30_dias" | "mes_actual" | "trimestre" | "anio_actual" | "historico";
  ingresos_verificados: number;
  posible_venta: number;
  gastos_operativos: number;
  inversion_total: number;
  ganancia_neta: number;
  margen_promedio_comercial: number;
  cantidad_proyectos_concretados: number;
  cantidad_cotizaciones_en_curso: number;
  ganancias_por_servicio: GananciaItem[];
  ganancias_por_producto: GananciaItem[];
  flujo_comparativo: FlujoComparativoItem[];
}

export interface CategoriaFinanciera {
  id: number;
  nombre: string;
  tipo: "ingreso" | "gasto" | "inversion";
  descripcion?: string;
  activo: boolean;
}

export interface TransaccionFinanciera {
  id: number;
  categoria_id: number;
  cotizacion_id?: number;
  descripcion: string;
  monto: number;
  tipo: "ingreso" | "gasto" | "inversion";
  es_fijo: boolean;
  fecha: string;
  creado_en: string;
  categoria_nombre?: string;
}
