import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bot,
  Send,
  Sparkles,
  CheckCircle2,
  FileText,
  ArrowRight,
  RefreshCw,
  Lightbulb,
} from "lucide-react";
import api from "../../services/api";
import type { Quote } from "../../types";

interface ChatMessage {
  rol: "user" | "assistant";
  contenido: string;
  cotizacion?: Quote | null;
}

export const PanelChatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      rol: "assistant",
      contenido:
        "¡Hola! Soy tu Asesor Virtual con Inteligencia Artificial de C&R Soluciones Tecnológicas. 🚀\n\nCuéntame qué infraestructura técnica necesitas cotizar para tu empresa u oficina: por ejemplo, puntos de red estructurado Cat6, cámaras de seguridad Hikvision/Dahua, switches administrables o mantenimiento preventivo.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversacionId, setConversacionId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sugerencias = [
    "Necesito instalar 6 puntos de red Cat6 y peinado de rack.",
    "Quiero cotizar 4 cámaras de seguridad IP con disco de 1TB.",
    "Mantenimiento térmico y limpieza para 8 computadores.",
  ];

  const handleSendMessage = async (textoAEnviar?: string) => {
    const text = (textoAEnviar || input).trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { rol: "user", contenido: text }]);
    if (!textoAEnviar) setInput("");
    setLoading(true);

    try {
      const url = conversacionId
        ? `/cotizaciones/chat?conversacion_id=${conversacionId}`
        : "/cotizaciones/chat";

      const res = await api.post(url, {
        contenido: text,
      });

      const { conversacion_id, respuesta_ia, es_cotizacion, cotizacion } = res.data;

      if (conversacion_id) {
        setConversacionId(conversacion_id);
      }

      setMessages((prev) => [
        ...prev,
        {
          rol: "assistant",
          contenido: respuesta_ia,
          cotizacion: es_cotizacion ? cotizacion : null,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          rol: "assistant",
          contenido:
            "Disculpa, ocurrió un inconveniente conectando con el motor de IA. Por favor verifica tu conexión e inténtalo de nuevo en unos segundos.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Contenedor Principal en Tema Claro Glass */}
      <div className="card-glass border border-blue-100 flex flex-col h-[calc(100vh-170px)] min-h-[580px] overflow-hidden shadow-xl">
        {/* Encabezado del Chatbot */}
        <div className="p-4 sm:p-5 bg-white/95 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Cotizador Inteligente C&R
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                  <Sparkles className="w-3 h-3 text-cyan-600" />
                  Gemini AI Activo
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Tarifas oficiales en tiempo real con mano de obra e insumos de catálogo
              </p>
            </div>
          </div>

          <Link
            to="/panel/cotizaciones"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Mis Cotizaciones</span>
          </Link>
        </div>

        {/* Historial de Mensajes */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/40">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${m.rol === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                  m.rol === "user"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none"
                    : "bg-white text-slate-800 border border-slate-200/80 rounded-bl-none shadow-sm"
                }`}
              >
                <div className="whitespace-pre-line">{m.contenido}</div>

                {/* Tarjeta de Cotización Generada */}
                {m.cotizacion && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-blue-200 text-slate-800 shadow-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                      <div className="flex items-center gap-1.5 font-extrabold text-blue-700 text-xs sm:text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Presupuesto Generado #{m.cotizacion.id}</span>
                      </div>
                      <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-bold uppercase">
                        {m.cotizacion.estado}
                      </span>
                    </div>

                    <div className="text-xs space-y-1.5">
                      {m.cotizacion.items?.map((item, i) => (
                        <div key={i} className="flex justify-between text-slate-600 text-[11px]">
                          <span>
                            • {item.descripcion} (x{item.cantidad})
                          </span>
                          <span className="font-bold text-slate-800">
                            ${Number(item.subtotal).toLocaleString()} COP
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs sm:text-sm font-extrabold">
                      <span className="text-slate-700">Total Estimado:</span>
                      <span className="text-blue-700 text-sm sm:text-base">
                        ${Number(m.cotizacion.total).toLocaleString()} COP
                      </span>
                    </div>

                    <Link
                      to="/panel/cotizaciones"
                      className="w-full mt-2 py-2 rounded-xl btn-primary-gradient text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
                    >
                      <span>Revisar y Aceptar en Mis Cotizaciones</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white text-slate-500 text-xs rounded-2xl p-4 flex items-center gap-2 border border-slate-200 shadow-xs">
                <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                <span>La IA está calculando tarifas de mano de obra y materiales...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Sugerencias Rápidas si hay pocos mensajes */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 bg-white/70 border-t border-blue-50 flex flex-wrap gap-2 items-center text-xs">
            <span className="text-slate-500 font-semibold flex items-center gap-1">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              Sugerencias:
            </span>
            {sugerencias.map((sug, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(sug)}
                className="px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-medium border border-blue-100 transition-colors"
              >
                {sug}
              </button>
            ))}
          </div>
        )}

        {/* Barra de Entrada de Mensaje */}
        <form
          onSubmit={handleSubmit}
          className="p-3 sm:p-4 bg-white border-t border-blue-100 flex gap-2 items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe tu requerimiento (ej. 'Quiero 4 cámaras de seguridad y 6 puntos de red')..."
            className="flex-1 bg-slate-50 text-slate-800 placeholder-slate-400 text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="btn-primary-gradient px-5 py-3 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none shadow-md shrink-0"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default PanelChatbot;
