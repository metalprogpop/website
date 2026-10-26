import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// A horizontal row of tiles, designed per input: touch scrolls natively with
// snap; a mouse can drag the row (a drag never fires a click) or use the
// arrows that show on hover.
export function ScrollRow({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, moved: false, startX: 0, startLeft: 0 });
  const [edges, setEdges] = useState({ start: true, end: false });

  const updateEdges = () => {
    const el = ref.current;
    if (el) {
      setEdges({
        start: el.scrollLeft < 8,
        end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8,
      });
    }
  };
  // Arrows enable or disable as the row's content or width changes.
  useEffect(() => {
    const el = ref.current;
    updateEdges();
    if (!el || typeof ResizeObserver === "undefined") {
      return undefined;
    }
    const observer = new ResizeObserver(updateEdges);
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);

  // Ends a drag however the pointer was released, even outside the row.
  const endDrag = () => {
    drag.current.active = false;
    if (ref.current) {
      ref.current.style.scrollSnapType = "";
      ref.current.style.cursor = "";
    }
  };

  const page = (direction: 1 | -1) => {
    const el = ref.current;
    el?.scrollBy({
      left: direction * el.clientWidth * 0.85,
      behavior: "smooth",
    });
  };

  return (
    <section className="group/row relative mb-10">
      <h3 className="mb-4 font-display text-xl font-bold text-text-primary">
        {title}
      </h3>
      <div
        ref={ref}
        onScroll={updateEdges}
        onDragStart={(e) => {
          e.preventDefault();
        }}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || e.button !== 0 || !ref.current) {
            return;
          }
          drag.current = {
            active: true,
            moved: false,
            startX: e.clientX,
            startLeft: ref.current.scrollLeft,
          };
        }}
        onPointerMove={(e) => {
          const el = ref.current;
          if (!drag.current.active || !el) {
            return;
          }
          // Released outside the window before the drag began.
          if ((e.buttons & 1) === 0) {
            endDrag();
            return;
          }
          const dx = e.clientX - drag.current.startX;
          if (!drag.current.moved && Math.abs(dx) > 6) {
            drag.current.moved = true;
            el.setPointerCapture(e.pointerId);
            el.style.scrollSnapType = "none";
            el.style.cursor = "grabbing";
          }
          if (drag.current.moved) {
            el.scrollLeft = drag.current.startLeft - dx;
          }
        }}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
        onClickCapture={(e) => {
          if (drag.current.moved) {
            e.preventDefault();
            e.stopPropagation();
            drag.current.moved = false;
          }
        }}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] pointer-fine:cursor-grab sm:-mx-6 sm:scroll-px-6 sm:px-6"
      >
        {children}
      </div>
      {(["start", "end"] as const).map((side) => (
        <button
          key={side}
          type="button"
          aria-label={side === "start" ? "Anteriores" : "Siguientes"}
          disabled={edges[side]}
          onClick={() => {
            page(side === "start" ? -1 : 1);
          }}
          className={`absolute top-[calc(50%+0.75rem)] z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-text-primary opacity-0 shadow-lg transition-opacity hover:text-brand focus-visible:opacity-100 disabled:!opacity-0 pointer-fine:flex pointer-fine:group-hover/row:opacity-100 ${side === "start" ? "-left-5" : "-right-5"}`}
        >
          {side === "start" ? (
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          ) : (
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      ))}
    </section>
  );
}
