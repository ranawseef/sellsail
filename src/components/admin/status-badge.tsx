import { Badge } from "@/components/ui/badge";

/** A workspace's subscription state as a small badge. */
export function statusBadge(status: string, trialEndsAt: Date | null) {
  const trialOver = status === "trialing" && (!trialEndsAt || new Date(trialEndsAt).getTime() < Date.now());
  if (status === "active") return <Badge variant="mint" size="sm">Active</Badge>;
  if (status === "past_due") return <Badge variant="danger" size="sm">Past due</Badge>;
  if (status === "trialing" && !trialOver) return <Badge variant="sun" size="sm">Trial</Badge>;
  return <Badge variant="grey" size="sm">{trialOver ? "Trial ended" : status}</Badge>;
}
