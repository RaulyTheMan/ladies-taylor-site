import { ADMIN_FOCUS_RING_CLASS } from "@/lib/admin/ui";

export type AdminTab = { value: string; label: string };

export default function AdminTabs({
  tabs,
  current,
  paramName = "tab",
}: {
  tabs: AdminTab[];
  current: string;
  paramName?: string;
}) {
  return (
    <div className="flex flex-wrap gap-6 border-b border-black/10">
      {tabs.map((tab) => {
        const active = current === tab.value;
        return (
          <a
            key={tab.value}
            href={tab.value === tabs[0].value ? "?" : `?${paramName}=${tab.value}`}
            aria-current={active ? "page" : undefined}
            className={`-mb-px border-b-2 pb-3 text-sm transition-colors ${ADMIN_FOCUS_RING_CLASS} ${
              active
                ? "border-black font-bold text-black"
                : "border-transparent font-medium text-black/35 hover:text-black/60"
            }`}
          >
            {tab.label}
          </a>
        );
      })}
    </div>
  );
}
