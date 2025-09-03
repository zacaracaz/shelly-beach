import React from "react";
import { Canvas } from "./canvas/Canvas";

export default function App() {
  return (
    <div className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold mb-4">Shelly Beach</h1>
        <div className="p-4 rounded shadow-subtle bg-amber-500 text-white">
          Tailwind Working Test Block
        </div>
        <p className="mt-4 text-sm text-slate-600">
          Edit src/App.tsx and save to test HMR. Below is the experimental drag-to-create canvas.
        </p>
      </header>
      <section>
        <h2 className="text-lg font-medium mb-2">Canvas (Drag on empty space to create blocks)</h2>
        <Canvas />
      </section>
    </div>
  );
}