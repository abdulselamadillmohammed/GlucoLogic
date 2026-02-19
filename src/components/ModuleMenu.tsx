import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const LINKS = [
  { to: "/learn/t2d", label: "Physiology Module" },
  { to: "/learn/pharmacology/map", label: "Pharmacology Module" },
  { to: "/workshop", label: "The WorkShop" }
];

export function ModuleMenu() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="fixed left-3 top-3 z-[80]">
      <button type="button" className="focus-ring rounded-xl border border-[#cfe0ee] bg-white px-3 py-2 text-sm font-semibold text-[#2E3A8C] shadow-[0_8px_24px_rgba(15,23,42,0.12)]" onClick={() => setOpen((v) => !v)}>
        Menu
      </button>
      {open ? (
        <div className="mt-2 w-60 rounded-xl border border-[#cfe0ee] bg-white p-2 shadow-[0_12px_28px_rgba(15,23,42,0.16)]">
          {LINKS.map((link) => {
            const active = location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={`focus-ring block rounded-lg px-3 py-2 text-sm ${active ? "bg-[#e6f3ff] text-[#173a61]" : "text-[#334155] hover:bg-[#f3f9ff]"}`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
