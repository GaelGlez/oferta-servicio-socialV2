interface BaseProject {
    id: number;
    organization: string;
    population: string;
    title: string;
    objective: string;
    description: string;
    schedule: string;
    abilities: string;
    max: number;
    model: string;
    location: string;
    duration: string;
    hours: string;
    image: string;
    group: number;
    groupKey: string;
    extraComments: string;
    status: string;
    period: "verano" | "ago-dic" | "invierno" | "feb-jun";
    quota?: number | string;
}

export interface Project extends BaseProject {
    tags: string;
}

const colors = [
    { label: 'Todas', color: 'bg-black' },
    { label: 'LAD', color: 'bg-slate-500' },
    { label: 'LED', color: 'bg-gray-500' },
    { label: 'LC', color: 'bg-zinc-500' },
    { label: 'LPE', color: 'bg-neutral-500' },
    { label: 'LTM', color: 'bg-stone-500' },
    { label: 'LAE', color: 'bg-red-500' },
    { label: 'LAF', color: 'bg-orange-500' },
    { label: 'LCPF', color: 'bg-amber-500' },
    { label: 'LEM', color: 'bg-yellow-500' },
    { label: 'LDI', color: 'bg-lime-500' },
    { label: 'ITC', color: 'bg-green-500' },
    { label: 'IBT', color: 'bg-emerald-500' },
    { label: 'IQ', color: 'bg-teal-500' },
    { label: 'LDE', color: 'bg-cyan-500' },
    { label: 'LIT', color: 'bg-sky-500' },
    { label: 'IIS', color: 'bg-blue-500' },
    { label: 'LRI', color: 'bg-indigo-500' },
    { label: 'LEC', color: 'bg-violet-500' },
    { label: 'LTP', color: 'bg-purple-500' },
    { label: 'IC', color: 'bg-fuchsia-500' },
    { label: 'LPS', color: 'bg-pink-500' },
    { label: 'IID', color: 'bg-rose-500' },
    { label: 'LNB', color: 'bg-slate-500' },
    { label: 'ARQ', color: 'bg-gray-500' },
    { label: 'IE', color: 'bg-zinc-500' },
    { label: 'LUB', color: 'bg-neutral-500' },
    { label: 'LEI', color: 'bg-stone-500' },
    { label: 'IDM', color: 'bg-red-500' },
    { label: 'LDO', color: 'bg-orange-500' },
    { label: 'IAG', color: 'bg-amber-500' },
    { label: 'IAL', color: 'bg-yellow-500' },
    { label: 'IDS', color: 'bg-lime-500' },
    { label: 'IFI', color: 'bg-green-500' },
    { label: 'INA', color: 'bg-emerald-500' },
    { label: 'IRS', color: 'bg-teal-500' },
    { label: 'ITD', color: 'bg-cyan-500' },
    { label: 'IM', color: 'bg-sky-500' },
    { label: 'IMD', color: 'bg-blue-500' },
    { label: 'IMT', color: 'bg-indigo-500' }
];

export interface Tag {
    name: string;
    color: string;
}

export interface ProjectTagsSplit extends BaseProject {
    tags: Tag[];
}

export function mapProjectToProjectTagsSplit(project: Project): ProjectTagsSplit {
    let tags: Tag[] = [];
    if (project.tags) {
        tags = project.tags.split(',').map(tag => {
            const colorObj = colors.find(color => color.label === tag.trim());
            return {
                name: tag.trim(),
                color: colorObj ? colorObj.color : 'bg-black'
            };
        });
    }

    return {
        id: project.id,
        organization: project.organization,
        population: project.population,
        title: project.title,
        objective: project.objective,
        description: project.description,
        schedule: project.schedule,
        tags: tags,
        abilities: project.abilities,
        max: project.max,
        model: project.model,
        location: project.location,
        duration: project.duration,
        hours: project.hours,
        image: project.image,
        group: project.group,
        groupKey: project.groupKey,
        extraComments: project.extraComments,
        status: project.status,
        period: project.period,
        quota: project.quota,
    };
}

/**
 * Represents a project administration relationship where a user is an administrator of a project.
 * 
 * @interface ProjectAdministration
 * 
 * @property {number} id - The unique identifier for this record.
 * @property {string} user_id - The ID of the user who is an administrator of the project.
 * @property {number} project_id - The ID of the project that the user administers.
 */
export interface ProjectAdministration {
    id: number;
    user_id: string;
    project_id: number;
}

export interface Student {
    id: string;
}

export interface StudentAttendaceObj {
    id: number;
    student_id: string;
    project_id: number;
    date: string;
}

export interface AttendanceDate {
    date: string;
    students: Student[]
}

export interface ProjectAttendance {
    id: number;
    allStudents: Student[];
    dates: AttendanceDate[]
}
