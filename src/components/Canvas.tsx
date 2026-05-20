/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { CanvasNode, Viewport, ThemeSettings, ComponentType } from '../types';
import { CanvasNodeRenderer } from './CanvasNode';
import { TOOL_ITEMS } from '../componentsData';
import { CanvasCopilot } from './CanvasCopilot';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Minimize2, 
  Hand, 
  MousePointer, 
  Grid3X3, 
  Eye, 
  Sparkles, 
  Flame, 
  RotateCcw,
  Check
} from 'lucide-react';

interface CanvasProps {
  nodes: CanvasNode[];
  selectedNodeId: string | null;
  selectedNodeIds: string[];
  mode: 'design' | 'play';
  theme: ThemeSettings;
  viewport: Viewport;
  activeTool: 'select' | 'pan';
  onSelectNode: (id: string | null) => void;
  onSelectNodeIds: (ids: string[]) => void;
  onUpdateViewport: (viewport: Viewport) => void;
  onUpdateNode: (nodeId: string, updates: Partial<CanvasNode>) => void;
  onAddNode: (type: ComponentType, x?: number, y?: number, parentId?: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (nodeId: string) => void;
  onMoveUpInParent: (id: string) => void;
  onMoveDownInParent: (id: string) => void;
  onDetachFromParent: (id: string) => void;
  onSetActiveTool: (tool: 'select' | 'pan') => void;
  onImportDraggedType: ComponentType | null;
  onResetDraggedType: () => void;
  onAddGeneratedNodes: (nodes: CanvasNode[]) => void;
  onReplaceNodes?: (nodes: CanvasNode[]) => void;
  onUpdateTheme?: (theme: Partial<ThemeSettings>) => void;
  onBulkDelete?: () => void;
  onUndo?: () => void;
}

export const Canvas: React.FC<CanvasProps> = ({
  nodes,
  selectedNodeId,
  selectedNodeIds,
  mode,
  theme,
  viewport,
  activeTool,
  onSelectNode,
  onSelectNodeIds,
  onUpdateViewport,
  onUpdateNode,
  onAddNode,
  onDeleteNode,
  onDuplicateNode,
  onMoveUpInParent,
  onMoveDownInParent,
  onDetachFromParent,
  onSetActiveTool,
  onImportDraggedType,
  onResetDraggedType,
  onAddGeneratedNodes,
  onReplaceNodes,
  onUpdateTheme,
  onBulkDelete,
  onUndo,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playModeRef = useRef<HTMLDivElement>(null);

  // Dragging states inside the canvas
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Resizing states inside the canvas
  const [resizingNodeId, setResizingNodeId] = useState<string | null>(null);
  const [resizeStart, setResizeStart] = useState<{ width: number; height: number; mouseX: number; mouseY: number }>({ width: 0, height: 0, mouseX: 0, mouseY: 0 });

  // Grid alignment assist lines
  const [alignmentLines, setAlignmentLines] = useState<{ x?: number; y?: number }>({});

  // Marquee selection lasso states
  const [marqueeStart, setMarqueeStart] = useState<{ x: number; y: number } | null>(null);
  const [marqueeEnd, setMarqueeEnd] = useState<{ x: number; y: number } | null>(null);

  // Bulk dragging state caches
  const [dragStartPlaces, setDragStartPlaces] = useState<Record<string, { x: number; y: number }>>({});
  const [dragMouseStart, setDragMouseStart] = useState<{ x: number; y: number } | null>(null);

  // Helper inside Canvas.tsx to calculate absolute coordinate of any node
  const getAbsolutePosition = (node: CanvasNode): { x: number; y: number } => {
    let x = node.x;
    let y = node.y;
    let current = node;
    while (current.parentId) {
      const parent = nodes.find((n) => n.id === current.parentId);
      if (!parent) break;
      x += parent.x;
      y += parent.y;
      current = parent;
    }
    return { x, y };
  };

  const findContainerAtCoords = (cx: number, cy: number, excludeId?: string): CanvasNode | null => {
    // Filter all containers (flexRow, flexCol, gridShell, card)
    const containers = nodes.filter((n) => 
      n.id !== excludeId && 
      ['flexRow', 'flexCol', 'gridShell', 'card'].includes(n.type)
    );

    let bestContainer: CanvasNode | null = null;
    let minArea = Infinity;

    containers.forEach((c) => {
      const absPos = getAbsolutePosition(c);
      const cW = c.width || 200;
      const cH = c.height || 80;
      if (cx >= absPos.x && cx <= absPos.x + cW && cy >= absPos.y && cy <= absPos.y + cH) {
        const area = cW * cH;
        if (area < minArea) {
          minArea = area;
          bestContainer = c;
        }
      }
    });

    return bestContainer;
  };

  // Mouse wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.05;
    let nextZoom = viewport.zoom;

    if (e.deltaY < 0) {
      if (viewport.zoom < 3) nextZoom = viewport.zoom * zoomFactor;
    } else {
      if (viewport.zoom > 0.2) nextZoom = viewport.zoom / zoomFactor;
    }

    // Zoom relative to mouse focus pointer
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Project screen coordinates back to canvas scale coordinates
      const canvasX = (mouseX - viewport.x) / viewport.zoom;
      const canvasY = (mouseY - viewport.y) / viewport.zoom;

      // Offset coordinates on different zooms
      const nextX = mouseX - canvasX * nextZoom;
      const nextY = mouseY - canvasY * nextZoom;

      onUpdateViewport({
        x: nextX,
        y: nextY,
        zoom: nextZoom,
      });
    }
  };

