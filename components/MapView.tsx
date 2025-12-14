import React, { useState, useRef, useEffect } from 'react';
import { Map, RefreshCw, ZoomIn, ZoomOut, Move } from 'lucide-react';

interface Props {
  mapUrl: string | null;
  countryName: string;
  isLoading: boolean;
}

const MapView: React.FC<Props> = ({ mapUrl, countryName, isLoading }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset zoom when map changes
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [mapUrl]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleAdjustment = -e.deltaY * 0.001;
    setScale(Math.min(Math.max(.5, scale + scaleAdjustment), 4));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (isLoading && !mapUrl) {
    return (
      <div className="h-[500px] bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-zinc-900/[0.2] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
        <RefreshCw size={48} className="mb-4 animate-spin text-blue-500" />
        <p className="font-mono text-sm">SATELLITE UPLINK ESTABLISHED...</p>
        <p className="font-mono text-xs text-zinc-500 mt-2">GENERATING STRATEGIC MAP DATA</p>
      </div>
    );
  }

  if (!mapUrl) {
    return (
      <div className="h-[500px] bg-zinc-950 border border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-600">
        <Map size={48} className="mb-4 opacity-50" />
        <p className="font-mono">No Map Data Available</p>
      </div>
    );
  }

  return (
    <div className="h-[500px] bg-black border border-zinc-800 rounded-xl overflow-hidden relative group select-none">
      <div 
        ref={containerRef}
        className="w-full h-full overflow-hidden cursor-move relative"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
          <img 
            src={mapUrl} 
            alt={`Strategic Map of ${countryName}`} 
            className="w-full h-full object-contain transition-transform duration-100 ease-out"
            style={{ 
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            }}
            draggable={false}
          />
      </div>
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
      
      {/* HUD Elements */}
      <div className="absolute top-4 left-4 z-10 bg-black/70 backdrop-blur px-3 py-1 rounded border border-zinc-700 text-xs font-mono text-blue-400 flex items-center gap-2 pointer-events-none">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        LIVE FEED: {countryName.toUpperCase()}
      </div>

      <div className="absolute bottom-4 left-4 z-10 flex gap-2">
         <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="bg-zinc-800 p-2 rounded hover:bg-zinc-700 text-white"><ZoomOut size={16}/></button>
         <button onClick={() => setScale(1)} className="bg-zinc-800 p-2 rounded hover:bg-zinc-700 text-white"><Move size={16}/></button>
         <button onClick={() => setScale(s => Math.min(4, s + 0.2))} className="bg-zinc-800 p-2 rounded hover:bg-zinc-700 text-white"><ZoomIn size={16}/></button>
      </div>
      
      <div className="absolute bottom-4 right-4 text-[10px] font-mono text-zinc-500 text-right pointer-events-none">
        <div>COORD: 34.0522° N, 118.2437° W</div>
        <div>SECTOR: A-7</div>
        <div>ZOOM: {(scale * 100).toFixed(0)}%</div>
      </div>
    </div>
  );
};

export default MapView;