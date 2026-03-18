import { Badge } from "@/components/ui/Badge";
import {
  RESERVATION_STATUS_LABELS,
  CHARTER_STATUS_LABELS,
} from "@/lib/constants";

interface StatusBadgeProps {
  status: string;
  type?: "reservation" | "charter";
}

function getVariant(
  status: string
): "received" | "confirmed" | "cancelled" | "default" {
  if (status === "RECEIVED") return "received";
  if (status === "CONFIRMED") return "confirmed";
  if (status.startsWith("CANCELLED")) return "cancelled";
  return "default";
}

export function StatusBadge({ status, type = "reservation" }: StatusBadgeProps) {
  const labels =
    type === "charter" ? CHARTER_STATUS_LABELS : RESERVATION_STATUS_LABELS;
  const label = labels[status] ?? status;

  return <Badge variant={getVariant(status)}>{label}</Badge>;
}
