import { useState, useCallback } from "react";
import type { CanvasItem } from "./types";

export function useCanvasStore() {
  const [items, setItems] = useState<CanvasItem[]>([]);

  const addItem = useCallback((partial: Omit<CanvasItem, "id">) => {
    setItems(prev => [
      ...prev,
      { id: crypto.randomUUID(), ...partial }
    ]);
  }, []);

  return { items, addItem };
}