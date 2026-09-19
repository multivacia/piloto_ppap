// Tipos espelhando as respostas da API — mantidos manualmente por enquanto;
// se o projeto crescer, considerar gerar isso a partir do schema Prisma.
export type Role = "FORNECEDOR" | "AQF";
export type PacoteTipo = "FORNECEDOR" | "CLIENTE";
export type ItemStatus =
  | "PENDENTE"
  | "ENVIADO"
  | "EM_ANALISE"
  | "APROVADO"
  | "APROVADO_CONDICIONAL"
  | "REPROVADO";

export interface Usuario {
  id: string;
  nome: string;
  username: string;
  role: Role;
  fornecedorId: string | null;
}

export interface Fornecedor {
  id: string;
  nome: string;
  local: string | null;
  codigo: string | null;
}

export interface ChecklistItemResumo {
  id: string;
  itemCode: number;
  status: ItemStatus;
  revisaoAtual: number;
}

export interface Pacote {
  id: string;
  pn: string;
  produto: string;
  tipo: PacoteTipo;
  nivelPpap: number;
  compradorF2J: string | null;
  fornecedorId: string | null;
  fornecedor: Fornecedor | null;
  createdAt: string;
  itens: ChecklistItemResumo[];
}

export interface HistoricoEntry {
  id: string;
  revisao: number;
  status: ItemStatus;
  comentario: string | null;
  createdAt: string;
  autor: { nome: string; role: Role };
}

export interface AnexoResumo {
  id: string;
  nomeOriginal: string;
  mimeType: string;
  tamanhoBytes: number;
  createdAt: string;
}

export interface ItemDetalhe extends ChecklistItemResumo {
  pacoteId: string;
  formData: unknown;
  historico: HistoricoEntry[];
  anexos: AnexoResumo[];
}

export interface ItemDef {
  code: number;
  titulo: string;
}
