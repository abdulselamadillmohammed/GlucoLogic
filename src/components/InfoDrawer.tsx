import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

interface InfoDrawerProps {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}

export function InfoDrawer({ open, title, children, onClose }: InfoDrawerProps) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-40 bg-[#0f172a]/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="fixed right-0 top-0 z-50 h-screen w-[min(430px,92vw)] border-l border-[#d5e7f7] bg-[rgba(255,255,255,0.86)] p-5 backdrop-blur-xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#2E3A8C]">{title}</h3>
              <button type="button" className="focus-ring rounded-lg border border-[#c8d9ea] bg-white px-3 py-1 text-sm text-[#334155]" onClick={onClose}>
                Close
              </button>
            </div>
            <div className="space-y-3 text-sm text-[#334155]">{children}</div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
