import React, { useState, useRef, useCallback } from 'react';

interface FigmaProps {
  onClose: () => void;
}

interface Shape {
  id: string;
  type: 'rectangle' | 'ellipse' | 'text';
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  text?: string;
}

const Figma: React.FC<FigmaProps> = ({ onClose }) => {
  const [shapes, setShapes] = useState<Shape[]>([
    { id: '1', type: 'rectangle', x: 100, y: 100, width: 200, height: 150, fill: '#5B5FC7' },
    { id: '2', type: 'ellipse', x: 350, y: 120, width: 120, height: 120, fill: '#F24E1E' },
    { id: '3', type: 'text', x: 150, y: 300, width: 200, height: 40, fill: '#000', text: 'Hello Figma!' },
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<'select' | 'rectangle' | 'ellipse' | 'text'>('select');
  const [zoom, setZoom] = useState(100);
  const canvasRef = useRef<HTMLDivElement>(null);

  const selectedShape = shapes.find(s => s.id === selectedId);

  const tools = [
    { id: 'select', icon: '↖️', label: 'Select' },
    { id: 'rectangle', icon: '⬜', label: 'Rectangle' },
    { id: 'ellipse', icon: '⭕', label: 'Ellipse' },
    { id: 'text', icon: 'T', label: 'Text' },
  ] as const;

  const addShape = useCallback((type: 'rectangle' | 'ellipse' | 'text') => {
    const newShape: Shape = {
      id: Date.now().toString(),
      type,
      x: 200 + Math.random() * 100,
      y: 200 + Math.random() * 100,
      width: type === 'text' ? 150 : 100,
      height: type === 'text' ? 30 : 100,
      fill: type === 'text' ? '#000' : `hsl(${Math.random() * 360}, 70%, 60%)`,
      text: type === 'text' ? 'New text' : undefined,
    };
    setShapes(prev => [...prev, newShape]);
    setSelectedId(newShape.id);
    setTool('select');
  }, []);

  const updateShape = useCallback((id: string, updates: Partial<Shape>) => {
    setShapes(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const deleteSelected = useCallback(() => {
    if (selectedId) {
      setShapes(prev => prev.filter(s => s.id !== selectedId));
      setSelectedId(null);
    }
  }, [selectedId]);

  return (
    <div className="h-full flex flex-col bg-[#2c2c2c] text-white">
      {/* Header */}
      <div className="h-12 bg-[#1e1e1e] flex items-center justify-between px-4 border-b border-black/30">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-[#0ACF83]">F</span>
          <span className="text-sm text-white/60">Untitled</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm">Share</button>
          <button className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-sm">▶ Present</button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Left Toolbar */}
        <div className="w-12 bg-[#2c2c2c] border-r border-black/30 flex flex-col items-center py-2 gap-1">
          {tools.map(t => (
            <button
              key={t.id}
              onClick={() => {
                setTool(t.id);
                if (t.id !== 'select') addShape(t.id);
              }}
              className={`w-9 h-9 rounded flex items-center justify-center transition-colors
                ${tool === t.id ? 'bg-blue-600' : 'hover:bg-white/10'}
              `}
              title={t.label}
            >
              {t.icon}
            </button>
          ))}
          <div className="flex-1" />
          <button className="w-9 h-9 rounded hover:bg-white/10 flex items-center justify-center">💬</button>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-[#1e1e1e] overflow-auto relative" ref={canvasRef}>
          <div
            className="absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            onClick={() => setSelectedId(null)}
          >
            {shapes.map(shape => (
              <div
                key={shape.id}
                onClick={(e) => { e.stopPropagation(); setSelectedId(shape.id); }}
                style={{
                  position: 'absolute',
                  left: shape.x,
                  top: shape.y,
                  width: shape.width,
                  height: shape.height,
                  backgroundColor: shape.type !== 'text' ? shape.fill : 'transparent',
                  borderRadius: shape.type === 'ellipse' ? '50%' : 0,
                  cursor: 'move',
                  border: selectedId === shape.id ? '2px solid #0ACF83' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: shape.fill,
                  fontSize: '18px',
                  fontWeight: shape.type === 'text' ? 500 : undefined,
                }}
              >
                {shape.type === 'text' && shape.text}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-64 bg-[#2c2c2c] border-l border-black/30 p-4">
          {selectedShape ? (
            <>
              <h3 className="text-xs font-semibold text-white/50 uppercase mb-4">Design</h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-white/50">X</label>
                    <input
                      type="number"
                      value={selectedShape.x}
                      onChange={e => updateShape(selectedShape.id, { x: +e.target.value })}
                      className="w-full px-2 py-1 bg-white/10 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/50">Y</label>
                    <input
                      type="number"
                      value={selectedShape.y}
                      onChange={e => updateShape(selectedShape.id, { y: +e.target.value })}
                      className="w-full px-2 py-1 bg-white/10 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/50">W</label>
                    <input
                      type="number"
                      value={selectedShape.width}
                      onChange={e => updateShape(selectedShape.id, { width: +e.target.value })}
                      className="w-full px-2 py-1 bg-white/10 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/50">H</label>
                    <input
                      type="number"
                      value={selectedShape.height}
                      onChange={e => updateShape(selectedShape.id, { height: +e.target.value })}
                      className="w-full px-2 py-1 bg-white/10 rounded text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-white/50">Fill</label>
                  <div className="flex gap-2 mt-1">
                    <input
                      type="color"
                      value={selectedShape.fill}
                      onChange={e => updateShape(selectedShape.id, { fill: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={selectedShape.fill}
                      onChange={e => updateShape(selectedShape.id, { fill: e.target.value })}
                      className="flex-1 px-2 py-1 bg-white/10 rounded text-sm font-mono"
                    />
                  </div>
                </div>

                {selectedShape.type === 'text' && (
                  <div>
                    <label className="text-xs text-white/50">Text</label>
                    <input
                      type="text"
                      value={selectedShape.text || ''}
                      onChange={e => updateShape(selectedShape.id, { text: e.target.value })}
                      className="w-full px-2 py-1 bg-white/10 rounded text-sm mt-1"
                    />
                  </div>
                )}

                <button
                  onClick={deleteSelected}
                  className="w-full py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-sm"
                >
                  Delete
                </button>
              </div>
            </>
          ) : (
            <div className="text-center text-white/40 mt-8">
              <p>Select an element to edit</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="h-8 bg-[#1e1e1e] flex items-center justify-between px-4 text-xs text-white/50 border-t border-black/30">
        <span>{shapes.length} objects</span>
        <div className="flex items-center gap-2">
          <button onClick={() => setZoom(z => Math.max(25, z - 25))} className="hover:text-white">−</button>
          <span>{zoom}%</span>
          <button onClick={() => setZoom(z => Math.min(200, z + 25))} className="hover:text-white">+</button>
        </div>
      </div>
    </div>
  );
};

export default Figma;
