import type { BubbleNodeModel } from "../logic/reasoningLogic";

interface BubbleMapProps {
  title: string;
  bubbles: BubbleNodeModel[];
  activeId: string | null;
  onOpen: (id: string) => void;
  onToggle: (id: string) => void;
}

export function BubbleMap({ title, bubbles, activeId, onOpen, onToggle }: BubbleMapProps) {
  return (
    <section className="bubble-map-wrap">
      <h3>{title}</h3>
      <div className="bubble-map-grid">
        {bubbles.map((bubble) => (
          <article
            key={bubble.id}
            className={`bubble-node ${activeId === bubble.id ? "active" : ""}`}
            style={{
              background: bubble.colors.fill,
              borderColor: bubble.colors.border,
              color: bubble.colors.text,
              boxShadow: bubble.colors.glow,
              opacity: bubble.colors.mutedOpacity
            }}
          >
            <button type="button" className="bubble-main" onClick={() => onOpen(bubble.id)}>
              <strong>{bubble.label}</strong>
              <small>{bubble.status.toUpperCase()} | {bubble.score.toFixed(1)}</small>
            </button>
            <button type="button" className={`bubble-toggle ${bubble.selected ? "selected" : ""}`} onClick={() => onToggle(bubble.id)}>
              {bubble.selected ? "Selected" : "Mark"}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
