import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { mapProjectToProjectTagsSplit, ProjectTagsSplit } from "@/lib/types/project/schema";
import HTMLFlipBookLib from "react-pageflip";
import { useProjectsContext } from "@/context/useProjectsContext";
import NextImage from "next/image";
import { Button, Image } from "@nextui-org/react";
import FavoriteButton from "../proyecto/[proyecto]/favorite-button";
import { Filter, SearchBar } from "@/components/home";
import Select from "@/components/home/Select";
import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const HTMLFlipBook: any = HTMLFlipBookLib;
const periodOptions = [
  { label: "Invierno", value: "invierno" },
  { label: "Febrero - Junio", value: "feb-jun" },
];

/* === PORTADA (igual que antes) === */
function CoverPage(/* ... props ... */: any) { /* <= DEJA TU IMPLEMENTACIÓN ACTUAL */ return null as any; }

export default function CatalogoMagazinePage() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams()!;
  const { projects: contextProjects } = useProjectsContext();

  const createQueryString = useCallback((name: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(name, value);
    return params.toString();
  }, [searchParams]);

  const [projects, setProjects] = useState<ProjectTagsSplit[]>([]);
  const [selectedHours, setSelectedHours] = useState(searchParams.get("hours") || "");
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedTags, setSelectedTags] = useState(searchParams.get("tags") || "");
  const [selectedModel, setSelectedModel] = useState(searchParams.get("model") || "");
  const [selectedPeriod, setSelectedPeriod] = useState(searchParams.get("period") || "");
  const [error, setError] = useState<string | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [vw, setVw] = useState(375); // viewport width para calcular tamaño del libro

  // Flipbook
  const bookRef = useRef<any>(null);
  const [page, setPage] = useState(1);
  const [pagesTotal, setPagesTotal] = useState(1);
  const [isFirst, setIsFirst] = useState(true);
  const [isLast, setIsLast] = useState(false);

  // Responsive: detectar móvil y ancho real
  useEffect(() => {
    const update = () => {
      const w = typeof window !== "undefined" ? window.innerWidth : 375;
      setVw(w);
      setIsMobile(w < 768);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Dimensiones responsivas para el flipbook (ratio ~1.414, estilo “A”)
  const bookWidth = useMemo(() => (isMobile ? Math.min(vw - 24, 420) : 1100), [isMobile, vw]);
  const bookHeight = useMemo(() => Math.round(bookWidth * 1.416), [bookWidth]);

  const getApi = useCallback(() => {
    try { return bookRef.current?.pageFlip?.(); } catch { return undefined; }
  }, []);

  const syncFromApi = useCallback((api?: any) => {
    const _api = api ?? getApi();
    if (!_api) return;
    const idx = _api.getCurrentPageIndex?.() ?? 0;
    const total = _api.getPageCount?.() ?? 1;
    setPage(idx + 1);
    setPagesTotal(total);
    setIsFirst(idx <= 0);
    setIsLast(idx >= total - 1);
  }, [getApi]);

  const goPrev = useCallback(() => {
    const api = getApi();
    if (!api) return;
    if ((api.getCurrentPageIndex?.() ?? 0) > 0) api.flipPrev();
  }, [getApi]);

  const goNext = useCallback(() => {
    const api = getApi();
    if (!api) return;
    const idx = api.getCurrentPageIndex?.() ?? 0;
    const total = api.getPageCount?.() ?? 1;
    if (idx < total - 1) api.flipNext();
  }, [getApi]);

  // teclado en desktop
  useEffect(() => {
    if (isMobile) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMobile, goPrev, goNext]);

  // Datos (igual que antes)
  useEffect(() => {
    const fetchProjects = async () => {
      if (contextProjects?.length) {
        setProjects(contextProjects.filter((p) => p.status === "visible"));
        return;
      }
      const { data, error } = await supabase.from("projects").select("*").eq("status", "visible");
      if (error) setError(error.message);
      else if (data) setProjects(data.map((p: any) => mapProjectToProjectTagsSplit(p)));
    };
    const favorites = JSON.parse(localStorage.getItem("favorites") || "{}");
    // (si los necesitas) const favoritesIDs = Object.keys(favorites).map(Number);
    fetchProjects();
  }, [contextProjects, selectedPeriod, supabase]);

  const includesCsv = (csv: string, value: string | number) => {
    const list = String(csv || "").split(",").map((s) => s.trim()).filter(Boolean);
    return list.length === 0 ? true : list.includes(String(value));
  };

  const filteredProjects = projects
    .filter((p) =>
      (p.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.organization || "").toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((p) => (selectedTags ? p.tags.some((t) => includesCsv(selectedTags, t.name)) : true))
    .filter((p) => (selectedModel ? includesCsv(selectedModel, p.model) : true))
    .filter((p) => (selectedPeriod ? selectedPeriod === p.period : true))
    .filter((p) => (selectedHours ? includesCsv(selectedHours, p.hours ?? "") : true));

  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (projects.length === 0) return <div className="p-4">Cargando proyectos...</div>;

  const getPeriodLabel = (val?: string) => periodOptions.find((o) => o.value === val)?.label || "";
  const periodLabelTop = getPeriodLabel(selectedPeriod);
  const isOnline = (model?: string) =>
    (model || "").toLowerCase().includes("línea") ||
    (model || "").toLowerCase().includes("linea") ||
    (model || "").toLowerCase().includes("online");
  const normalizeHours = (h?: string | number) => {
    if (h == null) return "—"; const m = String(h).trim().match(/\d+/); return m ? m[0] : String(h);
  };
  const year = new Date().getFullYear()+1;

  return (
    <main className="flex flex-col items-center py-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">
        Oferta Servicio Social — {selectedPeriod ? periodLabelTop + " — " : ""}{year}
      </h1>

      {/* Filtros (deja tu bloque actual) */}
      {/* ... */}

      {/* === FLIPBOOK === */}
      <div className="relative w-full flex justify-center select-none">
        <HTMLFlipBook
          ref={bookRef}
          // tamaño responsivo real
          size="fixed"
          width={bookWidth}
          height={bookHeight}
          minWidth={280}
          maxWidth={1200}
          minHeight={360}
          maxHeight={1600}
          showCover
          usePortrait
          maxShadowOpacity={0.5}
          drawShadow
          startPage={0}
          // sensibilidad/gestos
          disableFlipByClick={isMobile}
          useMouseEvents={!isMobile}
          swipeDistance={isMobile ? 999 : 50}
          clickEventForward={false}
          mobileScrollSupport={true}
          className="shadow-xl z-10 rounded-xl overflow-hidden"
          showPageCorners
          onInit={(inst: any) => { try { syncFromApi(inst?.pageFlip?.()); } catch {} }}
          onFlip={() => { syncFromApi(); }}
        >
          {/* PORTADA */}
          {(() => {
            const totalProjects = filteredProjects.length;
            const careersCount = new Set(filteredProjects.flatMap((p) => (p.tags || []).map((t) => t.name))).size;
            const onlineCount = filteredProjects.filter((p) => isOnline(p.model)).length;
            const presencialCount = totalProjects - onlineCount;
            return (
              <div key="cover" className="page hard cover-page" data-density="hard">
                <CoverPage
                  title="Catálogo de Proyectos"
                  subtitle="Revista de Servicio Social"
                  periodLabel={periodLabelTop}
                  year={year}
                  totalProjects={totalProjects}
                  careersCount={careersCount}
                  onlineCount={onlineCount}
                  presencialCount={presencialCount}
                />
              </div>
            );
          })()}

          {/* PÁGINAS: deja tu render actual */}
          {filteredProjects.map((project) => {
            const periodLabel = getPeriodLabel(project?.period);
            const hoursText = project?.hours ? `${project.hours} horas` : "—";
            const activities = (project?.description || "").split("\n").map((s) => s.trim()).filter(Boolean);
            const abilitiesText = (() => {
              const raw = (project as any)?.abilities ?? (project as any)?.skills ?? "";
              return Array.isArray(raw) ? raw.filter(Boolean).join(", ") : String(raw || "").trim();
            })();

            return (
              <div key={project.id} className="page">
                {/* === TU LAYOUT DE PÁGINA EXISTENTE AQUÍ === */}
                {/* Usa tu mismo contenido anterior */}
              </div>
            );
          })}
        </HTMLFlipBook>
      </div>

      {/* === BARRA INFERIOR (SOLO MÓVIL) === */}
      <div className="md:hidden w-full">
        <div className="mx-auto mt-3 w-[min(92%,28rem)]">
          <div className="flex items-center justify-between gap-2 rounded-xl border bg-white/95 px-3 py-2 shadow-lg backdrop-blur">
            {/* Botones HTML nativos: usan onClick (no onPress) */}
            <button
              type="button"
              onClick={goPrev}
              disabled={isFirst}
              className={`rounded-full border px-3 py-2 text-sm bg-white active:scale-95 ${
                isFirst ? "opacity-40 pointer-events-none" : "hover:bg-neutral-50"
              }`}
              aria-label="Página anterior"
            >
              ← Atrás
            </button>

            <span className="text-xs tabular-nums">{page} / {pagesTotal}</span>

            <button
              type="button"
              onClick={goNext}
              disabled={isLast}
              className={`rounded-full border px-3 py-2 text-sm bg-white active:scale-95 ${
                isLast ? "opacity-40 pointer-events-none" : "hover:bg-neutral-50"
              }`}
              aria-label="Página siguiente"
            >
              Siguiente →
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
