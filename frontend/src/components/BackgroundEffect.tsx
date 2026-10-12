import React from "react";

export const BackgroundEffect: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Capa 1: Degradado base de blanco a azul muy claro */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-sky-50/70 to-blue-50/60" />

      {/* Capa 2: Manchas de color difuminadas (blur) en las esquinas azul y violeta */}
      <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full bg-blue-400/20 blur-3xl" />
      <div className="absolute top-1/4 -right-36 w-[450px] h-[450px] rounded-full bg-violet-400/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-20 w-[400px] h-[400px] rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute bottom-10 right-10 w-[380px] h-[380px] rounded-full bg-indigo-400/15 blur-3xl" />
      <div className="absolute top-2/3 left-1/3 w-[300px] h-[300px] rounded-full bg-purple-300/15 blur-3xl" />

      {/* Capa 3: Encima mi imagen de red de nodos (/img/red-nodos.png, PNG transparente) */}
      <div
        className="absolute inset-0 opacity-45 bg-repeat bg-center"
        style={{
          backgroundImage: "url('/img/red-nodos.png')",
          backgroundSize: "950px auto",
        }}
      />
    </div>
  );
};

export default BackgroundEffect;
