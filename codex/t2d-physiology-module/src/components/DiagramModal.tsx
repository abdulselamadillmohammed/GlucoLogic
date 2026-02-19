import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";

interface DiagramModalProps {
  open: boolean;
  title: string;
  description: string;
  alt: string;
  imageSrc?: string | null;
  onClose: () => void;
}

function getFocusable(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    )
  );
}

export function DiagramModal({ open, title, description, alt, imageSrc, onClose }: DiagramModalProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const fallbackNote = useMemo(
    () => "This diagram is mapped in the learning flow but no local image file was found in src/assets/diagrams yet.",
    []
  );

  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const panel = panelRef.current;
    const focusables = panel ? getFocusable(panel) : [];
    focusables[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panel) return;

      const nodes = getFocusable(panel);
      if (!nodes.length) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close diagram modal"
            className="fixed inset-0 z-50 bg-[#0f172a]/28"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-0 z-[60] grid place-items-center px-3 py-6"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
          >
            <div ref={panelRef} className="w-full max-w-5xl rounded-2xl border border-[#cfe2f2] bg-[#fafdff] p-4 shadow-[0_24px_60px_rgba(15,23,42,0.22)]">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="m-0 text-lg font-semibold text-[#2E3A8C]">{title}</h3>
                <button type="button" className="focus-ring rounded-lg border border-[#c8d9ea] bg-white px-3 py-1 text-sm text-[#334155]" onClick={onClose}>
                  Close
                </button>
              </div>
              <p className="m-0 mb-3 text-sm text-[#334155]">{description}</p>
              <div className="max-h-[70vh] overflow-auto rounded-xl border border-[#d7e7f5] bg-white p-2">
                {imageSrc ? (
                  <img src={imageSrc} alt={alt} className="mx-auto h-auto max-w-full rounded-lg shadow-[0_8px_24px_rgba(15,23,42,0.14)]" />
                ) : (
                  <p className="m-2 rounded-lg border border-[#f1d4b1] bg-[#fff6ea] p-3 text-sm text-[#8a5a2b]">{fallbackNote}</p>
                )}
              </div>
              {imageSrc ? (
                <a
                  href={imageSrc}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring mt-3 inline-flex rounded-lg border border-[#c8d9ea] bg-white px-3 py-1 text-sm text-[#334155]"
                >
                  View full size
                </a>
              ) : null}
            </div>
          </motion.div>
        </>
      ) : null}
    </AnimatePresence>
  );
}
