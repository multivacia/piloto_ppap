import type { ItemStatus } from "../types";

const LABELS: Record<ItemStatus, string> = {
  PENDENTE: "Pendente",
  ENVIADO: "Enviado",
  EM_ANALISE: "Em análise",
  APROVADO: "Aprovado",
  APROVADO_CONDICIONAL: "Aprovado condicional",
  REPROVADO: "Reprovado",
};

const CORES: Record<ItemStatus, string> = {
  PENDENTE: "#8a8a8a",
  ENVIADO: "#2f6fdb",
  EM_ANALISE: "#c98a12",
  APROVADO: "#1f9d55",
  APROVADO_CONDICIONAL: "#b58900",
  REPROVADO: "#d1453b",
};

export function StatusBadge({ status }: { status: ItemStatus }) {
  return (
    <span
      style={{
        background: CORES[status],
        color: "#fff",
        borderRadius: 12,
        padding: "2px 10px",
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {LABELS[status]}
    </span>
  );
}
