import React, { useRef, useState, useCallback } from 'react';
import { useCanvasStore } from './store';
import type { CanvasItem } from './types';

interface Point {
  x: number;
  y: number;
}

interface DraftRect {
  start: Point;
  current: Point;
}

// Utility to normalize rectangle regardless of drag direction
function normalize(start: Point, end: Point) {
  const left = Math.min(start.x, end.x);
  const top = Math.min(start.y, end.y);
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);
  return { left, top, width, height };
}

export const Canvas: React.FC = () => {
  const { items, addItem } = useCanvasStore();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [draft, setDraft] = useState<DraftRect | null>(null);
  const [isPointerDown, setIsPointerDown] = useState(false);

  const pointerPositionRelative = useCallback((clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return { x: clientX, y: clientY };
    const rect = el.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.dataset.item) return; // clicked on existing block
    const pos = pointerPositionRelative(e.clientX, e.clientY);
    setDraft({ start: pos, current: pos });
    setIsPointerDown(true);
  }, [pointerPositionRelative]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPointerDown || !draft) return;
    const pos = pointerPositionRelative(e.clientX, e.clientY);
    setDraft(d => (d ? { ...d, current: pos } : d));
  }, [isPointerDown, draft, pointerPositionRelative]);

  const commitDraft = useCallback(() => {
    if (!draft) return;
    const { left, top, width, height } = normalize(draft.start, draft.current);
    if (width < 8 || height < 8) {
      setDraft(null);
      return;
    }
    addItem({ x: left, y: top, width, height });
    setDraft(null);
  }, [draft, addItem]);

  const cancelDraft = useCallback(() => {
    setDraft(null);
    setIsPointerDown(false);
  }, []);

  const handlePointerUp = useCallback(() => {
    commitDraft();
    setIsPointerDown(false);
  }, [commitDraft]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      cancelDraft();
    }
  }, [cancelDraft]);

  const handlePointerLeave = useCallback(() => {
    if (isPointerDown) {
      cancelDraft();
    }
  }, [isPointerDown, cancelDraft]);

  const draftVisual = (() => {
    if (!draft) return null;
    const { left, top, width, height } = normalize(draft.start, draft.current);
    return (
      <div
        className="absolute border border-dashed border-blue-400 bg-blue-400/10 pointer-events-none"
        style={{ left, top, width, height }}
      />
    );
  })();

  return (
    <div className="space-y-2" onKeyDown={handleKeyDown}>
      <div
        ref={containerRef}
        className="relative w-full h-[480px] bg-slate-50 border border-slate-200 rounded-md overflow-hidden select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        tabIndex={0}
      >
        {items.map(item => (
          <div
            key={item.id}
            data-item="1"
            className="absolute rounded-sm bg-blue-500/30 hover:bg-blue-500/40 border border-blue-600/50 shadow-sm transition-colors"
            style={{ left: item.x, top: item.y, width: item.width, height: item.height }}
          />
        ))}
        {draftVisual}
        <div className="absolute bottom-1 right-2 text-[11px] px-1.5 py-0.5 bg-white/70 backdrop-blur rounded border border-slate-200 text-slate-600">
          Drag on empty space to create. Esc to cancel.
        </div>
      </div>
    </div>
  );
};
