"use client";

import React, { useState, useEffect } from "react";
import { MunicipioZMG } from "@/types/crm";
import { StickyHeader } from "@/components/landing/StickyHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { BeforeAfterGallery } from "@/components/landing/BeforeAfterGallery";
import { KananConciergeAgent } from "@/components/landing/KananConciergeAgent";
import { SocialProofAndFAQ } from "@/components/landing/SocialProofAndFAQ";
import { Footer } from "@/components/landing/Footer";
import { HalloweenBats } from "@/components/landing/HalloweenBats";
import { PapelPicado } from "@/components/landing/PapelPicado";
import { MobileBottomBar } from "@/components/landing/MobileBottomBar";

export default function HomePage() {
  const [selectedMunicipio, setSelectedMunicipio] = useState<MunicipioZMG>("Guadalajara");
  const [preselectedCategory, setPreselectedCategory] = useState<string | null>(null);
  const [modoHalloween, setModoHalloween] = useState<boolean>(false);

  useEffect(() => {
    // 1. Desactivar restauración automática de scroll del navegador para que siempre inicie arriba al recargar
    if (typeof window !== "undefined") {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }

      // Si la URL traía hash a agendar, limpiarlo y asegurar scroll arriba
      if (window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname);
      }
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }

    // Consultar el estado del modo Halloween público sin requerir autenticación
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data?.modo_halloween !== undefined) {
          setModoHalloween(Boolean(data.modo_halloween));
        }
      })
      .catch(() => {});
  }, []);

  const scrollToWizard = (categoryId?: string) => {
    if (categoryId) {
      setPreselectedCategory(categoryId);
    }
    const el = document.getElementById("agendar");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white relative">
      {modoHalloween && <HalloweenBats />}
      <StickyHeader
        selectedMunicipio={selectedMunicipio}
        onSelectMunicipio={setSelectedMunicipio}
        onOpenWizard={() => scrollToWizard()}
        isHalloweenMode={modoHalloween}
      />
      {modoHalloween && <PapelPicado />}

      <main className="flex-1">
        <HeroSection
          selectedMunicipio={selectedMunicipio}
          onOpenWizard={() => scrollToWizard()}
        />

        <ServicesSection
          onSelectCategoryForWizard={(catId) => scrollToWizard(catId)}
        />

        <BeforeAfterGallery onOpenWizard={() => scrollToWizard()} />

        <KananConciergeAgent
          selectedMunicipio={selectedMunicipio}
          onSelectMunicipio={setSelectedMunicipio}
          preselectedCategory={preselectedCategory}
        />

        <SocialProofAndFAQ />
      </main>

      <Footer onOpenWizard={() => scrollToWizard()} />
      <MobileBottomBar onOpenWizard={() => scrollToWizard()} />
    </div>
  );
}
