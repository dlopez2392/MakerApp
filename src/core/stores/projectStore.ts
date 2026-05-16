import { create } from "zustand";
import type { Project } from "../types";
import { ProjectService, ProjectServiceError } from "../services/ProjectService";

interface ProjectStore {
  projects: Project[];
  loading: boolean;
  error: string | null;
  limitReached: boolean;
  load: () => void;
  create: (data: Omit<Project, "id" | "createdAt" | "updatedAt" | "actualHours">) => Project | null;
  update: (id: string, data: Partial<Project>) => void;
  remove: (id: string) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  loading: false,
  error: null,
  limitReached: false,
  load: () => {
    set({ loading: true });
    try {
      const projects = ProjectService.getAll();
      set({ projects, loading: false, error: null });
    } catch (e) {
      set({ loading: false, error: (e as Error).message });
    }
  },
  create: (data) => {
    try {
      const project = ProjectService.create(data);
      set((state) => ({ projects: [project, ...state.projects], limitReached: false }));
      return project;
    } catch (e) {
      if (e instanceof ProjectServiceError && e.code === "LIMIT_REACHED") {
        set({ limitReached: true });
        return null;
      }
      throw e;
    }
  },
  update: (id, data) => {
    const updated = ProjectService.update(id, data);
    set((state) => ({ projects: state.projects.map((p) => (p.id === id ? updated : p)) }));
  },
  remove: (id) => {
    ProjectService.delete(id);
    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) }));
  },
}));
