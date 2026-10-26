"use client";

import React, { useEffect, useRef } from "react";
import { ServicioCita, Cliente } from "@/types/crm";

interface JaliscoServiceMapProps {
  citas: ServicioCita[];
  clientes: Cliente[];
  onSelectCitaForCalendar: (status: string) => void;
}

// Coordenadas aproximadas por municipio para los pines en Jalisco
const MUNICIPIO_COORDS: Record<string, [number, number]> = {
  Guadalajara: [20.6767, -103.347],
  Zapopan: [20.7214, -103.3918],
  Tlajomulco: [20.4746, -103.4431],
  Tlaquepaque: [20.6409, -103.3125],
};

export function JaliscoServiceMap({
  citas,
  clientes,
  onSelectCitaForCalendar,
}: JaliscoServiceMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const onSelectCitaRef = useRef(onSelectCitaForCalendar);
  onSelectCitaRef.current = onSelectCitaForCalendar;

  // 1. Inicializar el mapa de Leaflet una sola vez (NO recrear en cada render)
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return; // ya inicializado

      // Cargar Leaflet dinámicamente en el cliente
      const L = (await import("leaflet")).default;

      // Importar CSS de Leaflet si no está presente
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if (!isMounted || !mapContainerRef.current || mapInstanceRef.current) return;

      // Inicializar mapa centrado en Jalisco (ZMG)
      const map = L.map(mapContainerRef.current, {
        center: [20.6597, -103.3496],
        zoom: 11,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // Capa de teselas de alta calidad con detalle nítido de calles (OpenStreetMap)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Crear LayerGroup para pines
      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;

      // Forzar recalculo de dimensiones
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, []); // Solo al montar

  // 2. Actualizar pines sin reiniciar ni resetear la vista del mapa
  useEffect(() => {
    async function updateMarkers() {
      if (!mapInstanceRef.current || !markersLayerRef.current) return;
      const L = (await import("leaflet")).default;

      markersLayerRef.current.clearLayers();

      const pinIcon = L.divIcon({
        className: "custom-kanan-pin",
        html: `
          <div style="
            width: 32px;
            height: 32px;
            background: #355581;
            border: 3px solid #36A6DE;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            box-shadow: 0 4px 12px rgba(53,85,129,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 10px;
              height: 10px;
              background: #FFFFFF;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      citas.forEach((cita, idx) => {
        const cliente = clientes.find((c) => c.id === cita.cliente_id);
        const baseCoords = (cliente && MUNICIPIO_COORDS[cliente.municipio]) || [20.6597, -103.3496];

        const lat = baseCoords[0] + (idx * 0.012 - 0.006);
        const lng = baseCoords[1] + (idx * 0.015 - 0.008);

        const marker = L.marker([lat, lng], { icon: pinIcon });

        const popupContent = document.createElement("div");
        popupContent.style.minWidth = "190px";
        popupContent.innerHTML = `
          <div style="font-family: inherit; color: #355581;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <span style="font-weight: 800; font-size: 13px; color: #355581;">${cita.id}</span>
              <span style="font-size: 10px; font-weight: 700; background: #F4F7F9; border: 1px solid #CBD5E1; padding: 2px 6px; border-radius: 8px;">
                ${cita.estatus}
              </span>
            </div>
            <div style="font-size: 12px; font-weight: 700; margin-bottom: 2px;">
              ${cliente?.nombre || "Cliente"}
            </div>
            <div style="font-size: 11px; color: #64748B; margin-bottom: 8px;">
              📍 ${cliente?.municipio || "Jalisco"} • ${cita.fecha}
            </div>
            <button id="btn-goto-calendar-${cita.id}" style="
              width: 100%;
              padding: 6px 10px;
              background: #355581;
              color: #FFFFFF;
              font-size: 11px;
              font-weight: 700;
              border: none;
              border-radius: 8px;
              cursor: pointer;
            ">
              Ver en Calendario →
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on("popupopen", () => {
          const btn = document.getElementById(`btn-goto-calendar-${cita.id}`);
          if (btn) {
            btn.onclick = () => {
              onSelectCitaRef.current(cita.estatus);
            };
          }
        });

        markersLayerRef.current.addLayer(marker);
      });
    }

    updateMarkers();
  }, [citas, clientes]);

  return (
    <div className="w-full h-[400px] sm:h-[480px] rounded-2xl overflow-hidden border border-slate-200 relative">
      <div ref={mapContainerRef} className="w-full h-full z-10" />
    </div>
  );
}
