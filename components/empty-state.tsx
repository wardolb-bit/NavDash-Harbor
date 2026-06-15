import { Boxes, type LucideIcon } from "lucide-react";

export function EmptyState({
  title,
  message,
  action,
  icon: Icon = Boxes,
}: {
  title: string;
  message: string;
  action: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-white text-harbor-cyan shadow-sm">
        <Icon className="h-7 w-7" aria-hidden />
      </div>
      <h3 className="mt-4 text-base font-bold text-harbor-navy">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">{message}</p>
      <button className="secondary-button mt-5" type="button">{action}</button>
    </div>
  );
}
