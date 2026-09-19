import { apiRequest } from "./client";
import type { Fornecedor, ItemDef, ItemDetalhe, ItemStatus, Pacote, PacoteTipo } from "../types";

export function listPacotes(tipo?: PacoteTipo) {
  const query = tipo ? `?tipo=${tipo}` : "";
  return apiRequest<Pacote[]>(`/pacotes${query}`);
}

export function getPacote(pacoteId: string) {
  return apiRequest<Pacote>(`/pacotes/${pacoteId}`);
}

interface CreatePacoteInput {
  pn: string;
  produto: string;
  tipo: PacoteTipo;
  fornecedorId?: string | null;
  compradorF2J?: string | null;
  nivelPpap: number;
}

export function createPacote(input: CreatePacoteInput) {
  return apiRequest<Pacote>("/pacotes", { method: "POST", body: input });
}

export function listFornecedores() {
  return apiRequest<Fornecedor[]>("/fornecedores");
}

export function listItemDefs() {
  return apiRequest<ItemDef[]>("/itens/defs");
}

export function getItemDetalhe(pacoteId: string, itemCode: number) {
  return apiRequest<ItemDetalhe>(`/pacotes/${pacoteId}/itens/${itemCode}`);
}

export function enviarItem(pacoteId: string, itemCode: number, formData?: unknown) {
  return apiRequest<ItemDetalhe>(`/pacotes/${pacoteId}/itens/${itemCode}/enviar`, {
    method: "POST",
    body: { formData },
  });
}

export function decidirItem(
  pacoteId: string,
  itemCode: number,
  decisao: ItemStatus,
  comentario?: string | null
) {
  return apiRequest<ItemDetalhe>(`/pacotes/${pacoteId}/itens/${itemCode}/decidir`, {
    method: "POST",
    body: { decisao, comentario },
  });
}

export function uploadAnexo(pacoteId: string, itemCode: number, file: File) {
  const formData = new FormData();
  formData.append("arquivo", file);
  return apiRequest(`/pacotes/${pacoteId}/itens/${itemCode}/anexos`, {
    method: "POST",
    body: formData,
    isFormData: true,
  });
}
