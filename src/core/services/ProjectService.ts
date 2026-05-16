import { projectRepository } from "../database/repositories/ProjectRepository";
import type { Project, ProjectStatus, Discipline } from "../types";
import { FREE_LIMITS } from "../types";

export class ProjectServiceError extends Error {
  constructor(message: string, public code: "LIMIT_REACHED" | "NOT_FOUND" | "INVALID") {
    super(message);
  }
}

export const ProjectService = {
  getAll(): Project[] {
    return projectRepository.getAll();
  },
  getById(id: string): Project {
    const project = projectRepository.getById(id);
    if (!project) throw new ProjectServiceError("Project not found", "NOT_FOUND");
    return project;
  },
  getByStatus(status: ProjectStatus): Project[] {
    return projectRepository.getAll("status = ?", [status]);
  },
  getByDiscipline(discipline: Discipline): Project[] {
    return projectRepository.getAll("discipline_tags LIKE ?", [`%"${discipline}"%`]);
  },
  getByClient(clientId: string): Project[] {
    return projectRepository.getAll("client_id = ?", [clientId]);
  },
  getActive(): Project[] {
    return projectRepository.getAll("status NOT IN ('complete', 'delivered', 'archived')");
  },
  getRecent(limit: number = 3): Project[] {
    const all = projectRepository.getAll();
    return all.slice(0, limit);
  },
  create(data: Omit<Project, "id" | "createdAt" | "updatedAt" | "actualHours">): Project {
    const count = projectRepository.count();
    if (count >= FREE_LIMITS.projects) {
      throw new ProjectServiceError(`Free tier limit of ${FREE_LIMITS.projects} projects reached`, "LIMIT_REACHED");
    }
    return projectRepository.create({ ...data, actualHours: 0 });
  },
  update(id: string, data: Partial<Project>): Project {
    const project = projectRepository.update(id, data);
    if (!project) throw new ProjectServiceError("Project not found", "NOT_FOUND");
    return project;
  },
  updateActualHours(id: string, hoursToAdd: number): Project {
    const project = this.getById(id);
    return this.update(id, { actualHours: project.actualHours + hoursToAdd });
  },
  delete(id: string): void {
    projectRepository.delete(id);
  },
};
