import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { mapProjectToProjectTagsSplit } from "@/lib/types/project/schema";
import { ProjectTagsSplit } from "@/lib/types/project/schema";
import HTMLFlipBookLib from "react-pageflip";

import { useProjectsContext } from "@/context/useProjectsContext";
import NextImage from "next/image";
import { Button, Image } from "@nextui-org/react";
import FavoriteButton from "../proyecto/[proyecto]/favorite-button";

import { Filter, SearchBar } from "@/components/home";
import Select from "@/components/home/Select";
import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const periodOptions = [
  { label: "Invierno", value: "invierno" },
  { label: "Febrero - Junio", value: "feb-jun" },
];

const HTMLFlipBook: any = HTMLFlipBookLib;

/* ----------- PORTADA ----------- */
function CoverPage({
  title,
  subtitle,
  periodLabel,
  year,
  totalProjects,
  careersCount,
  onlineCount,
  presencialCount,
}: {
  title: string;
  subtitle?: string;
  periodLabel?: string;
  year: number;
  totalProjects: number;
  careersCount: number;
  onlineCount: number;
  presencialCount: number;
}) {
  return (
    <article className="cover-sheet">
      <div className="cover-bg" />
      <header className="cover-top">
        <div className="brand">
          <span className="brand-dot" /> Servicio Social
        </div>
        {periodLabel && <span className="cover-period">{periodLabel}</span>}
      </header>
      <main className="cover-hero">
        <h1 className="cover-title">{title}</h1>
        <div
          className="cover-subtitle with-logo"
          aria-label={subtitle || "Revista de Servicio Social"}
          title={subtitle || "Revista de Servicio Social"}
        >
          <img
            className="cover-logo"
            src="https://jkbdulihyfxlypniuvhh.supabase.co/storage/v1/object/public/ServicioSocialProjectImages/servicio-logo.webp"
            alt="Servicio Social"
            width={96}
            height={96}
            loading="lazy"
          />
        </div>
        <div className="cover-metrics">
          <div className="metric">
            <span className="num">{totalProjects}</span>
            <span className="lbl">proyectos</span>
          </div>
          <div className="metric">
            <span className="num">{careersCount}</span>
            <span className="lbl">carreras</span>
          </div>
          <div className="metric">
            <span className="num">{onlineCount}</span>
            <span className="lbl">en línea</span>
          </div>
          <div className="metric">
            <span className="num">{presencialCount}</span>
            <span className="lbl">presencial</span>
          </div>
        </div>
      </main>
      <footer className="cover-bottom">
        <div className="chips">
          <span className="chip">
            <i className="c1" />
            Catálogo
          </span>
          <span className="chip">
            <i className="c2" />
            {year}
          </span>
          {periodLabel && (
            <span className="chip">
              <i className="c3" />
              {periodLabel}
            </span>
          )}
        </div>
      </footer>
    </article>
  );
}

