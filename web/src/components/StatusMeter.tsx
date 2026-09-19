import { STATUS_COLORS, STATUS_LABELS, STATUS_ORDER } from "../lib/statusColors";
import type { ChecklistItemResumo } from "../types";

interface Props {
  itens: ChecklistItemResumo[];
}

// Barra segmentada mostrando a distribuição dos 18 itens do checklist
// entre os status — cada segmento é proporcional à contagem, com um
// gap de 2px (cor da superfície) separando os segmentos.
export function StatusMeter({ itens }: Props) {
  const segmentos = STATUS_ORDER.map((status) => ({
    status,
    count: itens.filter((i) => i.status === status).length,
  })).filter((s) => s.count > 0);

  const legenda = segmentos
    .map((s) => `${s.count} ${STATUS_LABELS[s.status]}`)
    .join(", ");

  return (
    <div className="status-meter" role="img" aria-label={`Progresso: ${legenda}`}>
      {segmentos.map(({ status, count }) => (
        <span
          key={status}
          className="status-meter-seg"
          style={{ flexGrow: count, background: STATUS_COLORS[status] }}
          title={`${count} ${STATUS_LABELS[status]}`}
        />
      ))}
    </div>
  );
}
