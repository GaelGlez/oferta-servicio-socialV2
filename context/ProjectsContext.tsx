'use client'

import { ProjectTagsSplit } from "@/lib/types/project/schema";
import { createContext, useState } from "react";

type ProjectsState = {
  projects: ProjectTagsSplit[] | undefined;
  setProjects: (games: ProjectTagsSplit[]) => void;
};

export const ProjectsContext = createContext<ProjectsState | undefined>(undefined);

export const ProjectsContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [projects, setProjects] = useState<ProjectTagsSplit[] | undefined>(undefined);

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        setProjects
      }}
    >
      {children}
    </ProjectsContext.Provider>
  )
}