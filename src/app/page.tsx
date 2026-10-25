"use client";

import React, { useState, useEffect } from "react";
import { MunicipioZMG } from "@/types/crm";
import { StickyHeader } from "@/components/landing/StickyHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { BeforeAfterGallery } from "@/components/landing/BeforeAfterGallery";
import { BookingWizard } from "@/components/landing/BookingWizard";
import { SocialProofAndFAQ } from "@/components/landing/SocialProofAndFAQ";
import { Footer } from "@/components/landing/Footer";
import { HalloweenBats } from "@/components/landing/HalloweenBats";
import { PapelPicado } from "@/components/landing/PapelPicado";

export default function HomePage() {
  const [selectedMunicipio, setSelectedMunicipio] = useState<MunicipioZMG>("Guadalajara");
  const [preselectedCategory, setPreselectedCategory] = useState<string | null>(null);
  const [modoHalloween, setModoHalloween] = useState<boolean>(true);

  useEffect(() => {
    // Consultar el estado del modo Halloween configurado en el Admin
    fetch("/api/crm")
      .then((res) => res.json())
      .then((data) => {
        if (data?.config?.modo_halloween !== undefined) {
          setModoHalloween(Boolean(data.config.modo_halloween));
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

        <BookingWizard
          selectedMunicipio={selectedMunicipio}
          onSelectMunicipio={setSelectedMunicipio}
          preselectedCategory={preselectedCategory}
        />

        <SocialProofAndFAQ />
      </main>

      <Footer onOpenWizard={() => scrollToWizard()} />
    </div>
  );
}
