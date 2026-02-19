import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";

interface RingItem {
  id: string;
  angle: number;
  node: ReactNode;
}

interface Props {
  centerContent: ReactNode;
  items: RingItem[];
}

const BUBBLE_WIDTH = 194;
const BUBBLE_HEIGHT = 58;
const EDGE_PADDING = 12;
const CM2_PX = 75.6;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function maxExtraAlongDirection(baseX: number, baseY: number, dx: number, dy: number, limitX: number, limitY: number) {
  let maxT = Number.POSITIVE_INFINITY;

  if (dx > 0) maxT = Math.min(maxT, (limitX - baseX) / dx);
  if (dx < 0) maxT = Math.min(maxT, (-limitX - baseX) / dx);
  if (dy > 0) maxT = Math.min(maxT, (limitY - baseY) / dy);
  if (dy < 0) maxT = Math.min(maxT, (-limitY - baseY) / dy);

  if (!Number.isFinite(maxT)) return 0;
  return Math.max(0, maxT);
}

export function RingLayout({ centerContent, items }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const centerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 760, height: 560 });
  const [centerSize, setCenterSize] = useState({ width: 520, height: 320 });

  useEffect(() => {
    if (!containerRef.current || !centerRef.current) return;
    const containerObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      setContainerSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    const centerObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      setCenterSize({ width: entry.contentRect.width, height: entry.contentRect.height });
    });
    containerObserver.observe(containerRef.current);
    centerObserver.observe(centerRef.current);
    return () => {
      containerObserver.disconnect();
      centerObserver.disconnect();
    };
  }, []);

  const radius = useMemo(() => {
    const minGap = 34;
    const radiusXMin = centerSize.width / 2 + BUBBLE_WIDTH / 2 + minGap;
    const radiusYMin = centerSize.height / 2 + BUBBLE_HEIGHT / 2 + minGap;
    const minRadius = Math.max(radiusXMin, radiusYMin);
    const maxRadiusX = containerSize.width / 2 - BUBBLE_WIDTH / 2 - EDGE_PADDING;
    const maxRadiusY = containerSize.height / 2 - BUBBLE_HEIGHT / 2 - EDGE_PADDING;
    const maxRadius = Math.max(0, Math.min(maxRadiusX, maxRadiusY));
    const breakpointRadius = containerSize.width < 640 ? 150 : containerSize.width < 960 ? 190 : 240;
    return Math.min(Math.max(minRadius, breakpointRadius), maxRadius);
  }, [centerSize.height, centerSize.width, containerSize.height, containerSize.width]);

  const positionedItems = useMemo(() => {
    const limitX = containerSize.width / 2 - BUBBLE_WIDTH / 2 - EDGE_PADDING;
    const limitY = containerSize.height / 2 - BUBBLE_HEIGHT / 2 - EDGE_PADDING;

    return items.map((item) => {
      const rad = (item.angle * Math.PI) / 180;
      const baseX = Math.cos(rad) * radius;
      const baseY = Math.sin(rad) * radius;
      const len = Math.hypot(baseX, baseY);

      if (!len) return { ...item, x: baseX, y: baseY };

      const dx = baseX / len;
      const dy = baseY / len;
      const allowedExtra = maxExtraAlongDirection(baseX, baseY, dx, dy, limitX, limitY);
      const extra = clamp(CM2_PX, 0, allowedExtra);
      const x = baseX + dx * extra;
      const y = baseY + dy * extra;

      return { ...item, x, y };
    });
  }, [containerSize.height, containerSize.width, items, radius]);

  return (
    <div className="ring-layout" ref={containerRef}>
      <div className="ring-center" ref={centerRef}>
        {centerContent}
      </div>

      {positionedItems.map((item) => (
        <div
          key={item.id}
          className="ring-item"
          style={{ left: "50%", top: "50%", transform: `translate(-50%, -50%) translate(${item.x}px, ${item.y}px)` }}
        >
          {item.node}
        </div>
      ))}
    </div>
  );
}
