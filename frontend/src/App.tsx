function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
      <div className="p-8 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 text-center max-w-md">
        <h1 className="text-3xl font-extrabold text-cyan-400 mb-4 tracking-tight">
          C&R Soluciones Tecnológicas
        </h1>
        <p className="text-slate-400 mb-6 text-sm">
          Frontend inicial en ejecución con React, TypeScript y Tailwind CSS configurado con éxito.
        </p>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Entorno Frontend Listo
        </div>
      </div>
    </div>
  )
}

export default App