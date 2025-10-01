'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { createClient } from "@/lib/supabase/client";
import { mapProjectToProjectTagsSplit } from '@/lib/types/project/schema';
import { ProjectTagsSplit } from '@/lib/types/project/schema';
import HTMLFlipBookLib  from 'react-pageflip';

import { useProjectsContext } from '@/context/useProjectsContext';
import NextImage from "next/image";
import { Button, Chip, Image } from '@nextui-org/react';
import FavoriteButton from '../proyecto/[proyecto]/favorite-button';

import { Filter, SearchBar } from "@/components/home";
import Select from "@/components/home/Select";
import { X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";






const periodOptions = [
    { label: "Verano", value: "verano" },
    { label: "Agosto - Diciembre", value: "ago-dic" },
    { label: "Invierno", value: "invierno" },
    { label: "Febrero - Junio", value: "feb-jun" },
];

const HTMLFlipBook: any = HTMLFlipBookLib; // evita errores de tipos en prototipo


export default function CatalogoMagazinePage() {
    const supabase = createClient();
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()!
    const { projects: contextProjects } = useProjectsContext();

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams)
            params.set(name, value)
    
            return params.toString()
        },
        [searchParams]
    )

    const [projects, setProjects] = useState<ProjectTagsSplit[]>([]);
    const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
    const [selectedTags, setSelectedTags] = useState(searchParams.get('tags') || '');
    const [selectedModel, setSelectedModel] = useState(searchParams.get('model') || '');
    const [selectedPeriod, setSelectedPeriod] = useState(searchParams.get('period') || '');
    const [favoritesIDs, setFavoritesIDs] = useState<number[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Traer proyectos (usa contexto si ya están)
    const fetchProjects = useCallback(async () => {
        if (contextProjects && contextProjects.length > 0) {
            setProjects(contextProjects.filter(p => p.status === "visible"));
            return;
        }

        const { data, error } = await supabase
            .from("projects")
            .select("*")
            .eq("status", "visible");   // solo proyectos visibles

        if (error) setError(error.message);
        else if (data) {
            const parsed = data.map((p: any) => mapProjectToProjectTagsSplit(p));
            setProjects(parsed);
        }
    }, [contextProjects, supabase]);

    const handleReset = () => {
        router.push(pathname)
        setSearchTerm('');
        setSelectedTags('');
        setSelectedModel('');
        setSelectedPeriod('');
    };

    const handleSearch = (term: string) => {
        router.push(pathname + '?' + createQueryString('search', term))
        setSearchTerm(term.toLowerCase());
    };


    const handleTagsFilterChange = (selectedTags: string) => {
        router.push(pathname + '?' + createQueryString('tags', selectedTags))
        setSelectedTags(selectedTags);
    };

    const handleModelFilterChange = (selectedModel: string) => {
        router.push(pathname + '?' + createQueryString('model', selectedModel))
        setSelectedModel(selectedModel);
    };

    const handlePeriodFilterChange = (selectedPeriod: string) => {
        router.push(pathname + '?' + createQueryString('period', selectedPeriod));
        setSelectedPeriod(selectedPeriod);
    };

    /*useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);*/
    useEffect(() => {
        fetchProjects();
        const favorites = JSON.parse(localStorage.getItem("favorites") || "{}");
        setFavoritesIDs(Object.keys(favorites).map(Number));
    }, [fetchProjects]);
    
    // --------------------------------------------------
    // Filtrado de proyectos
    const filteredProjects = projects
        .filter(p => 
            p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.organization.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .filter(p => selectedTags ? p.tags.some(tag => selectedTags.includes(tag.name)) : true)
        .filter(p => selectedModel ? selectedModel.includes(p.model) : true)
        .filter(p => selectedPeriod ? selectedPeriod === p.period : true);
    
    // Opciones dinámicas para filtros
    const tagOptions = Array.from(new Set(projects.flatMap(p => p.tags.map(tag => tag.name))))
        .map(tag => ({ label: tag, value: tag }));
    const modalityOptions = Array.from(new Set(projects.map(p => p.model)))
        .map(mod => ({ label: mod, value: mod }));
    // --------------------------------------------------

    if (error) {
        return <div className="p-4 text-red-600">Error: {error}</div>;
    }

    if (projects.length === 0) {
        return <div className="p-4">Cargando proyectos...</div>;
    }


    return (
        <main className="flex flex-col items-center py-6">
            <h1 className="text-3xl font-bold mb-6">Catálogo estilo revista</h1>
            {/* Barra de búsqueda y filtros */}
            <div className="flex flex-col md:flex-row mb-6 gap-2 items-center w-full">
                <SearchBar searchTerm={searchTerm} onSearch={handleSearch} />
                <div className="flex flex-row gap-2">
                    <Filter title="Carrera" values={selectedTags} options={tagOptions} onChange={handleTagsFilterChange} />
                    <Filter title="Modalidad" values={selectedModel} options={modalityOptions} onChange={handleModelFilterChange} />
                    <Select title="Periodo" value={selectedPeriod} options={periodOptions} onChange={handlePeriodFilterChange} />

                    {(searchTerm || selectedTags || selectedModel || selectedPeriod) && (
                    <Button isIconOnly size="sm" color="secondary" startContent={<X className="w-4 h-4" />} onClick={handleReset} />
                    )}
                </div>
            </div>

            {/* Revista */}
            <HTMLFlipBook
                width={400}
                height={600}             
                maxShadowOpacity={0.5} // Example value, adjust as needed
                drawShadow={true}
                showCover={true}
                size="stretch"

                minWidth={300}
                maxWidth={900}
                minHeight={400}
                maxHeight={1100}
                startPage={0}
                flippingTime={1000}
                usePortrait
                startZIndex={0}
                autoSize
                clickEventForward={false}
                mobileScrollSupport={false}
                className="shadow-xl"
                style={{}} // Provide a default empty style object
                useMouseEvents={true} // Example value, adjust as needed
                swipeDistance={50} // Example value, adjust as needed
                showPageCorners={true} // Added required prop
                disableFlipByClick={false} // Added required prop
            >
                {filteredProjects.map((project) => (
                    <div
                        key={project.id}
                        className="p-6 bg-white rounded shadow-md flex flex-col justify-between"
                    >
                        {/* Encabezado con título y periodo */}
                        <FavoriteButton id={project.id.toString()} />
                        <h1 className="text-3xl font-bold">{project?.title}</h1>
                        <p className="text-sm">{project?.organization}<span className='ml-4 text-lg font-medium text-red-700'>{periodOptions.find(option => option.value === project?.period)?.label}</span></p>
                         {/* Tags */}
                        <div className="flex flex-wrap gap-1 mt-2">
                            {project.tags?.map((tag, i) => (
                                <Chip key={i} size="sm" className={`${tag.color} text-white`}>
                                    {tag.name}
                                </Chip>
                            ))}
                        </div>
                        <p className="w-[90%] text-medium font-medium py-2"><span className='font-bold'>Objetivo del Proyecto: </span>{project?.objective}</p>

                        <p className="text-sm mt-2">{project.description}</p>
                        <div className="flex flex-col gap-1 w-full lg:w-1/3 justify-center items-center">
                            {project?.image && (
                                <Image
                                as={NextImage}
                                isBlurred
                                removeWrapper
                                alt="Card example background"
                                className="z-0 max-w-xs max-h-40 group-hover/card:scale-125 transition-all duration-200 ease-in-out object-contain"
                                src={supabase.storage.from('ServicioSocialProjectImages').getPublicUrl(project?.image).data.publicUrl}
                                width={500}
                                height={500}
                                />
                            )}
                            </div>

                    </div>
                ))}
            </HTMLFlipBook>
        </main>
    );
}
