"use client";

type FinancialTabKey = "salary-config" | "advances" | "bonuses" | "final-payroll";

interface FinancialTab {
  key: FinancialTabKey;
  label: string;
  subtitle: string;
}

interface FinancialHubTabsProps {
  tabs: FinancialTab[];
  activeTab: FinancialTabKey;
  onChange: (tab: FinancialTabKey) => void;
}

export type { FinancialTabKey, FinancialTab };

export default function FinancialHubTabs({ tabs, activeTab, onChange }: FinancialHubTabsProps) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-[0_10px_40px_-25px_rgba(15,23,42,0.35)] p-2">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;

          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={`text-right rounded-xl p-4 transition-all active:scale-95 ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/25"
                  : "bg-white/70 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <p className="text-sm font-bold">{tab.label}</p>
              <p className={`text-xs mt-1 ${isActive ? "text-blue-100" : "text-slate-500"}`}>{tab.subtitle}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}

