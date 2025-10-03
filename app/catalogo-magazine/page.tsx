'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from "@/lib/supabase/client";
import { mapProjectToProjectTagsSplit } from '@/lib/types/project/schema';
import { ProjectTagsSplit } from '@/lib/types/project/schema';
import HTMLFlipBookLib  from 'react-pageflip';

import { useProjectsContext } from '@/context/useProjectsContext';
import NextImage from "next/image";
import { Button, Image } from '@nextui-org/react';
import FavoriteButton from '../proyecto/[proyecto]/favorite-button';

import { Filter, SearchBar } from "@/components/home";
import Select from "@/components/home/Select";
import { Clock, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const periodOptions = [
  { label: "Verano", value: "verano" },
  { label: "Agosto - Diciembre", value: "ago-dic" },
];

const HTMLFlipBook: any = HTMLFlipBookLib;

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
  const [selectedHours, setSelectedHours] = useState(searchParams.get('hours') || '');
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedTags, setSelectedTags] = useState(searchParams.get('tags') || '');
  const [selectedModel, setSelectedModel] = useState(searchParams.get('model') || '');
  const [selectedPeriod, setSelectedPeriod] = useState(searchParams.get('period') || '');
  const [favoritesIDs, setFavoritesIDs] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (contextProjects && contextProjects.length > 0) {
      setProjects(contextProjects.filter(p => p.status === "visible"));
      return;
    }
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("status", "visible");
    if (error) setError(error.message);
    else if (data) {
      const parsed = data.map((p: any) => mapProjectToProjectTagsSplit(p));
      setProjects(parsed);
    }
  }, [contextProjects, supabase]);

  const handleReset = () => {
    router.push(pathname);
    setSearchTerm('');
    setSelectedHours('');
    setSelectedTags('');
    setSelectedModel('');
    setSelectedPeriod('');
  };
  const handleSearch = (term: string) => {
    router.push(pathname + '?' + createQueryString('search', term));
    setSearchTerm(term.toLowerCase());
  };
  const handleTagsFilterChange = (val: string) => {
    router.push(pathname + '?' + createQueryString('tags', val));
    setSelectedTags(val);
  };
  const handleModelFilterChange = (val: string) => {
    router.push(pathname + '?' + createQueryString('model', val));
    setSelectedModel(val);
  };
  const handlePeriodFilterChange = (val: string) => {
    router.push(pathname + '?' + createQueryString('period', val));
    setSelectedPeriod(val);
  };
  const handleHoursFilterChange = (val: string) => {
    router.push(pathname + '?' + createQueryString('hours', val));
    setSelectedHours(val);
  };

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "{}");
    setFavoritesIDs(Object.keys(favorites).map(Number));
    fetchProjects();
  }, [fetchProjects, selectedPeriod]);

  const filteredProjects = projects
    .filter(p =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.organization.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(p => selectedTags ? p.tags.some(tag => selectedTags.includes(tag.name)) : true)
    .filter(p => selectedModel ? selectedModel.includes(p.model) : true)
    .filter(p => selectedPeriod ? selectedPeriod === p.period : true)
    .filter((p) => (selectedHours.length === 0 ? true : selectedHours.includes(p.hours)));

  const hoursOptions = useMemo(
    () => Array.from(new Set(projects.map(p => p.hours)))
            .map(hours => ({ label: `${hours} Horas`, value: hours })),
    [projects]
  );
  const tagOptions = useMemo(
    () => Array.from(new Set(projects.flatMap(p => p.tags.map(tag => tag.name))))
            .map(tag => ({ label: tag, value: tag })),
    [projects]
  );
  const modalityOptions = useMemo(
    () => Array.from(new Set(projects.map(p => p.model)))
            .map(mod => ({ label: mod, value: mod })),
    [projects]
  );

  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (projects.length === 0) return <div className="p-4">Cargando proyectos...</div>;

  const getPeriodLabel = (val?: string) =>
    periodOptions.find(o => o.value === val)?.label || '';

  const isOnline = (model?: string) =>
    (model || '').toLowerCase().includes('línea') ||
    (model || '').toLowerCase().includes('linea') ||
    (model || '').toLowerCase().includes('online');

  const orgBadgeText = (org?: string) => {
    const txt = (org || '').trim();
    if (!txt) return 'PROYECTO';
    if (txt.length <= 18) return txt.toUpperCase();
    const mid = Math.ceil(txt.length / 2);
    return (txt.slice(0, mid).trim() + '\n' + txt.slice(mid).trim()).toUpperCase();
  };

  return (
    <main className="flex flex-col items-center py-6">
      <h1 className="text-3xl font-bold mb-6">
        Catálogo estilo revista - {selectedPeriod ? getPeriodLabel(selectedPeriod) + " -" : ''} {new Date().getFullYear()}
      </h1>

      <div className="flex flex-col md:flex-row mb-6 gap-2 items-center w-full">
        <SearchBar searchTerm={searchTerm} onSearch={handleSearch} />
        <div className="flex flex-row gap-2">
          <Filter title="Horas" values={selectedHours} options={hoursOptions} onChange={handleHoursFilterChange} />
          <Filter title="Carrera" values={selectedTags} options={tagOptions} onChange={handleTagsFilterChange} />
          <Filter title="Modalidad" values={selectedModel} options={modalityOptions} onChange={handleModelFilterChange} />
          <Select title="Periodo" value={selectedPeriod} options={periodOptions} onChange={handlePeriodFilterChange} />
          {(searchTerm || selectedHours || selectedTags || selectedModel || selectedPeriod) && (
            <Button isIconOnly size="sm" color="secondary" startContent={<X className="w-4 h-4" />} onClick={handleReset} />
          )}
        </div>
      </div>

      {/* Flipbook con tamaño fijo para todas las hojas */}
      <HTMLFlipBook
        key={`${searchTerm}-${selectedHours}-${selectedTags}-${selectedModel}-${selectedPeriod}`}
        size="fixed"
        width={480}
        height={680}
        autoSize={false}
        showCover
        usePortrait
        maxShadowOpacity={0.5}
        drawShadow
        startPage={0}
        flippingTime={1000}
        clickEventForward={false}
        mobileScrollSupport={false}
        className="shadow-xl"
        useMouseEvents
        swipeDistance={50}
        showPageCorners
        disableFlipByClick={false}
      >
        {filteredProjects.map((project) => {
          const periodLabel = getPeriodLabel(project?.period);
          const hoursText = project?.hours ? `${project.hours} horas` : '—';
          const badge = orgBadgeText(project?.organization);

          return (
            <div key={project.id} className="page">
              <article className="sheet">
                {/* HEADER con byline de organización */}
                <header className="masthead">
                  {/* Favorito */}
                  <div className="fav">
                    <FavoriteButton id={project.id.toString()} />
                  </div>

                  {/* Fila superior: modelo */}
                  <div className="chips top" aria-hidden="true">
                    <span className="tag">{project?.model || 'Modalidad'}</span>
                  </div>

                  {/* Título */}
                  <h1 className="title">{project?.title}</h1>

                  {/* Byline: Organización + Periodo (opción 1) */}
                  <div className="byline" title={project?.organization || 'Organización'}>
                    {/* Si tienes logo en tu tabla, descomenta y usa project.logo (o el campo que corresponda) */}
                    {/*
                    {project?.logo && (
                      <img
                        className="org-logo"
                        src={supabase.storage.from('ServicioSocialProjectImages').getPublicUrl(project.logo).data.publicUrl}
                        alt={project?.organization || 'Logo'}
                        width={20} height={20}
                      />
                    )}
                    */}
                    <span className="org-name">{project?.organization || 'Organización'}</span>
                    {periodLabel && <span className="sep">·</span>}
                    {periodLabel && <span className="period"><b>{periodLabel}</b></span>}
                  </div>

                  {/* Chips inferiores: grupo y tags */}
                  <div className="chips bottom" role="list">
                    {project?.group && (
                      <span className="chip" role="listitem"><i className="c3" />{project.group}</span>
                    )}
                    {project?.tags?.slice(0, 3).map((t, i) => (
                      <span className="chip" key={i} role="listitem">
                        <i className="c3" />{t.name}
                      </span>
                    ))}
                  </div>
                </header>

                {/* CONTENIDO */}
                <section className="content">
                  <div>
                    <p className="kicker">Objetivo del proyecto</p>
                    <p className="lead">{project?.objective || '—'}</p>

                    <div className="card">
                      <h3>Actividades a realizar</h3>
                      {project?.description
                        ? <ul className="list">
                            {project.description.split('\n').map((line, i) => line.trim() && <li key={i}>{line}</li>)}
                          </ul>
                        : <p className="lead" style={{margin:0}}>—</p>}
                    </div>

                    {project?.image && (
                      <figure className="card org-media" style={{ marginTop: 12 }}>
                        <Image
                          as={NextImage}
                          isBlurred
                          removeWrapper
                          alt={project?.title || 'Imagen del proyecto'}
                          className="z-0 group-hover/card:scale-105 transition-all duration-200 ease-in-out object-contain"
                          src={supabase.storage.from('ServicioSocialProjectImages').getPublicUrl(project?.image).data.publicUrl}
                          width={1200}
                          height={800}
                        />
                      </figure>
                    )}
                  </div>

                  <aside>
                    <div className="card">
                      <div className="meta">
                        <span className="dot" style={{ background: 'var(--color-5)' }} />
                        <div>
                          <h3>Horas máximas a acreditar</h3>
                          <p className="lead" style={{margin:0}}>Hasta <b>{project?.hours || '—'}</b></p>
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <div className="meta">
                        <span className="dot"></span>
                        <div>
                          <h3>Duración</h3>
                          <p className="lead" style={{margin:0}}>
                            {project?.duration || `Hasta ${hoursText}`}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="card">
                      <div className="meta">
                        <span className="dot" aria-hidden="true"></span>
                        <div>
                          <h3>Horario</h3>
                          <p className="lead" style={{margin:0}}>
                            {project?.schedule || 'Por confirmar'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {project?.skills && (
                      <div className="card">
                        <div className="meta">
                          <span className="dot" style={{ background: 'var(--color-4)', boxShadow:'0 0 0 3px rgba(254,52,102,.16)' }} />
                          <div>
                            <h3>Competencias requeridas</h3>
                            <p className="lead" style={{margin:0}}>
                              {project?.skills}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {project?.quota && (
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

                    {project?.population && (
                      <div className="card">
                        <div className="meta">
                          <span className="dot" style={{ background: 'var(--color-4)' }} />
                          <div>
                            <h3>Población que atiende</h3>
                            <p className="lead" style={{margin:0}}>{project.population}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Sello lateral opcional */}
                    <div className="badge" title={project?.organization || 'Organización'}>
                      {badge.split('\n').map((line, idx) => <span key={idx}>{line}<br/></span>)}
                    </div>
                  </aside>
                </section>
              </article>
            </div>
          );
        })}
      </HTMLFlipBook>

      <style jsx global>{`
        :root{
          --color-1:#B976A9;
          --color-2:#B9008A;
          --color-3:#CDFE33;
          --color-4:#FE3466;
          --color-5:#FECD33;
          --ink:#0f1220;
          --muted:#6b7180;
          --paper:#fff9f7;
          --line:#e8e3df;
          --shadow: 0 30px 80px rgba(16,20,40,.12), 0 10px 30px rgba(16,20,40,.10);
          --p: clamp(12px, 1.6vw, 18px);
          --gap: clamp(12px, 1.8vw, 24px);
          --radius: 20px;
          --focus: 0 0 0 3px rgba(185,0,138,.25), 0 0 0 6px rgba(185,0,138,.15);
        }

        .page{ width: 480px; height: 680px; }
        .page > .sheet{
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .sheet{
          width: 100%;
          background:var(--paper);
          box-shadow:var(--shadow);
          border-radius:var(--radius);
          overflow:hidden; position:relative;
          display:flex; flex-direction:column;
        }

        .masthead{
          position:relative;
          background: linear-gradient(135deg, var(--color-2) 0%, var(--color-1) 55%, var(--color-5) 120%);
          color:white;
          padding: calc(var(--p) + 8px) var(--p) calc(var(--p) - 2px);
        }
        .fav{
          position:absolute; top:10px; right:10px;
          z-index:2;
          filter: drop-shadow(0 2px 8px rgba(0,0,0,.25));
        }

        .chips{ display:flex; gap:8px; flex-wrap:wrap }
        .chips.top{ margin-bottom:8px }
        .chips.bottom{ margin-top:8px }

        .tag{
          display:inline-block; background:rgba(255,255,255,.16);
          border:1px solid rgba(255,255,255,.35); padding:6px 12px;
          border-radius:999px; font-size:.82rem;
        }
        .chip{
          display:inline-flex; gap:8px; align-items:center;
          border-radius:999px; border:1px solid rgba(255,255,255,.35);
          padding:6px 10px; font-size:.85rem; background:rgba(255,255,255,.12);
          backdrop-filter: blur(2px);
        }
        .chip i{ width:8px; height:8px; border-radius:50%; background:#fff }
        .chip .c1{ background:var(--color-3) } .chip .c2{ background:var(--color-4) } .chip .c3{ background:var(--color-5) }

        .title{ margin:10px 0 4px; font-size: clamp(24px, 3.2vw, 40px); line-height:1.1; font-weight:800 }

        /* --- Byline (opción 1) --- */
        .byline{
          display:flex; align-items:center; gap:8px;
          font-size: clamp(13px, 1.5vw, 15px);
          color:#fff; opacity:.95;
          margin-top: 2px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .org-logo{ width:20px; height:20px; border-radius:4px; object-fit:contain; background:#fff; }
        .org-name{
          font-weight:700;
          max-width:60%;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .byline .sep{ opacity:.7 }
        .period{ white-space: nowrap; }

        /* Contenido */
        .content{
          display:grid; grid-template-columns: 1.4fr .9fr; gap:var(--gap);
          padding: calc(var(--p) + 6px) var(--p) calc(var(--p) + 10px);
          flex:1 1 auto; align-items:start;
          overflow:auto;
        }
        @media (max-width: 1024px){ .content{grid-template-columns: 1.2fr .95fr} }
        @media (max-width: 860px){ .content{grid-template-columns:1fr; padding: var(--p)} }

        .lead{font-size:clamp(15px,1.6vw,17px); color:var(--muted); margin:6px 0 18px}
        .kicker{text-transform:uppercase; letter-spacing:.12em; font-weight:800; font-size:.78rem; color:var(--color-2)}
        .card{ background:#fff; border:1px solid var(--line); border-radius:16px; padding:16px 18px; box-shadow:0 2px 0 rgba(0,0,0,.02) }
        .card + .card{margin-top:12px}
        .card h3{margin:.1rem 0 .25rem; font-size:clamp(.96rem, 1.6vw, 1.05rem)}
        .meta{display:grid; grid-template-columns: 22px 1fr; gap:10px; align-items:flex-start}
        .dot{width:10px; height:10px; border-radius:999px; margin-top:6px; background:var(--color-2); box-shadow:0 0 0 3px rgba(185,0,138,.15)}
        .list{margin: 8px 0 0; padding-left:18px}
        .list li{margin:8px 0}
        .org-media{overflow:hidden; border-radius:12px; padding:0; background:#fff}
        .org-media img{ width:100%; height:auto; display:block; object-fit:contain; }

        /* Sello lateral opcional */
        .badge{
          width:124px; height:124px; border-radius:50%; display:grid; place-items:center; margin-left:auto;
          background: radial-gradient(circle at 30% 20%, rgba(255,255,255,.18), rgba(0,0,0,.22)), var(--ink);
          border:8px solid var(--color-4);
          color:#fff; font-weight:800; font-size:.78rem; text-align:center; padding:8px; line-height:1.2
        }

        @media (max-width: 1024px){
          .masthead{padding: calc(var(--p) + 4px) var(--p) var(--p)}
        }
        @media (max-width: 600px){
          .masthead{padding: 16px 14px 12px; display:flex; flex-direction:column; gap:8px;}
          .title{font-size: clamp(22px, 6.2vw, 28px)}
          .byline{font-size: clamp(12px, 3.6vw, 14px)}
          .tag{font-size:.78rem; padding:5px 10px}
          .content{gap: 14px}
        }
      `}</style>
    </main>
  );
}
