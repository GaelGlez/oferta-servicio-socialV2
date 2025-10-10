'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from "@/lib/supabase/client";
import { mapProjectToProjectTagsSplit } from '@/lib/types/project/schema';
import { ProjectTagsSplit } from '@/lib/types/project/schema';
import HTMLFlipBookLib from 'react-pageflip';

import { useProjectsContext } from '@/context/useProjectsContext';
import NextImage from "next/image";
import { Button, Image } from '@nextui-org/react';
import FavoriteButton from '../proyecto/[proyecto]/favorite-button';

import { Filter, SearchBar } from "@/components/home";
import Select from "@/components/home/Select";
import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const periodOptions = [
  { label: "Verano", value: "verano" },
  { label: "Agosto - Diciembre", value: "ago-dic" },
];

const HTMLFlipBook: any = HTMLFlipBookLib;

/* ----------- PORTADA ----------- */
function CoverPage({
  title, subtitle, periodLabel, year,
  totalProjects, careersCount, onlineCount, presencialCount,
}: {
  title: string; subtitle?: string; periodLabel?: string; year: number;
  totalProjects: number; careersCount: number; onlineCount: number; presencialCount: number;
}) {
  return (
    <article className="cover-sheet">
      <div className="cover-bg" />
      <header className="cover-top">
        <div className="brand"><span className="brand-dot" /> Servicio Social</div>
        {periodLabel && <span className="cover-period">{periodLabel}</span>}
      </header>
      <main className="cover-hero">
        <h1 className="cover-title">{title}</h1>
        {subtitle ? <p className="cover-subtitle">{subtitle}</p> : null}
        <div className="cover-metrics">
          <div className="metric"><span className="num">{totalProjects}</span><span className="lbl">proyectos</span></div>
          <div className="metric"><span className="num">{careersCount}</span><span className="lbl">carreras</span></div>
          <div className="metric"><span className="num">{onlineCount}</span><span className="lbl">en línea</span></div>
          <div className="metric"><span className="num">{presencialCount}</span><span className="lbl">presencial</span></div>
        </div>
      </main>
      <footer className="cover-bottom">
        <div className="chips">
          <span className="chip"><i className="c1" />Catálogo</span>
          <span className="chip"><i className="c2" />{year}</span>
          {periodLabel && <span className="chip"><i className="c3" />{periodLabel}</span>}
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

  const createQueryString = useCallback((name: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(name, value);
    return params.toString();
  }, [searchParams]);

  const [projects, setProjects] = useState<ProjectTagsSplit[]>([]);
  const [selectedHours, setSelectedHours] = useState(searchParams.get('hours') || '');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedTags, setSelectedTags] = useState(searchParams.get('tags') || '');
  const [selectedModel, setSelectedModel] = useState(searchParams.get('model') || '');
  const [selectedPeriod, setSelectedPeriod] = useState(searchParams.get('period') || '');
  const [favoritesIDs, setFavoritesIDs] = useState<number[]>([]); // opcional: eliminar si no lo usas
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (contextProjects && contextProjects.length > 0) {
      setProjects(contextProjects.filter(p => p.status === "visible"));
      return;
    }
    const { data, error } = await supabase.from("projects").select("*").eq("status", "visible");
    if (error) setError(error.message);
    else if (data) setProjects(data.map((p: any) => mapProjectToProjectTagsSplit(p)));
  }, [contextProjects, supabase]);

  const handleReset = () => {
    router.push(pathname);
    setSearchTerm(''); setSelectedHours(''); setSelectedTags(''); setSelectedModel(''); setSelectedPeriod('');
  };
  const handleSearch = (term: string) => { router.push(pathname + '?' + createQueryString('search', term)); setSearchTerm(term.toLowerCase()); };
  const handleTagsFilterChange = (val: string) => { router.push(pathname + '?' + createQueryString('tags', val)); setSelectedTags(val); };
  const handleModelFilterChange = (val: string) => { router.push(pathname + '?' + createQueryString('model', val)); setSelectedModel(val); };
  const handlePeriodFilterChange = (val: string) => { router.push(pathname + '?' + createQueryString('period', val)); setSelectedPeriod(val); };
  const handleHoursFilterChange = (val: string) => { router.push(pathname + '?' + createQueryString('hours', val)); setSelectedHours(val); };

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "{}");
    setFavoritesIDs(Object.keys(favorites).map(Number));
    fetchProjects();
  }, [fetchProjects, selectedPeriod]);

  // helpers
  const includesCsv = (csv: string, value: string | number) => {
    const list = String(csv || '').split(',').map(s => s.trim()).filter(Boolean);
    return list.length === 0 ? true : list.includes(String(value));
  };

  const filteredProjects = projects
    .filter(p => (p.title||'').toLowerCase().includes(searchTerm.toLowerCase()) ||
                 (p.organization||'').toLowerCase().includes(searchTerm.toLowerCase()))
    .filter(p => selectedTags ? p.tags.some(tag => includesCsv(selectedTags, tag.name)) : true)
    .filter(p => selectedModel ? includesCsv(selectedModel, p.model) : true)
    .filter(p => selectedPeriod ? selectedPeriod === p.period : true)
    .filter(p => selectedHours ? includesCsv(selectedHours, p.hours ?? '') : true);

  const hoursOptions = useMemo(() =>
    Array.from(new Set(projects.map(p => p.hours).filter(Boolean)))
      .map(hours => ({ label: `${hours} Horas`, value: hours }))
  , [projects]);

  const tagOptions = useMemo(() =>
    Array.from(new Set(projects.flatMap(p => p.tags.map(tag => tag.name))))
      .map(tag => ({ label: tag, value: tag }))
  , [projects]);

  const modalityOptions = useMemo(() =>
    Array.from(new Set(projects.map(p => p.model).filter(Boolean)))
      .map(mod => ({ label: mod, value: mod }))
  , [projects]);

  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (projects.length === 0) return <div className="p-4">Cargando proyectos...</div>;

  const getPeriodLabel = (val?: string) => periodOptions.find(o => o.value === val)?.label || '';
  const isOnline = (model?: string) => (model||'').toLowerCase().includes('línea') || (model||'').toLowerCase().includes('linea') || (model||'').toLowerCase().includes('online');
  const orgBadgeText = (org?: string) => {
    const txt = (org || '').trim();
    if (!txt) return 'PROYECTO';
    if (txt.length <= 18) return txt.toUpperCase();
    const mid = Math.ceil(txt.length / 2);
    return (txt.slice(0, mid).trim() + '\n' + txt.slice(mid).trim()).toUpperCase();
  };
  const normalizeHours = (h?: string | number) => {
    if (h == null) return '—';
    const m = String(h).trim().match(/\d+/);
    return m ? m[0] : String(h);
  };

  const year = new Date().getFullYear();
  const periodLabelTop = getPeriodLabel(selectedPeriod);

  return (
    <main className="flex flex-col items-center py-4">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">
        Catálogo estilo revista — {selectedPeriod ? periodLabelTop + " — " : ''}{year}
      </h1>

      {/* Controles */}
      <div className="flex flex-col md:flex-row mb-4 gap-2 items-center w-full max-w-7xl">
        <SearchBar searchTerm={searchTerm} onSearch={handleSearch} />
        <div className="flex flex-row gap-2">{/* <-- corregido: gap-2 */}
          <Filter title="Horas" values={selectedHours} options={hoursOptions} onChange={handleHoursFilterChange} />
          <Filter title="Carrera" values={selectedTags} options={tagOptions} onChange={handleTagsFilterChange} />
          <Filter title="Modalidad" values={selectedModel} options={modalityOptions} onChange={handleModelFilterChange} />
          <Select title="Periodo" value={selectedPeriod} options={periodOptions} onChange={handlePeriodFilterChange} />
          {(searchTerm || selectedHours || selectedTags || selectedModel || selectedPeriod) && (
            <Button isIconOnly size="sm" color="secondary" onClick={handleReset}><X className="w-4 h-4" /></Button>
          )}
        </div>
      </div>

      {/* Libro */}
      <div className="book-wrap">
        <HTMLFlipBook
          key={`${searchTerm}-${selectedHours}-${selectedTags}-${selectedModel}-${selectedPeriod}`}
          size="stretch" autoSize
          width={1100} height={1558} minWidth={520} maxWidth={1400} minHeight={736} maxHeight={1983}
          showCover usePortrait maxShadowOpacity={0.5} drawShadow startPage={0}
          flippingTime={800} clickEventForward={false} mobileScrollSupport={false}
          className="shadow-xl" useMouseEvents swipeDistance={50} showPageCorners disableFlipByClick={false}
        >
          {/* PORTADA */}
          {(() => {
            const totalProjects = filteredProjects.length;
            const careersCount = new Set(filteredProjects.flatMap(p => (p.tags || []).map(t => t.name))).size;
            const onlineCount = filteredProjects.filter(p => isOnline(p.model)).length;
            const presencialCount = totalProjects - onlineCount;

            return (
              <div key="cover" className="page hard cover-page" data-density="hard">
                <CoverPage
                  title="Catálogo de Proyectos" subtitle="Revista de Servicio Social"
                  periodLabel={periodLabelTop} year={year}
                  totalProjects={totalProjects} careersCount={careersCount}
                  onlineCount={onlineCount} presencialCount={presencialCount}
                />
              </div>
            );
          })()}

          {/* PÁGINAS */}
          {filteredProjects.map((project) => {
            const periodLabel = getPeriodLabel(project?.period);
            const hoursText = project?.hours ? `${project.hours} horas` : '—';
            const badge = orgBadgeText(project?.organization);

            const activities = (project?.description || '').split('\n').map(s => s.trim()).filter(Boolean);

            const groupKey = (project as any)?.groupKey ?? (project as any)?.group_key ?? '';
            const abilitiesText = (() => {
              const raw = (project as any)?.abilities ?? (project as any)?.skills ?? '';
              return Array.isArray(raw) ? raw.filter(Boolean).join(', ') : String(raw || '').trim();
            })();

            return (
              <div key={project.id} className="page">
                <article className="sheet">
                  <header className="masthead">
                    <div className="fav"><FavoriteButton id={project.id.toString()} /></div>
                    <div className="chips top" aria-hidden="true">
                      <span className="tag">{project?.model || 'Modalidad'}</span>
                    </div>

                    <h1 className="title clamp-2">{project?.title}</h1>

                    <div className="byline" title={project?.organization || 'Organización'}>
                      <span className="org-name">{project?.organization || 'Organización'}</span>
                      {periodLabel && <span className="sep">·</span>}
                    </div>

                    {/* SOLO tags en el header */}
                    <div className="chips bottom" role="list">
                      {project?.tags?.slice(0, 3).map((t, i) => (
                        <span className="chip" key={`tag-${project.id}-${i}`} role="listitem" title={t.name}>
                          <i className="c1" />{t.name}
                        </span>
                      ))}
                    </div>
                  </header>

                  <section className="content no-scroll">
                    {/* Columna izquierda */}
                    <div>
                      <p className="kicker">Objetivo del proyecto</p>
                      <p className="lead clamp-4">{project?.objective || '—'}</p>

                      <div className="card">
                        <h3>Actividades a realizar</h3>
                        {activities.length ? (
                          <ul className="list list-clamped">
                            {activities.map((line, i) => line && <li className="clamp-1" key={i}>{line}</li>)}
                          </ul>
                        ) : (
                          <p className="lead" style={{margin:0}}>—</p>
                        )}
                      </div>

                      {project?.population && (
                        <div className="card">
                          <div className="meta">
                            <span className="dot" style={{ background: 'var(--color-4)' }} />
                            <div>
                              <h3>Población que atiende</h3>
                              <p className="lead clamp-2" style={{margin:0}}>{project?.population}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {abilitiesText && (
                        <div className="card">
                          <div className="meta">
                            <span className="dot" style={{ background: 'var(--color-4)', boxShadow:'0 0 0 3px rgba(254,52,102,.16)' }} />
                            <div>
                              <h3>Competencias requeridas</h3>
                              <p className="lead clamp-3" style={{margin:0}}>{abilitiesText}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {project?.quota !== undefined && project?.quota !== null && String(project.quota).trim() !== '' && (
                        <div className="card">
                          <div className="meta">
                            <span className="dot" style={{ background: 'var(--color-5)', boxShadow:'0 0 0 3px rgba(254,205,51,.18)' }} />
                            <div>
                              <h3>Cupo</h3>
                              <p className="lead" style={{margin:0}}><b>{project.quota}</b> estudiantes</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Columna derecha (IMAGEN ARRIBA) */}
                    <aside className="aside-col">
                      {project?.image && (
                        <figure className="org-media org-media--aside">{/* sin 'card' */}
                          <Image
                            as={NextImage}
                            isBlurred
                            removeWrapper
                            alt={project?.title || 'Imagen del proyecto'}
                            className="z-0 object-contain org-img"
                            src={supabase.storage.from('ServicioSocialProjectImages').getPublicUrl(project?.image).data.publicUrl}
                            width={800}
                            height={480}
                          />
                        </figure>
                      )}

                      {project?.location && (
                        <div className="card">
                          <div className="meta">
                            <span className="dot" style={{ background: 'var(--color-4)', boxShadow:'0 0 0 3px rgba(254,52,102,.16)' }} />
                            <div>
                              <h3>Ubicación</h3>
                              <p className="lead clamp-2" style={{margin:0}}>{project?.location}</p>
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
                              <p className="lead clamp-2" style={{margin:0}}>{project?.schedule}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="card">
                        <div className="meta">
                          <span className="dot" style={{ background: 'var(--color-5)' }} />
                          <div>
                            <h3>Horas máximas a acreditar</h3>
                            <p className="lead" style={{margin:0}}>
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
                            <p className="lead" style={{margin:0}}>{project?.duration || `Hasta ${hoursText}`}</p>
                          </div>
                        </div>
                      </div>

                    </aside>
                  </section>

                  {/* FOOTER fijo con group y groupKey */}
                  <footer className="page-footer">
                    <div className="footer-row" role="list">
                      <span className="footer-label">Grupo:</span>
                      <span className="footer-value">
                        {(project?.group ?? '').toString().trim() || '—'}
                      </span>

                      <span className="footer-label">Clave:</span>
                      <span className="footer-value">
                        {(groupKey ?? '').toString().trim() || '—'}
                      </span>
                    </div>
                  </footer>

                </article>
              </div>
            );
          })}
        </HTMLFlipBook>
      </div>

      <style jsx global>{`
        :root{
          --color-1:#B976A9; --color-2:#B9008A; --color-3:#CDFE33; --color-4:#FE3466; --color-5:#FECD33;
          --ink:#0f1220; --muted:#6b7180; --paper:#fff9f7; --line:#e8e3df;
          --shadow: 0 30px 80px rgba(16,20,40,.12), 0 10px 30px rgba(16,20,40,.10);
          --p: clamp(10px, 1.4vw, 16px); --gap: clamp(10px, 1.6vw, 18px); --radius: 16px;
        }

        .book-wrap{ width: min(96vw, 1400px); aspect-ratio: 480 / 680;
          height: calc(min(96vw, 1400px) * 680 / 480); margin-inline: auto; }

        .page, .cover-page{ width:100%; height:100%; }
        .page > .sheet{ height:100%; display:flex; flex-direction:column; }

        .sheet{ width:100%; background:var(--paper); box-shadow:var(--shadow);
          border-radius:var(--radius); overflow:hidden; position:relative; display:flex; flex-direction:column; }

        .masthead{
          position:relative;
          background: linear-gradient(135deg, var(--color-2) 0%, var(--color-1) 55%, var(--color-5) 120%);
          color:white; padding: calc(var(--p) + 6px) var(--p) calc(var(--p) - 2px);
        }
        .fav{ position:absolute; top:10px; right:10px; z-index:2; filter: drop-shadow(0 2px 8px rgba(0,0,0,.25)); }

        .chips{ display:flex; gap:8px; flex-wrap:wrap }
        .chips.top{ margin-bottom:8px } .chips.bottom{ margin-top:8px; row-gap:6px }
        .tag{ display:inline-block; background:rgba(255,255,255,.16); border:1px solid rgba(255,255,255,.35); padding:6px 12px; border-radius:999px; font-size:.82rem; }
        .chip{ display:inline-flex; gap:8px; align-items:center; border-radius:999px; border:1px solid rgba(255,255,255,.35);
          padding:6px 10px; font-size:.85rem; background:rgba(255,255,255,.12); backdrop-filter: blur(2px); }
        .chip i{ width:8px; height:8px; border-radius:50%; background:#fff }
        .chip .c1{ background:var(--color-3) } .chip .c2{ background:var(--color-4) } .chip .c3{ background:var(--color-5) }

        .title{ margin:10px 0 4px; font-size: clamp(20px, 2.8vw, 32px); line-height:1.15; font-weight:800 }
        .byline{ display:flex; align-items:center; gap:8px; font-size: clamp(13px, 1.5vw, 15px); color:#fff; opacity:.95; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .org-name{ font-weight:700; max-width:60%; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .byline .sep{ opacity:.7 } .period{ white-space:nowrap; }

        .content.no-scroll{
          display:grid; grid-template-columns: 1.25fr .85fr;
          gap:var(--gap); padding: calc(var(--p) + 4px) var(--p) calc(var(--p) + 8px);
          flex:1 1 auto; align-items:start; overflow:hidden;
        }
        @media (max-width: 1024px){ .content.no-scroll{grid-template-columns: 1.2fr .95fr} }
        @media (max-width: 860px){
          .book-wrap{ width: 96vw; height: calc(96vw * 680 / 480); }
          .content.no-scroll{grid-template-columns:1fr; padding: var(--p)}
        }

        .lead{font-size:clamp(13px,1.3vw,15px); color:var(--muted); margin:6px 0 14px}
        .kicker{ text-transform:uppercase; letter-spacing:.12em; font-weight:800; font-size:.78rem; color:var(--color-2) }

        .card{ background:#fff; border:1px solid var(--line); border-radius:14px; padding:12px 14px; box-shadow:0 2px 0 rgba(0,0,0,.02) }
        .card + .card{margin-top:10px}
        .card h3{margin:.1rem 0 .25rem; font-size:clamp(.96rem, 1.3vw, 1.05rem)}
        .meta{display:grid; grid-template-columns: 14px 1fr; gap:6px; align-items:flex-start}
        .dot{width:6px; height:6px; border-radius:999px; margin-top:6px; background:var(--color-2); box-shadow:0 0 0 3px rgba(185,0,138,.15)}

        .list{margin: 8px 0 0; padding-left:18px}
        .list li{margin:6px 0}

        .org-media{overflow:hidden; border-radius:12px; padding:0; background:transparent}
        .org-media .org-img{ width:100%; height:auto; display:block; object-fit:contain; max-height: 140px; }
        .org-media--aside .org-img{ max-height: 120px; }
        .aside-col .org-media { margin-bottom: 8px; } /* aire bajo la imagen */

        /* ASIDE compacto y sello al fondo */
        .aside-col{ display:flex; flex-direction:column; gap:10px; min-height:0; }
        .aside-col .badge{
          margin-top:auto; max-height:72px; overflow:hidden; line-height:1.05;
          padding:10px 12px; border:1px dashed var(--line); border-radius:12px;
          font-weight:800; font-size:clamp(12px,1.2vw,14px); background:#fff;
        }
        .aside-col .badge span{ display:inline }

        /* Footer centrado */
        .page-footer{
          margin-top:auto;
          padding: 14px var(--p);
          border-top: 1px solid var(--line);
          background:#fff;
        }
        .footer-row{
          display:flex;
          flex-wrap:wrap;
          gap: 14px;
          justify-content:center;
          align-items:center;
        }
        .footer-label,
        .footer-value{
          font-size: clamp(16px, 1.8vw, 20px);
          line-height: 1.2;
          font-weight: 900;
          color: var(--ink);
        }

        /* --------- PORTADA --------- */
        .cover-sheet{ position: relative; height: 100%;
          display: grid; grid-template-rows: auto 1fr auto; padding: 20px; overflow: hidden;
          color: #0f1220; isolation: isolate; border-radius: 16px; }
        .cover-bg{ position:absolute; inset:0; z-index:-1;
          background:
            radial-gradient(1200px 600px at -10% 10%, rgba(205,254,51,.18) 0%, rgba(205,254,51,0) 60%),
            radial-gradient(800px 800px at 110% 10%, rgba(254,52,102,.20) 0%, rgba(254,52,102,0) 60%),
            linear-gradient(135deg, #B9008A 0%, #B976A9 45%, #FECD33 120%);
          filter: saturate(1.05) contrast(1.02); }
        .cover-top{ display:flex; align-items:center; justify-content:space-between; }
        .brand{ display:flex; align-items:center; gap:8px; font-weight:800; color:#fff; letter-spacing:.02em; text-transform:uppercase; font-size:.9rem; }
        .brand-dot{ width:10px; height:10px; border-radius:50%; background:#CDFE33; box-shadow:0 0 0 4px rgba(205,254,51,.25) }
        .cover-period{ color:#fff; font-weight:700; background:rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.35); padding:6px 12px; border-radius:999px; backdrop-filter: blur(2px); }
        .cover-hero{ display:grid; place-items:center; text-align:center; gap:10px; padding-inline: 12px; }
        .cover-title{ color:#fff; font-weight:900; line-height:1.02; font-size: clamp(28px, 6.0vw, 44px); text-shadow: 0 6px 28px rgba(0,0,0,.18); letter-spacing:.2px; }
        .cover-subtitle{ color:#fff; opacity:.95; font-size: clamp(14px, 3.0vw, 18px); }
        .cover-metrics{ display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 10px; margin-top: 8px; }
        .metric{ background: rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.35); border-radius: 14px; padding: 10px 8px; color:#fff; backdrop-filter: blur(2px); }
        .metric .num{ display:block; font-size: clamp(18px, 5vw, 28px); font-weight: 900; line-height: 1; }
        .metric .lbl{ display:block; font-size: .8rem; opacity:.95; margin-top:2px; }

        /* =======================
           IMPRESIÓN: evitar cortes
           ======================= */
        @media print {
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .sheet{ box-shadow: none !important; }
          .page-footer{ border-top: 1px solid #ccc; background: #fff; }

          /* Quitar clamps/ellipsis y permitir que el texto envuelva */
          .clamp-1, .clamp-2, .clamp-3, .clamp-4 {
            display: block !important;
            -webkit-line-clamp: unset !important;
            -webkit-box-orient: unset !important;
            overflow: visible !important;
          }
          .title {
            white-space: normal !important;
            overflow: visible !important;
            text-overflow: clip !important;
            word-break: break-word;
            overflow-wrap: anywhere;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .byline, .org-name {
            white-space: normal !important;
            overflow: visible !important;
            text-overflow: clip !important;
            word-break: break-word;
            overflow-wrap: anywhere;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .masthead {
            page-break-inside: avoid;
            break-inside: avoid;
            padding-bottom: 12px;
          }
          .sheet, .content.no-scroll { overflow: visible !important; }
        }

        @media (max-width: 860px){
          .content.no-scroll{grid-template-columns:1fr; padding: var(--p)}
          .org-media--aside .org-img{ max-height: 140px; }
          .page-footer{ padding: 12px var(--p); }
          .footer-row{ gap: 10px; }
        }
      `}</style>
    </main>
  );
}
