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
    const maxRadiusX = containerSize.width / 2 - BUBBLE_WIDTH / 2 - 10;
    const maxRadiusY = containerSize.height / 2 - BUBBLE_HEIGHT / 2 - 10;
    const maxRadius = Math.max(0, Math.min(maxRadiusX, maxRadiusY));
    const breakpointRadius =
      containerSize.width < 640 ? 150 : containerSize.width < 960 ? 190 : 240;
    return Math.min(Math.max(minRadius, breakpointRadius), maxRadius);
  }, [containerSize.height, containerSize.width, centerSize.height, centerSize.width]);

  return (
    <div className="ring-layout" ref={containerRef}>
      <div className="ring-center" ref={centerRef}>
        {centerContent}
      </div>

      {items.map((item) => {
        const rad = (item.angle * Math.PI) / 180;
        const x = Math.sin(rad) * radius;
        const y = -Math.cos(rad) * radius;
        return (
          <div
            key={item.id}
            className="ring-item"
            style={{ left: "50%", top: "50%", transform: `translate(-50%, -50%) translate(${x}px, ${y}px)` }}
          >
            {item.node}
          </div>
        );
      })}
    </div>
  );
}