  // Middle-mouse or Space + Drag panning triggers
  const [spacePressed, setSpacePressed] = useState<boolean>(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(true);
      }

      // Delete selected components on Backspace or Delete
      if (mode === 'design' && (e.key === 'Backspace' || e.key === 'Delete')) {
        const activeEl = document.activeElement;
        const isInputActive = activeEl && (
          activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as any).isContentEditable ||
          activeEl.getAttribute('contenteditable') === 'true'
        );
        if (!isInputActive && selectedNodeIds.length > 0 && onBulkDelete) {
          e.preventDefault();
          onBulkDelete();
        }
      }

      // Handle Ctrl+Z or Cmd+Z Undo
      if (mode === 'design' && (e.ctrlKey || e.metaKey) && e.key === 'z') {
        const activeEl = document.activeElement;
        const isInputActive = activeEl && (
          activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as any).isContentEditable ||
          activeEl.getAttribute('contenteditable') === 'true'
        );
        if (!isInputActive && onUndo) {
          e.preventDefault();
          onUndo();
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [mode, selectedNodeIds, onBulkDelete, onUndo]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode === 'play') return;

    const isMiddleClick = e.button === 1;
    const wantsPan = activeTool === 'pan' || spacePressed || isMiddleClick;

    if (wantsPan) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
      onSelectNode(null);
    } else if (activeTool === 'select' && e.button === 0) {
      // Start marquee selection on left click of background!
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      const canvasX = (screenX - viewport.x) / viewport.zoom;
      const canvasY = (screenY - viewport.y) / viewport.zoom;

      setMarqueeStart({ x: canvasX, y: canvasY });
      setMarqueeEnd({ x: canvasX, y: canvasY });

      if (!e.shiftKey) {
        onSelectNodeIds([]);
      }
    }
  };

  const startResizeNode = (e: React.MouseEvent, node: CanvasNode) => {
    if (mode === 'play') return;
    e.stopPropagation();
    e.preventDefault();

    setResizingNodeId(node.id);
    onSelectNode(node.id);
    setResizeStart({
      width: node.width || 200,
      height: node.height || 80,
      mouseX: e.clientX,
      mouseY: e.clientY,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // If panning grid
    if (isPanning) {
      onUpdateViewport({
        ...viewport,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    // If marquee select is active
    if (marqueeStart && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      const canvasX = (screenX - viewport.x) / viewport.zoom;
      const canvasY = (screenY - viewport.y) / viewport.zoom;

      setMarqueeEnd({ x: canvasX, y: canvasY });

      const minX = Math.min(marqueeStart.x, canvasX);
      const maxX = Math.max(marqueeStart.x, canvasX);
      const minY = Math.min(marqueeStart.y, canvasY);
      const maxY = Math.max(marqueeStart.y, canvasY);

      const overlappedIds: string[] = [];
      nodes.forEach((n) => {
        const absPos = getAbsolutePosition(n);
        const nW = n.width || 200;
        const nH = n.height || 80;

        const isOverlapping = (
          absPos.x < maxX &&
          absPos.x + nW > minX &&
          absPos.y < maxY &&
          absPos.y + nH > minY
        );

        if (isOverlapping) {
          overlappedIds.push(n.id);
        }
      });

      if (e.shiftKey) {
        const unionSet = new Set([...selectedNodeIds, ...overlappedIds]);
        onSelectNodeIds(Array.from(unionSet));
      } else {
        onSelectNodeIds(overlappedIds);
      }
      return;
    }

    // If resizing a top-level freestanding component
    if (resizingNodeId && mode === 'design') {
      const deltaX = (e.clientX - resizeStart.mouseX) / viewport.zoom;
      const deltaY = (e.clientY - resizeStart.mouseY) / viewport.zoom;

      // Adjust dimensions, snapping to grid intervals of 12px for precision
      const snapStep = 12;
      let nextW = Math.max(48, resizeStart.width + deltaX);
      let nextH = Math.max(32, resizeStart.height + deltaY);

      nextW = Math.round(nextW / snapStep) * snapStep;
      nextH = Math.round(nextH / snapStep) * snapStep;

      onUpdateNode(resizingNodeId, { width: nextW, height: nextH });
      return;
    }

    // If dragging top-level freestanding component(s)
    if (draggedNodeId && dragMouseStart && containerRef.current && mode === 'design') {
      const rect = containerRef.current.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      const canvasMouseX = (screenX - viewport.x) / viewport.zoom;
      const canvasMouseY = (screenY - viewport.y) / viewport.zoom;

      const deltaX = canvasMouseX - dragMouseStart.x;
      const deltaY = canvasMouseY - dragMouseStart.y;

      // Calculate alignment lines for the PRIMARY dragged node
      const primaryStart = dragStartPlaces[draggedNodeId];
      let primaryTargetX = primaryStart ? primaryStart.x + deltaX : (canvasMouseX - dragOffset.x);
      let primaryTargetY = primaryStart ? primaryStart.y + deltaY : (canvasMouseY - dragOffset.y);

      const snapStep = 12;
      primaryTargetX = Math.round(primaryTargetX / snapStep) * snapStep;
      primaryTargetY = Math.round(primaryTargetY / snapStep) * snapStep;

      let alignX: number | undefined;
      let alignY: number | undefined;
      const alignThreshold = 15; // px

      nodes.forEach((otherNode) => {
        if (otherNode.id === draggedNodeId || selectedNodeIds.includes(otherNode.id) || otherNode.parentId) return;

        // X alignment
        if (Math.abs(otherNode.x - primaryTargetX) < alignThreshold) {
          primaryTargetX = otherNode.x;
          alignX = otherNode.x;
        } else if (otherNode.width && Math.abs((otherNode.x + otherNode.width) - primaryTargetX) < alignThreshold) {
          primaryTargetX = otherNode.x + otherNode.width;
          alignX = primaryTargetX;
        }

        // Y alignment
        if (Math.abs(otherNode.y - primaryTargetY) < alignThreshold) {
          primaryTargetY = otherNode.y;
          alignY = otherNode.y;
        } else if (otherNode.height && Math.abs((otherNode.y + otherNode.height) - primaryTargetY) < alignThreshold) {
          primaryTargetY = otherNode.y + otherNode.height;
          alignY = primaryTargetY;
        }
      });

      setAlignmentLines({ x: alignX, y: alignY });

      // Calculate actual delta of the primary node after snapping!
      const finalDeltaX = primaryTargetX - (primaryStart ? primaryStart.x : 0);
      const finalDeltaY = primaryTargetY - (primaryStart ? primaryStart.y : 0);

      // Apply drag to ALL selected nodes in this drag block
      Object.keys(dragStartPlaces).forEach((id) => {
        const startPos = dragStartPlaces[id];
        if (startPos) {
          let nextX = startPos.x + finalDeltaX;
          let nextY = startPos.y + finalDeltaY;

          nextX = Math.round(nextX / snapStep) * snapStep;
          nextY = Math.round(nextY / snapStep) * snapStep;

          onUpdateNode(id, { x: nextX, y: nextY });
        }
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);

    // If marquee select is active
    if (marqueeStart && marqueeEnd) {
      const dist = Math.hypot(marqueeEnd.x - marqueeStart.x, marqueeEnd.y - marqueeStart.y);
      if (dist < 4) {
        onSelectNodeIds([]);
      }
      setMarqueeStart(null);
      setMarqueeEnd(null);
    }

    if (draggedNodeId && mode === 'design') {
      const movingIds = Object.keys(dragStartPlaces);
      movingIds.forEach((id) => {
        const node = nodes.find((n) => n.id === id);
        if (node && !node.parentId) {
          const nodeW = node.width || 200;
          const nodeH = node.height || 80;
          const centerX = node.x + nodeW / 2;
          const centerY = node.y + nodeH / 2;

          const targetContainer = findContainerAtCoords(centerX, centerY, id);
          if (targetContainer) {
            onUpdateNode(id, { parentId: targetContainer.id });
          }
        }
      });
    }

    setDraggedNodeId(null);
    setResizingNodeId(null);
    setDragMouseStart(null);
    setDragStartPlaces({});
    setAlignmentLines({});
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Simple click checks are handled by mouseUp thresholds
  };

  const startDragNode = (e: React.MouseEvent, node: CanvasNode) => {
    if (mode === 'play') return;
    e.stopPropagation();

    const rect = containerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const canvasMouseX = (screenX - viewport.x) / viewport.zoom;
    const canvasMouseY = (screenY - viewport.y) / viewport.zoom;

    let targetSelection = [...selectedNodeIds];

    if (e.shiftKey) {
      if (selectedNodeIds.includes(node.id)) {
        targetSelection = selectedNodeIds.filter((id) => id !== node.id);
      } else {
        targetSelection = [...selectedNodeIds, node.id];
      }
      onSelectNodeIds(targetSelection);
    } else {
      if (!selectedNodeIds.includes(node.id)) {
        targetSelection = [node.id];
        onSelectNodeIds(targetSelection);
      }
    }

    setDraggedNodeId(node.id);
    setDragMouseStart({ x: canvasMouseX, y: canvasMouseY });

    const startPositions: Record<string, { x: number; y: number }> = {};
    nodes.forEach((n) => {
      if (targetSelection.includes(n.id)) {
        startPositions[n.id] = { x: n.x, y: n.y };
      }
    });
    setDragStartPlaces(startPositions);

    setDragOffset({
      x: canvasMouseX - node.x,
      y: canvasMouseY - node.y,
    });
  };

  // Zoom helpers
  const handleZoomIn = () => {
    onUpdateViewport({ ...viewport, zoom: Math.min(3, viewport.zoom * 1.2) });
  };

  const handleZoomOut = () => {
    onUpdateViewport({ ...viewport, zoom: Math.max(0.2, viewport.zoom / 1.2) });
  };

  const handleResetZoomAndPan = () => {
    onUpdateViewport({ x: 100, y: 50, zoom: 0.85 });
  };

  const handleZoomFit = () => {
    if (nodes.length === 0) {
      handleResetZoomAndPan();
      return;
    }

    // Determine bounding borders around nodes
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    nodes.forEach((n) => {
      if (n.parentId) return; // Nested nodes follow parent boundaries
      const width = n.width || 200;
      const height = n.height || 100;

      if (n.x < minX) minX = n.x;
      if (n.y < minY) minY = n.y;
      if (n.x + width > maxX) maxX = n.x + width;
      if (n.y + height > maxY) maxY = n.y + height;
    });

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const contentW = maxX - minX + 160;
      const contentH = maxY - minY + 160;

      // Calculated scaling factor matches width/height fits
      const fitZoom = Math.min(
        1.5,
        Math.max(0.4, Math.min(rect.width / contentW, rect.height / contentH))
      );

      // Grid offsets center calculation formulas
      const targetX = rect.width / 2 - (minX + (maxX - minX) / 2) * fitZoom;
      const targetY = rect.height / 2 - (minY + (maxY - minY) / 2) * fitZoom;

      onUpdateViewport({ x: targetX, y: targetY, zoom: fitZoom });
    }
  };

  // Drag and Drop files/items from LeftSidebar Panel over the canvas view
  const handleDragOverCanvas = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDropItemOverCanvas = (e: React.DragEvent) => {
    e.preventDefault();

    let dragType: ComponentType | null = onImportDraggedType;

    // Backup: read standard HTML dataTransfer if React states are empty
    if (!dragType) {
      const transferData = e.dataTransfer.getData('text/plain');
      if (transferData) {
        dragType = transferData as ComponentType;
      }
    }

    if (dragType && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      // Translate drop coordinates accounting for scroll offsets and zoom levels
      const canvasDropX = (screenX - viewport.x) / viewport.zoom;
      const canvasDropY = (screenY - viewport.y) / viewport.zoom;

      // Adjust to align drop center
      const schema = TOOL_ITEMS.find((item) => item.type === dragType);
      const halfW = (schema?.defaultWidth || 200) / 2;
      const halfH = (schema?.defaultHeight || 80) / 2;

      // Add node at projection coordinate
      const finalX = Math.round((canvasDropX - halfW) / 12) * 12;
      const finalY = Math.round((canvasDropY - halfH) / 12) * 12;

      // Check if dropped inside a container!
      const targetContainer = findContainerAtCoords(canvasDropX, canvasDropY);

      onAddNode(dragType, finalX, finalY, targetContainer?.id);
      onResetDraggedType();
    }
  };

  // Render a canvas tree recursively supporting unlimited cascading nesting depth
  const renderCanvasTree = (parentNodeId: string | null): React.ReactNode[] => {
    const parentChildren = nodes.filter((n) => {
      if (parentNodeId === null) {
        return !n.parentId;
      }
      return n.parentId === parentNodeId;
    });

    // If design mode inside rows: sort children elements visually horizontally or vertically,
    // so we render them in the exact right compiled stack sequence
    parentChildren.sort((a, b) => {
      if (Math.abs(a.y - b.y) < 25) {
        return a.x - b.x;
      }
      return a.y - b.y;
    });

    return parentChildren.map((node) => {
      const childrenNodesJSX = renderCanvasTree(node.id);
      const isSelected = selectedNodeIds.includes(node.id);

      return (
        <CanvasNodeRenderer
          key={node.id}
          node={node}
          theme={theme}
          mode={mode}
          isSelected={isSelected}
          onSelect={(e) => {
            if (activeTool === 'select' && mode === 'design') {
              startDragNode(e, node);
            }
          }}
          onDelete={onDeleteNode}
          onDuplicate={onDuplicateNode}
          onMoveUp={onMoveUpInParent}
          onMoveDown={onMoveDownInParent}
          onDetach={onDetachFromParent}
          onResizeStart={(e) => {
            if (activeTool === 'select' && mode === 'design') {
              startResizeNode(e, node);
            }
          }}
          allNodes={nodes}
          onSelectNodeIds={onSelectNodeIds}
          onUpdateNode={onUpdateNode}
        >
          {childrenNodesJSX.length > 0 ? childrenNodesJSX : undefined}
        </CanvasNodeRenderer>
      );
    });
  };

  // Compile coordinates projection helpers
  const cursorStyle = activeTool === 'pan' || spacePressed 
    ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') 
    : 'cursor-default';

  return (
    <div className="flex-grow flex flex-col h-full bg-[#fafafa] dark:bg-[#09090b] overflow-hidden relative">
      
      {/* Top micro-toolbar containing panning and pointer modes */}
      <div className="absolute top-4 left-4 z-40 bg-white/90 dark:bg-zinc-950/90 border border-zinc-200 dark:border-zinc-800 p-1 rounded backdrop-blur-md shadow-xs flex items-center gap-1">
        <button
          type="button"
          onClick={() => onSetActiveTool('select')}
          title="Pointer tool"
          className={`px-2.5 py-1.5 rounded-sm text-[11px] font-bold transition-all select-none cursor-pointer flex items-center justify-center gap-1 border-0 ${
            activeTool === 'select'
              ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
              : 'text-zinc-450 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 bg-transparent'
          }`}
        >
          <MousePointer className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Design pointer</span>
        </button>
 
        <button
          type="button"
          onClick={() => onSetActiveTool('pan')}
          title="Pan Hand tool (Hold SPACE on desktop)"
          className={`px-2.5 py-1.5 rounded-sm text-[11px] font-bold transition-all select-none cursor-pointer flex items-center justify-center gap-1 border-0 ${
            activeTool === 'pan'
              ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950'
              : 'text-zinc-450 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 bg-transparent'
          }`}
        >
          <Hand className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Hand Pan</span>
        </button>
      </div>

      {/* AI Layout Copilot Bar (floating centered at the bottom overlay, visible in design mode) */}
      {mode === 'design' && (
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-[580px] px-4 pointer-events-none flex justify-center">
          <CanvasCopilot
            nodes={nodes}
            viewport={viewport}
            onAddGeneratedNodes={onAddGeneratedNodes}
            onReplaceNodes={onReplaceNodes}
            theme={theme}
            onUpdateTheme={onUpdateTheme}
            selectedNodeIds={selectedNodeIds}
          />
        </div>
      )}

      {/* Mode status indicator badge overlay */}
      <div className="absolute top-4 right-4 z-40 flex items-center gap-2">
        <div className={`px-2.5 py-1.5 rounded border flex items-center gap-1.5 leading-none text-[10px] font-bold tracking-widest uppercase transition-all backdrop-blur-md select-none border-zinc-200 bg-white/90 dark:border-zinc-800 dark:bg-zinc-950/90 ${
          mode === 'play'
            ? 'text-green-600 dark:text-green-400'
            : 'text-zinc-500 dark:text-zinc-400'
        }`}>
          <div className={`h-1.5 w-1.5 rounded-full ${mode === 'play' ? 'bg-green-550 animate-pulse' : 'bg-zinc-400'}`} />
          <span>{mode === 'play' ? 'Simulation Active' : 'LAYOUT EDITOR'}</span>
        </div>
      </div>
 
      {/* Floating Canvas Area Workspace Container */}
      <div
        ref={containerRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onDragOver={handleDragOverCanvas}
        onDrop={handleDropItemOverCanvas}
        onClick={handleCanvasClick}
        className={`flex-grow w-full h-full relative overflow-hidden select-none outline-none ${
          theme.darkMode ? 'bg-grid-pattern-dark bg-[#09090b]' : 'bg-grid-pattern bg-[#fafafa]'
        } ${cursorStyle}`}
      >
        
        {/* Alignment Assist Grid Helper Lines (Design View Only) */}
        {mode === 'design' && (
          <>
            {alignmentLines.x !== undefined && (
              <div
                className="absolute border-l border-dashed border-sky-400/80 z-[1]"
                style={{
                  left: `${alignmentLines.x * viewport.zoom + viewport.x}px`,
                  top: 0,
                  bottom: 0,
                  pointerEvents: 'none',
                }}
              />
            )}
            
            {alignmentLines.y !== undefined && (
              <div
                className="absolute border-t border-dashed border-sky-400/80 z-[1]"
                style={{
                  top: `${alignmentLines.y * viewport.zoom + viewport.y}px`,
                  left: 0,
                  right: 0,
                  pointerEvents: 'none',
                }}
              />
            )}
          </>
        )}

        {/* Scaled Perspective Workspace Area */}
        <div
          className="absolute origin-top-left overflow-visible select-none min-w-[2000px] min-h-[2000px]"
          style={{
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
            pointerEvents: mode === 'play' ? 'auto' : 'all',
          }}
        >
          {/* Render all roots recursively */}
          {renderCanvasTree(null)}

          {/* Graphical marquee lasso rectangle */}
          {marqueeStart && marqueeEnd && (
            <div
              className="absolute border border-[#3b82f6] bg-[#3b82f6]/10 dark:bg-[#3b82f6]/15 pointer-events-none rounded-2xs z-[9999]"
              style={{
                left: `${Math.min(marqueeStart.x, marqueeEnd.x)}px`,
                top: `${Math.min(marqueeStart.y, marqueeEnd.y)}px`,
                width: `${Math.abs(marqueeStart.x - marqueeEnd.x)}px`,
                height: `${Math.abs(marqueeStart.y - marqueeEnd.y)}px`,
              }}
            />
          )}
        </div>

      </div>

      {/* Bottom Floating viewport controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40 bg-white/90 dark:bg-zinc-950/90 border border-zinc-200 dark:border-zinc-805 py-1 px-3 rounded backdrop-blur-md shadow-xs flex items-center gap-1">
        
        {/* Zoom scale percentage badge */}
        <span className="font-mono text-[11px] font-bold text-zinc-550 dark:text-zinc-400 select-none mr-2">
          {Math.round(viewport.zoom * 100)}%
        </span>

        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-1.5 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 rounded-sm text-zinc-650 dark:text-zinc-400 active:scale-95 cursor-pointer flex items-center justify-center font-bold border-0 bg-transparent transition-all"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={handleResetZoomAndPan}
          title="Reset Zoom (100% and Recenter)"
          className="p-1.5 px-2 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 rounded-sm text-zinc-650 dark:text-zinc-400 active:scale-95 cursor-pointer flex items-center justify-center text-[11px] font-bold font-mono border-0 bg-transparent transition-all"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          <span>Reset</span>
        </button>

        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-1.5 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 rounded-sm text-zinc-650 dark:text-zinc-400 active:scale-95 cursor-pointer flex items-center justify-center font-bold border-0 bg-transparent transition-all"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1" />

        <button
          type="button"
          onClick={handleZoomFit}
          title="Zoom to Fit Everything"
          className="p-1.5 px-2 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40 rounded-sm text-zinc-650 dark:text-zinc-400 active:scale-95 cursor-pointer flex items-center justify-center font-bold border-0 bg-transparent transition-all"
        >
          <Maximize2 className="w-3.5 h-3.5 mr-1 text-zinc-500" />
          <span className="text-[11px] font-bold hidden sm:inline">Fit All</span>
        </button>

      </div>

    </div>
  );
};
