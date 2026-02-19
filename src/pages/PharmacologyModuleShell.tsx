import { NavLink, Outlet } from "react-router-dom";

const tabs = [
  { to: "/learn/pharmacology/map", label: "Map" },
  { to: "/learn/pharmacology/compare", label: "Compare" },
  { to: "/learn/pharmacology/learn", label: "Learn" }
];

export function PharmacologyModuleShell() {
  return (
    <main className="mx-auto w-full max-w-[1320px] px-3 pb-8 pt-20">
      <section className="glass-panel p-3">
        <h1 className="m-0 text-xl font-semibold text-[#2E3A8C]">Pharmacology Module</h1>
        <p className="m-0 mt-1 text-sm text-[#334155]">
          All displayed facts are sourced from local `data/drugs.json`. Missing fields are shown as "Not stated in dataset".
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) => `focus-ring rounded-full border px-3 py-1 text-sm ${isActive ? "border-transparent bg-[#2E3A8C] text-white" : "border-[#cfe0ee] bg-white text-[#334155]"}`}
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </section>
      <section className="mt-4">
        <Outlet />
      </section>
    </main>
  );
}
