import type { ItemStatus } from "../types";

// Fonte única da paleta de status do checklist PPAP — usada pelo
// StatusBadge e pelo medidor de progresso do Dashboard, pra nunca
// dessincronizar as cores entre os dois lugares que representam status.
export const STATUS_LABELS: Record<ItemStatus, string> = {
  PENDENTE: "Pendente",
  ENVIADO: "Enviado",
  EM_ANALISE: "Em análise",
  APROVADO: "Aprovado",
  APROVADO_CONDICIONAL: "Aprovado condicional",
  REPROVADO: "Reprovado",
};

// PENDENTE fica em cinza neutro (ainda não é um "estado" de fato);
// os demais seguem uma escala fixa de status (bom -> alerta -> sério ->
// crítico), nunca reaproveitada para outra coisa na UI.
export const STATUS_COLORS: Record<ItemStatus, string> = {
  PENDENTE: "#a6a49b",
  ENVIADO: "#2a6fdb",
  EM_ANALISE: "#eda100",
  APROVADO: "#0ca30c",
  APROVADO_CONDICIONAL: "#e8703f",
  REPROVADO: "#d03b3b",
};

// Ordem usada na legenda e no cálculo do medidor de progresso.
export const STATUS_ORDER: ItemStatus[] = [
  "PENDENTE",
  "ENVIADO",
  "EM_ANALISE",
  "APROVADO",
  "APROVADO_CONDICIONAL",
  "REPROVADO",
];
