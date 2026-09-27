import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bot, Send, Sparkles, CheckCircle2, FileText, ArrowRight } from "lucide-react";
import api from "../../services/api";
import type { Quote } from "../../types";

interface ChatMessage {
  rol: "user" | "assistant";
  contenido: string;
  cotizacion?: Quote | null;
}

export const ClientChatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      rol: "assistant",
      contenido:
        "¡Hola! Soy tu Asesor Virtual con Inteligencia Artificial de C&R Soluciones. 🚀\n\nCuéntame qué requerimiento técnico necesitas cotizar: instalación de cableado Cat6, cámaras de seguridad, configuración de routers o mantenimiento de computadores.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversacionId, setConversacionId] = useState<number | null>(null);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { rol: "user", contenido: userText }]);
    setInput("");
    setLoading(true);

    try {
      const url = conversacionId
        ? `/cotizaciones/chat?conversacion_id=${conversacionId}`
        : "/cotizaciones/chat";

      const res = await api.post(url, {
        contenido: userText,
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
            "Disculpa, ocurrió una interrupción comunicándome con el motor de IA. Por favor intenta de nuevo en unos segundos.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Cabecera */}
      <div className="p-4 sm:p-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/20">
            <Bot className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Cotizador Inteligente C&R
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <Sparkles className="w-3 h-3" />
                Gemini AI Activo
              </span>
            </h2>
            <span className="text-[11px] text-slate-400">
              Cálculo financiero y tarifas oficiales en tiempo real
            </span>
          </div>
        </div>

        <Link
          to="/portal/cotizaciones"
          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800"
        >
          <FileText className="w-3.5 h-3.5" />
          Ver Cotizaciones
        </Link>
      </div>

      {/* Historial de Mensajes */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.rol === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                m.rol === "user"
                  ? "bg-cyan-600 text-white rounded-br-none"
                  : "bg-slate-950 text-slate-200 border border-slate-800 rounded-bl-none shadow-md"
              }`}
            >
              <div className="whitespace-pre-line">{m.contenido}</div>

              {/* Si el mensaje contiene una cotización generada formalmente */}
              {m.cotizacion && (
                <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-cyan-500/30 text-white shadow-lg space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-cyan-400 flex items-center gap-1.5 text-xs sm:text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Presupuesto Generado #{m.cotizacion.id}
                    </span>
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold uppercase">
                      {m.cotizacion.estado}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    {m.cotizacion.items?.map((item, i) => (
                      <div key={i} className="flex justify-between text-slate-300 text-[11px]">
                        <span>• {item.descripcion} (x{item.cantidad})</span>
                        <span className="font-semibold text-slate-200">
                          ${Number(item.subtotal).toLocaleString()} COP
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs sm:text-sm font-extrabold text-white">
                    <span>Total Estimado:</span>
                    <span className="text-cyan-400 text-base">
                      ${Number(m.cotizacion.total).toLocaleString()} COP
                    </span>
                  </div>

                  <Link
                    to="/portal/cotizaciones"
                    className="w-full mt-2 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    Revisar y Aceptar Cotización
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-950 text-slate-400 text-xs rounded-2xl p-4 flex items-center gap-2 border border-slate-800">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"></div>
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></div>
              La IA está formulando la cotización y calculando tarifas...
            </div>
          </div>
        )}
      </div>

      {/* Input del Chat */}
      <form onSubmit={handleSendMessage} className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe aquí tu solicitud (ej. 'Quiero 3 cámaras para exterior y 4 puntos de red')..."
          className="flex-1 bg-slate-900 text-white placeholder-slate-500 text-xs sm:text-sm px-4 py-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all disabled:opacity-50 flex items-center justify-center shadow-lg shadow-cyan-500/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

export default ClientChatbot;
