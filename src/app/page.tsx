"use client";

import React, { useState, useEffect } from "react";
import {
  Timer,
  CalendarCheck,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Star,
  CheckCircle2,
  Award,
  Zap,
} from "lucide-react";
import { StickyHeader } from "@/components/landing/StickyHeader";
import { BeforeAfterGallery } from "@/components/landing/BeforeAfterGallery";
import { KananConciergeAgent } from "@/components/landing/KananConciergeAgent";
import { SocialProofAndFAQ } from "@/components/landing/SocialProofAndFAQ";
import { Footer } from "@/components/landing/Footer";
import { MobileBottomBar } from "@/components/landing/MobileBottomBar";
import { HalloweenBats } from "@/components/landing/HalloweenBats";
import { PapelPicado } from "@/components/landing/PapelPicado";
import { MunicipioZMG } from "@/types/crm";
import { HeroSection } from "@/components/landing/HeroSection";
import { InteractiveTowerHero } from "@/components/interactive/InteractiveTowerHero";
import confetti from "canvas-confetti";

export default function HomePage() {
  const [selectedMunicipio, setSelectedMunicipio] = useState<MunicipioZMG>("Guadalajara");
  const [preselectedCategory, setPreselectedCategory] = useState<string | null>(null);
  const [modoHalloween, setModoHalloween] = useState<boolean>(false);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  useEffect(() => {
    // 1. Desactivar restauración automática de scroll del navegador para que siempre inicie arriba al recargar
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }

      if (window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname);
      }
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }

    // Consultar el estado del modo Halloween público
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.modo_halloween !== undefined) {
          setModoHalloween(Boolean(data.modo_halloween));
        }
      })
      .catch(() => {});

    // Restaurar carrito / áreas seleccionadas de la casita al recargar (Carrito persistente con vigencia de 30 min)
    try {
      const savedCart = localStorage.getItem("kanan_cart_items");
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        // Si viene en formato con timestamp
        if (parsed && parsed.timestamp && parsed.items) {
          if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
            setCartItems(parsed.items);
          } else {
            localStorage.removeItem("kanan_cart_items");
          }
        } else if (Array.isArray(parsed) && parsed.length > 0) {
          // Retrocompatibilidad
          setCartItems(parsed);
        }
      }
    } catch {}
  }, []);

  const toggleCart = (id: string) => {
    setCartItems((prev) => {
      const exists = prev.includes(id);
      const next = exists ? prev.filter((item) => item !== id) : [...prev, id];
      if (!exists) {
        try {
          confetti({
            particleCount: 25,
            spread: 55,
            origin: { y: 0.7 },
            colors: ["#36A6DE", "#1D71B5", "#25D366"],
          });
        } catch {}
      }
      try {
        localStorage.setItem(
          "kanan_cart_items",
          JSON.stringify({ timestamp: Date.now(), items: next })
        );
      } catch {}
      return next;
    });
  };

  const handleResetCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem("kanan_cart_items");
    } catch {}
  };

  const handleOpenChat = (categoryId?: string) => {
    if (categoryId) {
      setPreselectedCategory(categoryId);
    }
    setIsChatOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      {modoHalloween && <HalloweenBats />}
      <StickyHeader
        selectedMunicipio={selectedMunicipio}
        onSelectMunicipio={setSelectedMunicipio}
        onOpenWizard={() => handleOpenChat()}
        isHalloweenMode={modoHalloween}
      />
      {modoHalloween && <PapelPicado />}

      <main className="flex-1">
        {/* ============================================================== */}
        {/* 1. HERO PRINCIPAL OFICIAL DE KANAN CON FOTOS Y CONVERSIÓN      */}
        {/* ============================================================== */}
        <HeroSection
          selectedMunicipio={selectedMunicipio}
          onOpenWizard={(catId) => handleOpenChat(catId)}
        />

        {/* ============================================================== */}
        {/* 2. SECCIÓN DEDICADA DE LA TORRE VERTICAL Y FICHA EN 2 MITADES  */}
        {/* ============================================================== */}
        <section
          id="explora-torre"
          className="relative overflow-hidden bg-gradient-to-b from-[#F4F7F9] via-white to-[#F0F5FA] border-y border-slate-200/80"
        >
          {/* Luces sutiles de fondo para la maqueta */}
          <div className="absolute top-1/4 left-10 w-[450px] h-[450px] rounded-full bg-gradient-to-br from-[#36A6DE]/15 to-transparent blur-3xl pointer-events-none -z-0" />
          <div className="absolute bottom-10 right-10 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-[#1D71B5]/12 to-transparent blur-3xl pointer-events-none -z-0" />

          <InteractiveTowerHero
            selectedSpotId={selectedSpotId}
            onSelectSpot={setSelectedSpotId}
            cartItems={cartItems}
            onToggleCart={toggleCart}
            onOpenWizard={handleOpenChat}
          />
        </section>

        {/* 3. RESULTADOS REALES Y PRUEBA SOCIAL */}
        <BeforeAfterGallery onOpenWizard={() => handleOpenChat()} />

        <SocialProofAndFAQ />

        {/* AGENTE FLOTANTE TIPO CHAT DE WHATSAPP / MODAL FLOTANTE */}
        <KananConciergeAgent
          selectedMunicipio={selectedMunicipio}
          onSelectMunicipio={setSelectedMunicipio}
          preselectedCategory={preselectedCategory}
          preselectedCategories={cartItems}
          isFloating={true}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          onResetCart={handleResetCart}
        />
      </main>

      <Footer onOpenWizard={() => handleOpenChat()} />
      {!isChatOpen && <MobileBottomBar onOpenWizard={() => handleOpenChat()} />}

      {/* BURBUJA FLOTANTE EN DESKTOP (ESQUINA INFERIOR DERECHA - MÁS GRANDE Y PROTAGÓNICA) */}
      {!isChatOpen && (
        <aside
          aria-label="Asistente de cotización flotante"
          className="fixed bottom-6 right-6 z-40 hidden sm:flex items-center gap-3.5 animate-in fade-in slide-in-from-bottom-5"
        >
          <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl border border-slate-200/90 text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-2.5 hover:border-cyan-300 transition-colors">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Cotiza tu servicio en 1 minuto</span>
          </div>

          <button
            type="button"
            onClick={() => setIsChatOpen(true)}
            aria-label="Abrir chat con Kanan asistente"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#1D71B5] via-[#36A6DE] to-[#25D366] p-1 shadow-2xl shadow-blue-500/40 hover:scale-110 active:scale-95 transition-all flex items-center justify-center relative cursor-pointer group"
          >
            {/* Anillo de pulso exterior */}
            <span className="absolute inset-0 rounded-full bg-cyan-400 opacity-30 animate-ping pointer-events-none" />

            <div className="w-full h-full bg-white rounded-full p-1.5 flex items-center justify-center overflow-hidden shadow-inner">
              <img
                src="/assets/brand/kanan-dog.png"
                alt="Kanan Asistente"
                className="w-full h-full object-cover rounded-full group-hover:rotate-6 transition-transform duration-300"
              />
            </div>

            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-heading font-extrabold flex items-center justify-center shadow-lg ring-2 ring-white animate-bounce">
                {cartItems.length}
              </span>
            )}
          </button>
        </aside>
      )}
    </div>
  );
}