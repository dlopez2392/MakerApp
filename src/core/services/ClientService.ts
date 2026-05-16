import { clientRepository } from "../database/repositories/ClientRepository";
import type { Client } from "../types";
import { FREE_LIMITS } from "../types";

export class ClientServiceError extends Error {
  constructor(message: string, public code: "LIMIT_REACHED" | "NOT_FOUND" | "INVALID") {
    super(message);
  }
}

export const ClientService = {
  getAll(): Client[] {
    return clientRepository.getAll();
  },
  getById(id: string): Client {
    const client = clientRepository.getById(id);
    if (!client) throw new ClientServiceError("Client not found", "NOT_FOUND");
    return client;
  },
  search(query: string): Client[] {
    return clientRepository.getAll("full_name LIKE ? OR company LIKE ? OR email LIKE ?", [
      `%${query}%`, `%${query}%`, `%${query}%`,
    ]);
  },
  create(data: Omit<Client, "id" | "createdAt" | "updatedAt">): Client {
    const count = clientRepository.count();
    if (count >= FREE_LIMITS.clients) {
      throw new ClientServiceError(`Free tier limit of ${FREE_LIMITS.clients} clients reached`, "LIMIT_REACHED");
    }
    return clientRepository.create(data);
  },
  update(id: string, data: Partial<Client>): Client {
    const client = clientRepository.update(id, data);
    if (!client) throw new ClientServiceError("Client not found", "NOT_FOUND");
    return client;
  },
  delete(id: string): void {
    clientRepository.delete(id);
  },
};
