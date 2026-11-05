"use client";

import React, { useState } from "react";

export default function SonidosTestPage() {
  const [playingKey, setPlayingKey] = useState<string | null>(null);

  const playSound = (path: string, key: string) => {
    setPlayingKey(key);
    const audio = new Audio(path);
    audio.play().catch((err) => console.log("Audio play error:", err));
    audio.onended = () => setPlayingKey(null);
  };

  const playCombo = () => {
    setPlayingKey("combo");
    const a1 = new Audio("/sounds/bell_service.mp3");
    const a2 = new Audio("/sounds/bark1.mp3");
    a1.play();
    setTimeout(() => {
      a2.play();
      a2.onended = () => setPlayingKey(null);
    }, 550);
  };

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-200 flex items-center justify-center p-6">
      <div className="bg-[#1C2541] border border-white/10 rounded-3xl p-8 max-w-xl w-full shadow-2xl">
        <h1 className="text-xl font-black text-white flex items-center gap-2 mb-2">
          🐾 Kanan Sound Lab (Selección Final)
        </h1>
        <p className="text-xs text-slate-400 mb-6">
          Escucha las opciones y dinos cuáles dejamos activas en el CRM:
        </p>

        {/* COMBO GANADOR */}
        <div className="bg-emerald-500/10 border-2 border-emerald-500 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-emerald-400">🏆 Tu Combo Elegido (Citas)</h3>
            <p className="text-xs text-slate-400">Campana Recepción + Doble Ladrido 1</p>
          </div>
          <button
            onClick={playCombo}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              playingKey === "combo" ? "bg-emerald-400 text-slate-900" : "bg-emerald-600 hover:bg-emerald-500 text-white"
            }`}
          >
            ▶ Escuchar Combo
          </button>
        </div>

        {/* SECCIÓN 1: AGENDAR SERVICIO */}
        <div className="mb-6">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#38BDF8] mb-3">
            📅 OPCIONES: CUANDO ALGUIEN AGENDA SERVICIO
          </h2>
          <div className="space-y-2">
            {[
              { id: "agenda_1", name: "Agenda 1: Campana Armónica de Éxito", file: "/sounds/calendar_confirm.mp3", desc: "Tono alegre de confirmación" },
              { id: "agenda_2", name: "Agenda 2: Chime Mágico de Servicio", file: "/sounds/magic_chime_agenda.mp3", desc: "Campanillas mágicas y frescas" },
              { id: "agenda_3", name: "Agenda 3: Ding Profesional de Reserva", file: "/sounds/booking_ding.mp3", desc: "Tono limpio ejecutivo de calendario" },
            ].map((item) => (
              <div key={item.id} className="bg-[#273456] border border-white/5 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-white">{item.name}</h4>
                  <p className="text-[11px] text-slate-400">{item.desc}</p>
                </div>
                <button
                  onClick={() => playSound(item.file, item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    playingKey === item.id ? "bg-[#38BDF8] text-slate-900" : "bg-[#1D71B5] hover:bg-[#36A6DE] text-white"
                  }`}
                >
                  ▶ Escuchar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SECCIÓN 2: CHAT */}
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#38BDF8] mb-3">
            💬 OPCIONES: MENSAJE DE CHAT ENTRANTE
          </h2>
          <div className="space-y-2">
            {[
              { id: "chat_1", name: "Chat 1: Pop Crisp Oficial WhatsApp", file: "/sounds/pop_whatsapp_clean.mp3", desc: "Burbuja ágil y seca, cero molestia" },
              { id: "chat_2", name: "Chat 2: Ping Cristalino Alertante", file: "/sounds/chat_ping.mp3", desc: "Brillante y de alta presencia" },
              { id: "chat_3", name: "Chat 3: Pop Corto Clásico", file: "/sounds/chat_pop.mp3", desc: "Burbuja suave y rápida" },
              { id: "chat_4", name: "Chat 4: Campana de Notificación", file: "/sounds/chat_notification.mp3", desc: "Campana digital de alerta" },
            ].map((item) => (
              <div key={item.id} className="bg-[#273456] border border-white/5 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-white">{item.name}</h4>
                  <p className="text-[11px] text-slate-400">{item.desc}</p>
                </div>
                <button
                  onClick={() => playSound(item.file, item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    playingKey === item.id ? "bg-[#38BDF8] text-slate-900" : "bg-[#1D71B5] hover:bg-[#36A6DE] text-white"
                  }`}
                >
                  ▶ Escuchar
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
