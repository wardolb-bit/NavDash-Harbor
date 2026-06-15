import type { LucideIcon } from "lucide-react";
import { EmptyState } from "@/components/empty-state";

export function ModuleShell({
  icon,
  title,
  phase,
}: {
  icon: LucideIcon;
  title: string;
  phase: string;
}) {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section>
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-harbor-cyan">{phase}</p>
        <h1 className="mt-2 text-3xl font-bold text-harbor-navy">{title}</h1>
      </section>
      <section className="command-card p-6">
        <EmptyState
          icon={icon}
          title={`${title} shell is available`}
          message="This navigation destination is intentionally present for Phase 1 layout validation. Feature workflows are not built yet."
          action="Shell Ready"
        />
      </section>
    </div>
  );
}
