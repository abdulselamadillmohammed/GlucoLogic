import type { ReactNode } from "react";

interface TheraScapeCanvasProps {
  children: ReactNode;
}

export function TheraScapeCanvas({ children }: TheraScapeCanvasProps) {
  return <section className="therascape-canvas">{children}</section>;
}
