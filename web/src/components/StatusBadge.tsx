import type { ItemStatus } from "../types";
import { STATUS_COLORS, STATUS_LABELS } from "../lib/statusColors";

export function StatusBadge({ status }: { status: ItemStatus }) {
  return (
    <span
      style={{
        background: STATUS_COLORS[status],
        color: "#fff",
        borderRadius: 12,
        padding: "2px 10px",
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