export default function CatalogoMagazinePage() {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams()!;
  const { projects: contextProjects } = useProjectsContext();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const [projects, setProjects] = useState<ProjectTagsSplit[]>([]);
  const [selectedHours, setSelectedHours] = useState(
    searchParams.get("hours") || ""
  );
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [selectedTags, setSelectedTags] = useState(
    searchParams.get("tags") || ""
  );
  const [selectedModel, setSelectedModel] = useState(
    searchParams.get("model") || ""
  );
  const [selectedPeriod, setSelectedPeriod] = useState(
    searchParams.get("period") || ""
  );
  const [favoritesIDs, setFavoritesIDs] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // Flipbook: ref y estado de páginas
  const bookRef = useRef<any>(null);
  const [page, setPage] = useState(1);
  const [pagesTotal, setPagesTotal] = useState(1);
  const [isFirst, setIsFirst] = useState(true);
  const [isLast, setIsLast] = useState(false);

  const getApi = useCallback(() => {
    try {
      return bookRef.current?.pageFlip?.();
    } catch {
      return undefined;
    }
  }, []);

  const syncFromApi = useCallback(
    (api?: any) => {
      const _api = api ?? getApi();
      if (!_api) return;
      const idx = _api.getCurrentPageIndex?.() ?? 0;
      const total = _api.getPageCount?.() ?? 1;
      setPage(idx + 1);
      setPagesTotal(total);
      setIsFirst(idx <= 0);
      setIsLast(idx >= total - 1);
    },
    [getApi]
  );

  // === FLIP EXACTO POR ÍNDICE (evita saltos dobles) ===
  const safeFlip = useCallback(
    (dir: "prev" | "next") => {
      const api = getApi();
      if (!api) return;
      const idx = api.getCurrentPageIndex?.() ?? 0;
      const total = api.getPageCount?.() ?? 1;

      const target =
        dir === "prev" ? Math.max(0, idx - 1) : Math.min(total - 1, idx + 1);

      if (typeof api.turnToPage === "function") {
        api.turnToPage(target);
      } else {
        // fallback por si la API cambia
        if (dir === "prev" && idx > 0) api.flipPrev?.();
        if (dir === "next" && idx < total - 1) api.flipNext?.();
      }

      setTimeout(() => syncFromApi(api), 0);
    },
    [getApi, syncFromApi]
  );

  const goPrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      safeFlip("prev");
    },
    [safeFlip]
  );

  const goNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      safeFlip("next");
    },
    [safeFlip]
  );

  // detectar dispositivo
  useEffect(() => {
    function updateDeviceType() {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    }
    updateDeviceType();
    window.addEventListener("resize", updateDeviceType);
    return () => window.removeEventListener("resize", updateDeviceType);
  }, []);

  // navegación por teclado en escritorio
  useEffect(() => {
    if (isMobile) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") safeFlip("prev");
      if (e.key === "ArrowRight") safeFlip("next");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMobile, safeFlip]);

  const fetchProjects = useCallback(async () => {
    if (contextProjects && contextProjects.length > 0) {
      setProjects(contextProjects.filter((p) => p.status === "visible"));
      return;
    }
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("status", "visible");
    if (error) setError(error.message);
    else if (data)
      setProjects(data.map((p: any) => mapProjectToProjectTagsSplit(p)));
  }, [contextProjects, supabase]);

  const handleReset = () => {
    router.push(pathname);
    setSearchTerm("");
    setSelectedHours("");
    setSelectedTags("");
    setSelectedModel("");
    setSelectedPeriod("");
  };
  const handleSearch = (term: string) => {
    router.push(pathname + "?" + createQueryString("search", term));
    setSearchTerm(term.toLowerCase());
  };
  const handleTagsFilterChange = (val: string) => {
    router.push(pathname + "?" + createQueryString("tags", val));
    setSelectedTags(val);
  };
  const handleModelFilterChange = (val: string) => {
    router.push(pathname + "?" + createQueryString("model", val));
    setSelectedModel(val);
  };
  const handlePeriodFilterChange = (val: string) => {
    router.push(pathname + "?" + createQueryString("period", val));
    setSelectedPeriod(val);
  };
  const handleHoursFilterChange = (val: string) => {
    router.push(pathname + "?" + createQueryString("hours", val));
    setSelectedHours(val);
  };

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "{}");
    setFavoritesIDs(Object.keys(favorites).map(Number));
    fetchProjects();
  }, [fetchProjects, selectedPeriod]);

  const includesCsv = (csv: string, value: string | number) => {
    const list = String(csv || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    return list.length === 0 ? true : list.includes(String(value));
  };

  const filteredProjects = projects
    .filter(
      (p) =>
        (p.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.organization || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    )
    .filter((p) =>
      selectedTags ? p.tags.some((tag) => includesCsv(selectedTags, tag.name)) : true
    )
    .filter((p) => (selectedModel ? includesCsv(selectedModel, p.model) : true))
    .filter((p) => (selectedPeriod ? selectedPeriod === p.period : true))
    .filter((p) => (selectedHours ? includesCsv(selectedHours, p.hours ?? "") : true));

  const hoursOptions = useMemo(() => {
    const seen = new Set<string>();
    return projects
      .map((p) => String(p.hours || "").trim())
      .filter(Boolean)
      .filter((h) => {
        const normalized = h.toLowerCase();
        if (seen.has(normalized)) return false;
        seen.add(normalized);
        return true;
      })
      .map((hours) => ({ label: `${hours} Horas`, value: hours }));
  }, [projects]);


  const tagOptions = useMemo(
    () =>
      Array.from(
        new Set(projects.flatMap((p) => p.tags.map((tag) => tag.name)))
      ).map((tag) => ({ label: tag, value: tag })),
    [projects]
  );

  const modalityOptions = useMemo(
    () =>
      Array.from(new Set(projects.map((p) => p.model).filter(Boolean))).map(
        (mod) => ({ label: mod, value: mod })
      ),
    [projects]
  );

  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (projects.length === 0) return <div className="p-4">Cargando proyectos...</div>;

  const getPeriodLabel = (val?: string) =>
    periodOptions.find((o) => o.value === val)?.label || "";
  const isOnline = (model?: string) =>
    (model || "").toLowerCase().includes("línea") ||
    (model || "").toLowerCase().includes("linea") ||
    (model || "").toLowerCase().includes("online");

  const normalizeHours = (h?: string | number) => {
    if (h == null) return "—";
    const m = String(h).trim().match(/\d+/);
    return m ? m[0] : String(h);
  };

  const year = new Date().getFullYear() + 1;
  const periodLabelTop = getPeriodLabel(selectedPeriod);

  return (
    <main className="flex flex-col items-center py-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">
        Oferta Servicio Social — {selectedPeriod ? periodLabelTop + " — " : ""}
        {year}
      </h1>

      <div className="flex flex-col md:flex-row mb-4 gap-2 items-center w-full max-w-7xl px-3 md:px-0">
        <SearchBar searchTerm={searchTerm} onSearch={handleSearch} />
        <div className="flex flex-row flex-wrap gap-2">
          <Filter
            title="Horas"
            values={selectedHours}
            options={hoursOptions}
            onChange={handleHoursFilterChange}
          />
          <Filter
            title="Carrera"
            values={selectedTags}
            options={tagOptions}
            onChange={handleTagsFilterChange}
          />
          <Filter
            title="Modalidad"
            values={selectedModel}
            options={modalityOptions}
            onChange={handleModelFilterChange}
          />
          <Select
            title="Periodo"
            value={selectedPeriod}
            options={periodOptions}
            onChange={handlePeriodFilterChange}
          />
          {(searchTerm ||
            selectedHours ||
            selectedTags ||
            selectedModel ||
            selectedPeriod) && (
            <Button
              isIconOnly
              size="sm"
              color="secondary"
              onClick={handleReset}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Wrapper Flipbook */}
      <div className="book-wrap relative overscroll-none touch-pan-y select-none">
        <HTMLFlipBook
          ref={bookRef}
          key={`${searchTerm}-${selectedHours}-${selectedTags}-${selectedModel}-${selectedPeriod}`}
          size="stretch"
          autoSize
          width={isMobile ? 360 : 1000}       // Mobile: 360px, Desktop: 1000px
          height={isMobile ? 700 : 1400}      // Mobile: 700px, Desktop: 1400px
          minWidth={isMobile ? 320 : 800}     // Mobile: 320px, Desktop: 800px
          minHeight={isMobile ? 600 : 1000}   // Mobile: 600px, Desktop: 1000px
          maxWidth={isMobile ? 480 : 1600}    // Mobile: 480px, Desktop: 1600px
          maxHeight={isMobile ? 1000 : 2000}  // Mobile: 1000px, Desktop: 2000px
          usePortrait
          maxShadowOpacity={0.5}
          drawShadow
          startPage={0}
          /* 👇 Comportamiento condicional por dispositivo */
          disableFlipByClick={isMobile}        // en móvil NO click para pasar página
          useMouseEvents={!isMobile}           // en desktop permitir drag/click
          swipeDistance={isMobile ? 999 : 50}  // en móvil "anulamos" swipe
          clickEventForward={false}
          mobileScrollSupport={true}
          className="shadow-xl z-10"
          showPageCorners
          onInit={(inst: any) => {
            try {
              const api = inst?.pageFlip?.();
              syncFromApi(api);
            } catch {}
          }}
          onFlip={() => {
            syncFromApi();
          }}
        >
          {/* PORTADA */}
          {(() => {
            const totalProjects = filteredProjects.length;
            const careersCount = new Set(
              filteredProjects.flatMap((p) => (p.tags || []).map((t) => t.name))
            ).size;
            const onlineCount = filteredProjects.filter((p) =>
              isOnline(p.model)
            ).length;
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

          {/* PÁGINAS */}
          {filteredProjects.map((project) => {
            const periodLabel = getPeriodLabel(project?.period);
            const hoursText = project?.hours ? `${project.hours} horas` : "—";
            const activities = (project?.description || "")
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean);
            const abilitiesText = (() => {
              const raw =
                (project as any)?.abilities ?? (project as any)?.skills ?? "";
              return Array.isArray(raw)
                ? raw.filter(Boolean).join(", ")
                : String(raw || "").trim();
            })();

            return (
              <div key={project.id} className="page">
                <article className="sheet">
                  <header className="masthead">
                    <div className="fav" onClick={(e) => e.stopPropagation()}>
                      <FavoriteButton id={project.id.toString()} />
                    </div>
                    <div className="chips top" aria-hidden="true">
                      <span className="tag">{project?.model || "Modalidad"}</span>
                    </div>

                    <h1 className="title clamp-2">{project?.title}</h1>

                    <div
                      className="byline"
                      title={project?.organization || "Organización"}
                    >
                      <span className="org-name">
                        {project?.organization || "Organización"}
                      </span>
                      {periodLabel && <span className="sep">·</span>}
                    </div>

                    <div className="chips bottom" role="list">
                      {project?.tags?.slice(0, 3).map((t, i) => (
                        <span
                          className="chip"
                          key={`tag-${project.id}-${i}`}
                          role="listitem"
                          title={t.name}
                        >
                          <i className="c1" />
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </header>

                  <section className="content no-scroll">
                    <div>
                      <p className="kicker">Objetivo del proyecto</p>
                      <p className="lead clamp-4">{project?.objective || "—"}</p>

                      <div className="card">
                        <h3>Actividades a realizar</h3>
                        {activities.length ? (
                          <ul className="list list-clamped">
                            {activities.map(
                              (line, i) => line && (
                                <li className="clamp-1" key={i}>
                                  {line}
                                </li>
                              )
                            )}
                          </ul>
                        ) : (
                          <p className="lead" style={{ margin: 0 }}>
                            —
                          </p>
                        )}
                      </div>

                      {project?.population && (
                        <div className="card">
                          <div className="meta">
                            <span
                              className="dot"
                              style={{ background: "var(--color-4)" }}
                            />
                            <div>
                              <h3>Población que atiende</h3>
                              <p className="lead clamp-2" style={{ margin: 0 }}>
                                {project?.population}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {abilitiesText && (
                        <div className="card">
                          <div className="meta">
                            <span
                              className="dot"
                              style={{
                                background: "var(--color-4)",
                                boxShadow: "0 0 0 3px rgba(254,52,102,.16)",
                              }}
                            />
                            <div>
                              <h3>Competencias requeridas</h3>
                              <p className="lead clamp-3" style={{ margin: 0 }}>
                                {abilitiesText}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {project?.quota !== undefined &&
                        project?.quota !== null &&
                        String(project.quota).trim() !== "" && (
                          <div className="card">
                            <div className="meta">
                              <span
                                className="dot"
                                style={{
                                  background: "var(--color-5)",
                                  boxShadow: "0 0 0 3px rgba(254,205,51,.18)",
                                }}
                              />
                              <div>
                                <h3>Cupo</h3>
                                <p className="lead" style={{ margin: 0 }}>
                                  <b>{project.quota}</b> estudiantes
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                    </div>

                    <aside className="aside-col">
                      {project?.image && (
                        <figure className="org-media org-media--aside">
                          <Image
                            as={NextImage}
                            isBlurred
                            removeWrapper
                            alt={project?.title || "Imagen del proyecto"}
                            className="z-0 object-contain org-img"
                            src={
                              supabase.storage
                                .from("ServicioSocialProjectImages")
                                .getPublicUrl(project?.image).data.publicUrl
                            }
                            width={800}
                            height={480}
                          />
                        </figure>
                      )}

                      {project?.location && (
                        <div className="card">
                          <div className="meta">
                            <span
                              className="dot"
                              style={{
                                background: "var(--color-4)",
                                boxShadow: "0 0 0 3px rgba(254,52,102,.16)",
                              }}
                            />
                            <div>
                              <h3>Ubicación</h3>
                              <p className="lead clamp-2" style={{ margin: 0 }}>
                                {project?.location}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {project?.schedule && (
                        <div className="card">
                          <div className="meta">
                            <span className="dot" aria-hidden="true"></span>
                            <div>
                              <h3>Horario</h3>
                              <p className="lead clamp-2" style={{ margin: 0 }}>
                                {project?.schedule}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="card">
                        <div className="meta">
                          <span className="dot" style={{ background: "var(--color-5)" }} />
                          <div>
                            <h3>Horas máximas a acreditar</h3>
                            <p className="lead" style={{ margin: 0 }}>
                              Hasta <b>{normalizeHours(project?.hours)}</b>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="card">
                        <div className="meta">
                          <span className="dot"></span>
                          <div>
                            <h3>Duración</h3>
                            <p className="lead" style={{ margin: 0 }}>
                              {project?.duration || `Hasta ${hoursText}`}
                            </p>
                          </div>
                        </div>
                      </div>

                      {project?.period && (
                        <div className="card">
                          <div className="meta">
                            <span
                              className="dot"
                              style={{
                                background: "var(--color-4)",
                                boxShadow: "0 0 0 3px rgba(254,52,102,.16)",
                              }}
                            />
                            <div>
                              <h3>Periodo</h3>
                              <p className="lead clamp-2" style={{ margin: 0 }}>
                                {project?.period}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </aside>
                  </section>

                  <footer className="page-footer">
                    <div className="footer-row" role="list">
                      <span className="footer-label">Grupo:</span>
                      <span className="footer-value">
                        {(project?.group ?? "").toString().trim() || "—"}
                      </span>
                      <span className="footer-label">Clave:</span>
                      <span className="footer-value">
                        {(
                          ((project as any)?.groupKey ??
                            (project as any)?.group_key ??
                            "") as string
                        )
                          .toString()
                          .trim() || "—"}
                      </span>
                    </div>
                  </footer>
                </article>
              </div>
            );
          })}
        </HTMLFlipBook>

        {/* === ZONAS TÁCTILES (solo móvil) === */}
        <div className="md:hidden pointer-events-none">
          {/* Izquierda */}
          <div
            onClick={(e) => goPrev(e)}
            className="pointer-events-auto absolute left-0 top-1/2 -translate-y-1/2 h-[60%] w-[22%] z-30"
            aria-hidden
            title="Página anterior"
          />
          {/* Derecha */}
          <div
            onClick={(e) => goNext(e)}
            className="pointer-events-auto absolute right-0 top-1/2 -translate-y-1/2 h-[60%] w-[22%] z-30"
            aria-hidden
            title="Página siguiente"
          />
        </div>

        {/* === BOTONES VISIBLES (solo móvil) === */}
        <button
          type="button"
          aria-label="Página anterior"
          onClick={(e) => goPrev(e)}
          disabled={isFirst}
          className={`md:hidden absolute left-2 top-1/2 -translate-y-1/2 z-50 rounded-full border px-3 py-2 text-sm shadow-md bg-white/95 hover:bg-white active:scale-95 ${
            isFirst ? "opacity-40 pointer-events-none" : ""
          }`}
        >
          ◀
        </button>
        <button
          type="button"
          aria-label="Página siguiente"
          onClick={(e) => goNext(e)}
          disabled={isLast}
          className={`md:hidden absolute right-2 top-1/2 -translate-y-1/2 z-50 rounded-full border px-3 py-2 text-sm shadow-md bg-white/95 hover:bg-white active:scale-95 ${
            isLast ? "opacity-40 pointer-events-none" : ""
          }`}
        >
          ▶
        </button>

        {/* Contador (solo móvil) */}
        <div className="md:hidden pointer-events-none absolute inset-x-0 bottom-2 z-50 flex justify-center">
          <span className="pointer-events-auto rounded-full bg-white/90 px-3 py-1 text-xs shadow">
            {page} / {pagesTotal}
          </span>
        </div>
      </div>
    </main>
  );
}
