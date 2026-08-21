import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { DrawingShape, DrawingToolType, Point } from './drawingTypes';

interface DrawingCanvasProps {
  width: number;
  height: number;
  activeTool: DrawingToolType;
  shapes: DrawingShape[];
  onShapesChange: (shapes: DrawingShape[]) => void;
  selectedShapeId: string | null;
  onSelectShape: (id: string | null) => void;
}

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({
  width,
  height,
  activeTool,
  shapes,
  onShapesChange,
  selectedShapeId,
  onSelectShape,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [draggingShapeIndex, setDraggingShapeIndex] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState<Point | null>(null);

  // Render all shapes onto canvas
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Draw existing completed shapes
    shapes.forEach((shape) => {
      ctx.save();
      ctx.strokeStyle = shape.color;
      ctx.fillStyle = shape.fillColor || 'transparent';
      ctx.lineWidth = shape.lineWidth || 2;

      if (shape.lineStyle === 'dashed') ctx.setLineDash([6, 4]);
      else if (shape.lineStyle === 'dotted') ctx.setLineDash([2, 2]);
      else ctx.setLineDash([]);

      const pts = shape.points;
      if (!pts || pts.length === 0) {
        ctx.restore();
        return;
      }

      switch (shape.tool) {
        case 'horizontal_line': {
          const y = pts[0].y;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();

          // Price label tag
          ctx.fillStyle = shape.color;
          ctx.font = '10px JetBrains Mono, monospace';
          ctx.fillText(`H-Line`, 10, y - 4);
          break;
        }

        case 'vertical_line': {
          const x = pts[0].x;
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
          break;
        }

        case 'trend_line':
        case 'ray': {
          if (pts.length >= 2) {
            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);
            if (shape.tool === 'ray') {
              const dx = pts[1].x - pts[0].x;
              const dy = pts[1].y - pts[0].y;
              ctx.lineTo(pts[0].x + dx * 20, pts[0].y + dy * 20);
            } else {
              ctx.lineTo(pts[1].x, pts[1].y);
            }
            ctx.stroke();
          }
          break;
        }

        case 'rectangle': {
          if (pts.length >= 2) {
            const rx = Math.min(pts[0].x, pts[1].x);
            const ry = Math.min(pts[0].y, pts[1].y);
            const rw = Math.abs(pts[1].x - pts[0].x);
            const rh = Math.abs(pts[1].y - pts[0].y);

            ctx.fillStyle = shape.fillColor || 'rgba(47, 129, 247, 0.12)';
            ctx.fillRect(rx, ry, rw, rh);
            ctx.strokeRect(rx, ry, rw, rh);
          }
          break;
        }

        case 'fibonacci_retracement': {
          if (pts.length >= 2) {
            const y0 = pts[0].y;
            const y1 = pts[1].y;
            const x0 = Math.min(pts[0].x, pts[1].x);
            const x1 = Math.max(pts[0].x, pts[1].x) + (width - Math.max(pts[0].x, pts[1].x)) * 0.7;
            const dy = y1 - y0;

            const levels = [
              { ratio: 0, color: '#7D8590' },
              { ratio: 0.236, color: '#F85149' },
              { ratio: 0.382, color: '#F0883E' },
              { ratio: 0.5, color: '#3FB950' },
              { ratio: 0.618, color: '#2F81F7' },
              { ratio: 0.786, color: '#A371F7' },
              { ratio: 1.0, color: '#7D8590' },
            ];

            levels.forEach((lvl) => {
              const ly = y0 + dy * lvl.ratio;
              ctx.strokeStyle = lvl.color;
              ctx.beginPath();
              ctx.moveTo(x0, ly);
              ctx.lineTo(x1, ly);
              ctx.stroke();

              ctx.fillStyle = lvl.color;
              ctx.font = '10px Inter, sans-serif';
              ctx.fillText(`Fib ${(lvl.ratio * 100).toFixed(1)}%`, x0 + 6, ly - 3);
            });
          }
          break;
        }

        case 'price_range': {
          if (pts.length >= 2) {
            const rx = Math.min(pts[0].x, pts[1].x);
            const ry = Math.min(pts[0].y, pts[1].y);
            const rw = Math.abs(pts[1].x - pts[0].x);
            const rh = Math.abs(pts[1].y - pts[0].y);

            ctx.fillStyle = 'rgba(56, 139, 253, 0.1)';
            ctx.fillRect(rx, ry, rw, rh);
            ctx.strokeRect(rx, ry, rw, rh);

            ctx.fillStyle = '#58A6FF';
            ctx.font = '11px JetBrains Mono, monospace';
            ctx.fillText(`Range: Δ${Math.abs(pts[1].y - pts[0].y).toFixed(0)}px`, rx + 8, ry + 16);
          }
          break;
        }

        case 'text_note': {
          ctx.fillStyle = shape.color || '#E6EDF3';
          ctx.font = '12px Inter, sans-serif';
          ctx.fillText(shape.text || 'Note', pts[0].x, pts[0].y);
          break;
        }
      }

      // Draw anchor handles if selected
      if (shape.id === selectedShapeId) {
        pts.forEach((p) => {
          ctx.fillStyle = '#2F81F7';
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
      }

      ctx.restore();
    });

    // Draw active preview shape being currently drawn
    if (isDrawing && currentPoints.length > 0) {
      ctx.save();
      ctx.strokeStyle = '#2F81F7';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);

      const p0 = currentPoints[0];
      const p1 = currentPoints[1] || p0;

      switch (activeTool) {
        case 'horizontal_line':
          ctx.beginPath();
          ctx.moveTo(0, p0.y);
          ctx.lineTo(width, p0.y);
          ctx.stroke();
          break;
        case 'vertical_line':
          ctx.beginPath();
          ctx.moveTo(p0.x, 0);
          ctx.lineTo(p0.x, height);
          ctx.stroke();
          break;
        case 'trend_line':
        case 'ray':
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.stroke();
          break;
        case 'rectangle':
        case 'price_range': {
          const rx = Math.min(p0.x, p1.x);
          const ry = Math.min(p0.y, p1.y);
          const rw = Math.abs(p1.x - p0.x);
          const rh = Math.abs(p1.y - p0.y);
          ctx.strokeRect(rx, ry, rw, rh);
          break;
        }
        case 'fibonacci_retracement':
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.stroke();
          break;
      }

      ctx.restore();
    }
  }, [width, height, shapes, selectedShapeId, isDrawing, currentPoints, activeTool]);

  useEffect(() => {
    render();
  }, [render]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const clickPoint: Point = { x, y };

    if (activeTool === 'cursor') {
      // Check if clicking near any shape to select or drag
      let hitId: string | null = null;
      for (let i = shapes.length - 1; i >= 0; i--) {
        const s = shapes[i];
        for (const p of s.points) {
          const dist = Math.hypot(p.x - x, p.y - y);
          if (dist < 12) {
            hitId = s.id;
            setDraggingShapeIndex(i);
            setDragOffset({ x: p.x - x, y: p.y - y });
            break;
          }
        }
        if (hitId) break;
      }
      onSelectShape(hitId);
      return;
    }

    if (activeTool === 'horizontal_line' || activeTool === 'vertical_line') {
      const newShape: DrawingShape = {
        id: `shape_${Date.now()}`,
        tool: activeTool,
        points: [clickPoint],
        color: '#2F81F7',
        lineWidth: 2,
      };
      onShapesChange([...shapes, newShape]);
      onSelectShape(newShape.id);
      return;
    }

    if (activeTool === 'text_note') {
      const text = prompt('Enter note text:', 'Key Level');
      if (text) {
        const newShape: DrawingShape = {
          id: `shape_${Date.now()}`,
          tool: activeTool,
          points: [clickPoint],
          color: '#E6EDF3',
          lineWidth: 1,
          text,
        };
        onShapesChange([...shapes, newShape]);
      }
      return;
    }

    // 2-point tools (trend line, rect, fib, etc.)
    if (!isDrawing) {
      setIsDrawing(true);
      setCurrentPoints([clickPoint, clickPoint]);
    } else {
      setIsDrawing(false);
      const newShape: DrawingShape = {
        id: `shape_${Date.now()}`,
        tool: activeTool,
        points: [currentPoints[0], clickPoint],
        color: activeTool === 'fibonacci_retracement' ? '#2F81F7' : '#2F81F7',
        lineWidth: 2,
        fillColor: activeTool === 'rectangle' ? 'rgba(47, 129, 247, 0.12)' : undefined,
      };
      onShapesChange([...shapes, newShape]);
      onSelectShape(newShape.id);
      setCurrentPoints([]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDrawing && currentPoints.length > 0) {
      setCurrentPoints([currentPoints[0], { x, y }]);
    } else if (draggingShapeIndex !== null && shapes[draggingShapeIndex]) {
      const updated = [...shapes];
      const s = { ...updated[draggingShapeIndex] };
      s.points = s.points.map((p) => ({
        x: p.x + (dragOffset?.x || 0),
        y: p.y + (dragOffset?.y || 0),
      }));
      updated[draggingShapeIndex] = s;
      onShapesChange(updated);
    }
  };

  const handleMouseUp = () => {
    setDraggingShapeIndex(null);
    setDragOffset(null);
  };

  // Keyboard shortcut to delete selected drawing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedShapeId) {
        onShapesChange(shapes.filter((s) => s.id !== selectedShapeId));
        onSelectShape(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedShapeId, shapes, onShapesChange, onSelectShape]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: activeTool !== 'cursor' || selectedShapeId ? 'auto' : 'none',
        cursor: activeTool === 'cursor' ? 'default' : 'crosshair',
        zIndex: 5,
      }}
    />
  );
};
