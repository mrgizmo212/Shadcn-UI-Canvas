/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { LeftSidebar } from './components/LeftSidebar';
import { RightSidebar } from './components/RightSidebar';
import { Canvas } from './components/Canvas';
import { ExportModal } from './components/ExportModal';
import { generateReactCode } from './codegen';
import { TOOL_ITEMS } from './componentsData';
import { CanvasNode, Viewport, ThemeSettings, ComponentType } from './types';
import { 
  Play, 
  Settings, 
  Trash2, 
  Layout, 
  FileCode, 
  Download, 
  RotateCcw, 
  HelpCircle,
  Eye,
  Check,
  ChevronRight
} from 'lucide-react';

export default function App() {
  // 1. Core States
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const selectedNodeId = selectedNodeIds.length > 0 ? selectedNodeIds[selectedNodeIds.length - 1] : null;
  const [mode, setMode] = useState<'design' | 'play'>('design');
  
  // Sidebar Panel Collapsing States
  const [leftSidebarCollapsed, setLeftSidebarCollapsed] = useState<boolean>(false);
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState<boolean>(false);
  
  // Starting viewport coordinates zoomed out to view the preloaded dashboard perfectly
  const [viewport, setViewport] = useState<Viewport>({ x: 60, y: 30, zoom: 0.72 });
  const [activeTool, setActiveTool] = useState<'select' | 'pan'>('select');
  
  // Custom Shadcn active themes
  const [theme, setTheme] = useState<ThemeSettings>({
    baseColor: 'zinc',
    darkMode: true,
    radius: 'md',
  });

  // Sidebar drag reference holding state
  const [draggedItemType, setDraggedItemType] = useState<ComponentType | null>(null);
  
  // Exporter overlays toggle
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  // History state for undoing deletions
  const [history, setHistory] = useState<{ nodes: CanvasNode[]; selectedNodeIds: string[] }[]>([]);

  const saveToHistory = (customNodes?: CanvasNode[], customSelectedIds?: string[]) => {
    const nodesToSave = customNodes || nodes;
    const idsToSave = customSelectedIds || selectedNodeIds;
    setHistory((prev) => [
      ...prev,
      {
        nodes: JSON.parse(JSON.stringify(nodesToSave)),
        selectedNodeIds: [...idsToSave],
      }
    ]);
  };

  const handleUndo = () => {
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const copy = [...prev];
      const prevState = copy.pop();
      if (prevState) {
        setNodes(prevState.nodes);
        setSelectedNodeIds(prevState.selectedNodeIds);
      }
      return copy;
    });
  };

  // 2. Load starting dashboard layout default empty on mounting
  useEffect(() => {
    // Start with blank canvas
    setNodes([]);
  }, []);

  // Sync index.css dark class depending on dark theme selected
  useEffect(() => {
    if (theme.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme.darkMode]);

  // 3. Callback handlers

  // Select node trigger
  const handleSelectNode = (id: string | null) => {
    setSelectedNodeIds(id ? [id] : []);
  };

  const handleSelectNodeIds = (ids: string[]) => {
    setSelectedNodeIds(ids);
  };

  // Update theme settings
  const handleUpdateTheme = (updatedTheme: Partial<ThemeSettings>) => {
    setTheme((prev) => ({ ...prev, ...updatedTheme }));
  };

  // Update canvas viewport
  const handleUpdateViewport = (updatedViewport: Viewport) => {
    setViewport(updatedViewport);
  };

  // Add individual node inside the viewport center or drop coords
  const handleAddNode = (type: ComponentType, x?: number, y?: number, parentId?: string) => {
    const itemSchema = TOOL_ITEMS.find((t) => t.type === type);
    if (!itemSchema) return;

    // Determine final placement coords
    let finalX = x !== undefined ? x : 200;
    let finalY = y !== undefined ? y : 120;

    // If coordinates are omitted, compute placement at current viewport center
    if (x === undefined || y === undefined) {
      const canvasCenterW = window.innerWidth / 2;
      const canvasCenterH = window.innerHeight / 2;
      finalX = Math.round(((canvasCenterW - viewport.x - (itemSchema.defaultWidth || 200) / 2) / viewport.zoom) / 12) * 12;
      finalY = Math.round(((canvasCenterH - viewport.y - (itemSchema.defaultHeight || 80) / 2) / viewport.zoom) / 12) * 12;
    }

    const newNodeId = `${type}-${Math.random().toString(36).substring(2, 9)}`;
    const newNode: CanvasNode = {
      id: newNodeId,
      type,
      x: finalX,
      y: finalY,
      width: itemSchema.defaultWidth || 200,
      height: itemSchema.defaultHeight || 80,
      parentId,
      properties: JSON.parse(JSON.stringify(itemSchema.defaultProperties)),
    };

    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeIds([newNodeId]);
  };

  // Update node coordinates or properties
  const handleUpdateNode = (nodeId: string, updates: Partial<CanvasNode>) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === nodeId ? { ...node, ...updates } : node))
    );
  };

  // Delete node and clean recursively if container is wiped
  const handleDeleteNode = (nodeId: string) => {
    saveToHistory();

    // Collect child nodes to remove
    const collectChildIds = (id: string, list: string[]) => {
      nodes.forEach((n) => {
        if (n.parentId === id) {
          list.push(n.id);
          collectChildIds(n.id, list);
        }
      });
      return list;
    };

    const idsToRemove = [nodeId, ...collectChildIds(nodeId, [])];

    // Clear state
    setNodes((prev) => prev.filter((node) => !idsToRemove.includes(node.id)));
    setSelectedNodeIds((prev) => prev.filter((id) => !idsToRemove.includes(id)));
  };

  // Duplicate node including nested structures!
  const handleDuplicateNode = (nodeId: string) => {
    const sourceNode = nodes.find((n) => n.id === nodeId);
    if (!sourceNode) return;

    // Create a seed identifier
    const idSeed = Math.random().toString(36).substring(2, 7);
    const idMap: Record<string, string> = {};

    // Get subtree of all associated nested descendents
    const subtree: CanvasNode[] = [];
    const collectDescendents = (id: string) => {
      nodes.forEach((n) => {
        if (n.parentId === id) {
          subtree.push(n);
          collectDescendents(n.id);
        }
      });
    };

    subtree.push(sourceNode);
    collectDescendents(nodeId);

    // Build ID map first
    subtree.forEach((n) => {
      idMap[n.id] = `${n.type}-${n.id.split('-')[1] || ''}-${idSeed}`;
    });

    // Remap child coordinates and pointers
    const duplicatedNodes: CanvasNode[] = subtree.map((n) => {
      const isRoot = n.id === nodeId;
      return {
        ...n,
        id: idMap[n.id],
        // Shift root slightly to represent copy
        x: isRoot ? n.x + 36 : n.x,
        y: isRoot ? n.y + 36 : n.y,
        parentId: n.parentId ? idMap[n.parentId] : undefined,
        properties: JSON.parse(JSON.stringify(n.properties)),
      };
    });

    setNodes((prev) => [...prev, ...duplicatedNodes]);
    setSelectedNodeIds([idMap[nodeId]]); // Highlights copy container
  };

  // Detach nested layer element out back to absolute parent coordinate space
  const handleDetachFromParent = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node || !node.parentId) return;

    const parentNode = nodes.find((n) => n.id === node.parentId);
    
    // Spawn nearby parent's offset
    const spawnX = parentNode ? parentNode.x + 400 : node.x + 60;
    const spawnY = parentNode ? parentNode.y + 120 : node.y + 60;

    handleUpdateNode(nodeId, {
      parentId: undefined,
      x: spawnX,
      y: spawnY,
    });
  };

  const handleBulkAlign = (alignment: 'left' | 'right' | 'top' | 'bottom' | 'distribute-h' | 'distribute-v') => {
    if (selectedNodeIds.length <= 1) return;
    setNodes((prev) => {
      const targetNodes = prev.filter((n) => selectedNodeIds.includes(n.id));
      if (targetNodes.length === 0) return prev;
      if (alignment === 'left') {
        const minX = Math.min(...targetNodes.map((n) => n.x));
        return prev.map((n) => selectedNodeIds.includes(n.id) ? { ...n, x: minX } : n);
      }
      if (alignment === 'right') {
        const maxX = Math.max(...targetNodes.map((n) => n.x + (n.width || 200)));
        return prev.map((n) => selectedNodeIds.includes(n.id) ? { ...n, x: maxX - (n.width || 200) } : n);
      }
      if (alignment === 'top') {
        const minY = Math.min(...targetNodes.map((n) => n.y));
        return prev.map((n) => selectedNodeIds.includes(n.id) ? { ...n, y: minY } : n);
      }
      if (alignment === 'bottom') {
        const maxY = Math.max(...targetNodes.map((n) => n.y + (n.height || 80)));
        return prev.map((n) => selectedNodeIds.includes(n.id) ? { ...n, y: maxY - (n.height || 80) } : n);
      }
      if (alignment === 'distribute-h') {
        const sorted = [...targetNodes].sort((a, b) => a.x - b.x);
        if (sorted.length <= 2) return prev;
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        const span = last.x - first.x;
        const step = span / (sorted.length - 1);
        return prev.map((n) => {
          const idx = sorted.findIndex((s) => s.id === n.id);
          if (idx !== -1) {
            return { ...n, x: Math.round((first.x + idx * step) / 12) * 12 };
          }
          return n;
        });
      }
      if (alignment === 'distribute-v') {
        const sorted = [...targetNodes].sort((a, b) => a.y - b.y);
        if (sorted.length <= 2) return prev;
        const first = sorted[0];
        const last = sorted[sorted.length - 1];
        const span = last.y - first.y;
        const step = span / (sorted.length - 1);
        return prev.map((n) => {
          const idx = sorted.findIndex((s) => s.id === n.id);
          if (idx !== -1) {
            return { ...n, y: Math.round((first.y + idx * step) / 12) * 12 };
          }
          return n;
        });
      }
      return prev;
    });
  };

  const handleBulkDelete = () => {
    if (selectedNodeIds.length === 0) return;
    saveToHistory();
    setNodes((prev) => {
      const collectAllChildren = (id: string, list: string[]) => {
        prev.forEach((n) => {
          if (n.parentId === id && !list.includes(n.id)) {
            list.push(n.id);
            collectAllChildren(n.id, list);
          }
        });
        return list;
      };
      
      const toRemove = [...selectedNodeIds];
      selectedNodeIds.forEach((id) => collectAllChildren(id, toRemove));
      
      return prev.filter((node) => !toRemove.includes(node.id));
    });
    setSelectedNodeIds([]);
  };

  const handleBulkDuplicate = () => {
    if (selectedNodeIds.length === 0) return;
    
    // Group of nodes
    const sourceNodes = nodes.filter((n) => selectedNodeIds.includes(n.id));
    const idSeed = Math.random().toString(36).substring(2, 7);
    const idMap: Record<string, string> = {};
    
    // Build new IDs for every duplicated node
    sourceNodes.forEach((n) => {
      idMap[n.id] = `${n.type}-${n.id.split('-')[1] || ''}-${idSeed}`;
    });
    
    const duplicated: CanvasNode[] = sourceNodes.map((n) => {
      const parentId = n.parentId && idMap[n.parentId] 
        ? idMap[n.parentId] 
        : (selectedNodeIds.includes(n.parentId || '') ? undefined : n.parentId);
        
      const isTopLevelInSelection = !n.parentId || !selectedNodeIds.includes(n.parentId);
      
      return {
        ...n,
        id: idMap[n.id],
        x: isTopLevelInSelection ? n.x + 36 : n.x,
        y: isTopLevelInSelection ? n.y + 36 : n.y,
        parentId,
        properties: JSON.parse(JSON.stringify(n.properties)),
      };
    });
    
    setNodes((prev) => [...prev, ...duplicated]);
    setSelectedNodeIds(duplicated.map((n) => n.id));
  };

  // Reorder children list leftward / upward
  const handleMoveUpInParent = (nodeId: string) => {
    setNodes((prev) => {
      const targetNode = prev.find((n) => n.id === nodeId);
      if (!targetNode || !targetNode.parentId) return prev;

      // Filter siblings nested under same parent
      const siblings = prev.filter((n) => n.parentId === targetNode.parentId);
      siblings.sort((a, b) => {
        if (Math.abs(a.y - b.y) < 25) return a.x - b.x;
        return a.y - b.y;
      });

      const idx = siblings.findIndex((s) => s.id === nodeId);
      if (idx <= 0) return prev; // Already at beginning

      // Swap elements in actual tree array representation
      const sisterA = siblings[idx];
      const sisterB = siblings[idx - 1];

      // Swap their coordinates slightly to preserve horizontal sorting heuristics
      const tempX = sisterA.x;
      const tempY = sisterA.y;
      
      const copy = prev.map((node) => {
        if (node.id === sisterA.id) {
          return { ...node, x: sisterB.x, y: sisterB.y };
        }
        if (node.id === sisterB.id) {
          return { ...node, x: tempX, y: tempY };
        }
        return node;
      });

      return copy;
    });
  };

  // Reorder children list rightward / downward
  const handleMoveDownInParent = (nodeId: string) => {
    setNodes((prev) => {
      const targetNode = prev.find((n) => n.id === nodeId);
      if (!targetNode || !targetNode.parentId) return prev;

      const siblings = prev.filter((n) => n.parentId === targetNode.parentId);
      siblings.sort((a, b) => {
        if (Math.abs(a.y - b.y) < 25) return a.x - b.x;
        return a.y - b.y;
      });

      const idx = siblings.findIndex((s) => s.id === nodeId);
      if (idx === -1 || idx >= siblings.length - 1) return prev; // Already end

      const sisterA = siblings[idx];
      const sisterB = siblings[idx + 1];

      const tempX = sisterA.x;
      const tempY = sisterA.y;

      const copy = prev.map((node) => {
        if (node.id === sisterA.id) {
          return { ...node, x: sisterB.x, y: sisterB.y };
        }
        if (node.id === sisterB.id) {
          return { ...node, x: tempX, y: tempY };
        }
        return node;
      });

      return copy;
    });
  };



  // Clean wipe grid
  const handleWipeAll = () => {
    if (nodes.length === 0) return;
    const confirmClear = confirm('⚠️ Reset Workspace: Are you absolutely sure you want to delete all elements on the canvas?');
    if (confirmClear) {
      saveToHistory();
      setNodes([]);
      setSelectedNodeIds([]);
    }
  };

  // Import canvas layout structure JSON schema
  const handleImportJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed) && parsed.every((n) => n.id && n.type)) {
        handleReplaceNodes(parsed);
        setViewport({ x: 100, y: 50, zoom: 0.8 });
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  // Drag listeners from LeftSidebar toolbox
  const handleDragStartItem = (type: ComponentType) => {
    setDraggedItemType(type);
  };

  const handleResetDraggedType = () => {
    setDraggedItemType(null);
  };

  const handleOnAddGeneratedNodes = (newNodes: CanvasNode[]) => {
    const idMap: Record<string, string> = {};
    const existingIds = new Set(nodes.map((n) => n.id));
    const usedIdsInBatch = new Set<string>();

    const processedNodes = newNodes.map((node) => {
      let newId = node.id;
      // If the ID is already taken by existing items, or was duplicated in this incoming batch
      if (existingIds.has(newId) || usedIdsInBatch.has(newId)) {
        const typePrefix = node.type;
        const randomSuffix = Math.random().toString(36).substring(2, 7);
        const idParts = node.id.split('-');
        const middle = idParts.slice(1, idParts.length > 2 ? -1 : undefined).join('-') || 'element';
        newId = `${typePrefix}-${middle}-${randomSuffix}`;
      }
      idMap[node.id] = newId;
      usedIdsInBatch.add(newId);

      return {
        ...node,
        id: newId,
      };
    });

    // Remap parentIds
    const finalNodes = processedNodes.map((node) => {
      const updatedParentId = node.parentId && idMap[node.parentId] ? idMap[node.parentId] : node.parentId;
      return {
        ...node,
        parentId: updatedParentId,
        properties: node.properties ? JSON.parse(JSON.stringify(node.properties)) : {},
      };
    });

    setNodes((prev) => [...prev, ...finalNodes]);
    setSelectedNodeIds(finalNodes.map((n) => n.id));
  };

  const handleReplaceNodes = (newNodes: CanvasNode[]) => {
    const idMap: Record<string, string> = {};
    const usedIdsInBatch = new Set<string>();

    const processedNodes = newNodes.map((node) => {
      let newId = node.id;
      // Check for internal duplicates within the replaced array
      if (usedIdsInBatch.has(newId)) {
        const typePrefix = node.type;
        const randomSuffix = Math.random().toString(36).substring(2, 7);
        const idParts = node.id.split('-');
        const middle = idParts.slice(1, idParts.length > 2 ? -1 : undefined).join('-') || 'element';
        newId = `${typePrefix}-${middle}-${randomSuffix}`;
      }
      idMap[node.id] = newId;
      usedIdsInBatch.add(newId);

      return {
        ...node,
        id: newId,
      };
    });

    // Remap parentIds
    const finalNodes = processedNodes.map((node) => {
      const updatedParentId = node.parentId && idMap[node.parentId] ? idMap[node.parentId] : node.parentId;
      return {
        ...node,
        parentId: updatedParentId,
        properties: node.properties ? JSON.parse(JSON.stringify(node.properties)) : {},
      };
    });

    setNodes(finalNodes);
    // Keep selection of nodes that exist or select none
    setSelectedNodeIds((prev) => prev.filter((id) => usedIdsInBatch.has(id)));
  };

  // Compile real-time export representations
  const compiledTSXCode = generateReactCode(nodes, theme);
  const currentHierarchyJSON = JSON.stringify(nodes, null, 2);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#fafafa] dark:bg-[#09090b] text-[#09090b] dark:text-[#fafafa] font-sans border-0 select-none">
      
      {/* Top Interactive HUD Bar */}
      <header className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-[#ffffff] dark:bg-[#09090b] px-4 flex items-center justify-between shrink-0 select-none z-50">
        
        {/* Branding */}
        <div className="flex items-center gap-6 select-none">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#09090b] dark:bg-white rounded flex items-center justify-center">
              <div className="w-3 h-3 bg-white dark:bg-black rounded-xs"></div>
            </div>
            <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-white">CanvasBuilder</span>
          </div>

          {/* Minimalist tab list as styled in the Sleek design theme */}
          <nav className="hidden sm:flex items-center gap-1 text-[11px] font-medium text-zinc-550 dark:text-zinc-400">
            <button 
              onClick={() => setMode('design')}
              className={`px-2.5 py-1 rounded cursor-pointer transition-all border-0 ${mode === 'design' ? 'bg-zinc-105 dark:bg-zinc-900 text-zinc-950 dark:text-white font-semibold' : 'hover:text-zinc-900 dark:hover:text-white bg-transparent'}`}
            >
              Design
            </button>
            <button 
              onClick={() => { setMode('play'); setSelectedNodeIds([]); }}
              className={`px-2.5 py-1 rounded cursor-pointer transition-all border-0 ${mode === 'play' ? 'bg-zinc-105 dark:bg-zinc-900 text-zinc-950 dark:text-white font-semibold' : 'hover:text-zinc-900 dark:hover:text-white bg-transparent'}`}
            >
              Prototype
            </button>
            <button 
              onClick={() => setIsExportOpen(true)}
              className="px-2.5 py-1 hover:text-zinc-900 dark:hover:text-white rounded cursor-pointer transition-all border-0 bg-transparent text-left"
            >
              Code
            </button>
          </nav>
        </div>

        {/* Global Toolbar Mode Actions */}
        <div className="flex items-center gap-2">
          
          {/* MODE TOGGLERS: Design vs Play Simulation */}
          <div className="flex items-center rounded-lg bg-zinc-100 dark:bg-zinc-900 p-0.5 gap-0.5 border border-zinc-200/50 dark:border-transparent select-none">
            <button
              onClick={() => setMode('design')}
              title="Design layout flow"
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold leading-none select-none transition-all flex items-center gap-1.5 cursor-pointer border-0 ${
                mode === 'design'
                  ? 'bg-white text-zinc-950 dark:bg-zinc-950 dark:text-white shadow-3xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 bg-transparent'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Layout Editor</span>
            </button>
            <button
              onClick={() => {
                setMode('play');
                setSelectedNodeIds([]); // Unfocus inspection on play
              }}
              title="Simulate active component click events"
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold leading-none select-none transition-all flex items-center gap-1.5 cursor-pointer border-0 ${
                mode === 'play'
                  ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-3xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 bg-transparent'
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Live Simulation</span>
            </button>
          </div>

          <div className="h-5 w-[1px] bg-zinc-200 dark:bg-zinc-800 mx-1 hidden md:block" />

          {/* Quick Action elements */}
          <button
            type="button"
            onClick={handleWipeAll}
            disabled={nodes.length === 0}
            className="h-9 px-3 py-1 border border-zinc-200 dark:border-zinc-800 hover:bg-red-500/10 hover:text-red-600 hover:border-red-500/20 bg-transparent text-[11px] font-bold text-zinc-500 dark:text-zinc-400 select-none cursor-pointer duration-150 flex items-center gap-1.5 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-zinc-450"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Grid</span>
          </button>

          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length === 0}
            className="h-9 px-3 py-1 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-850 bg-transparent text-[11px] font-bold text-zinc-500 dark:text-zinc-400 select-none cursor-pointer duration-150 flex items-center gap-1.5 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
            title="Undo last delete (Ctrl+Z)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Undo ({history.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="h-9 px-3.5 rounded bg-zinc-950 hover:bg-zinc-900 text-white dark:bg-white dark:text-black dark:hover:bg-zinc-100 text-[11px] font-bold select-none cursor-pointer flex items-center gap-1.5 shadow-xs border border-zinc-800 dark:border-transparent transition-all"
          >
            <FileCode className="w-3.5 h-3.5 text-current stroke-[2.5]" />
            <span>Developer Code</span>
          </button>

        </div>

      </header>

      {/* Main Workspace Frame structure */}
      <div className="flex-grow flex overflow-hidden min-h-0 relative">
        
        {/* LEFT COMPONENT TOOLBOX SIDEBAR (Design view only, hidden inside play preview) */}
        {mode === 'design' && (
          <div className="flex shrink-0 h-full relative z-20">
            {!leftSidebarCollapsed ? (
              <div className="relative flex h-full">
                <LeftSidebar
                  onAddNode={(type) => handleAddNode(type)}
                  onDragStartItem={handleDragStartItem}
                  nodesCount={nodes.length}
                />
                {/* Small floating collapse handle button overlaying the boundary */}
                <button
                  type="button"
                  onClick={() => setLeftSidebarCollapsed(true)}
                  className="absolute top-1/2 -translate-y-1/2 -right-3 w-6 h-12 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-r-md flex items-center justify-center shadow-xs cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors z-45 border-l-0"
                  title="Collapse toolbox"
                  id="collapse-toolbox-btn"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 rotate-180" />
                </button>
              </div>
            ) : (
              <div 
                className="w-11 border-r border-zinc-200 dark:border-zinc-800 bg-[#ffffff] dark:bg-[#09090b] flex flex-col items-center pt-4 shrink-0 relative transition-all duration-200 animate-in fade-in slide-in-from-left-4"
                id="collapsed-toolbox-indicator"
              >
                <button
                  type="button"
                  onClick={() => setLeftSidebarCollapsed(false)}
                  className="w-7 h-7 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 rounded-lg flex items-center justify-center shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all text-xs font-bold"
                  title="Expand toolbox"
                >
                  📦
                </button>
                <div className="h-full flex items-center justify-center select-none pt-12 text-center">
                  <span className="text-[9px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase leading-none transform -rotate-90 origin-center whitespace-nowrap">
                    SHADCN TOOLBOX
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* INFINITE DRAW PERSPECTIVE CANVAS */}
        <Canvas
          nodes={nodes}
          selectedNodeId={selectedNodeId}
          selectedNodeIds={selectedNodeIds}
          mode={mode}
          theme={theme}
          onUpdateTheme={handleUpdateTheme}
          viewport={viewport}
          activeTool={activeTool}
          onSelectNode={handleSelectNode}
          onSelectNodeIds={handleSelectNodeIds}
          onUpdateViewport={handleUpdateViewport}
          onUpdateNode={handleUpdateNode}
          onAddNode={handleAddNode}
          onDeleteNode={handleDeleteNode}
          onBulkDelete={handleBulkDelete}
          onDuplicateNode={handleDuplicateNode}
          onMoveUpInParent={handleMoveUpInParent}
          onMoveDownInParent={handleMoveDownInParent}
          onDetachFromParent={handleDetachFromParent}
          onSetActiveTool={(tool) => setActiveTool(tool)}
          onImportDraggedType={draggedItemType}
          onResetDraggedType={handleResetDraggedType}
          onAddGeneratedNodes={handleOnAddGeneratedNodes}
          onReplaceNodes={handleReplaceNodes}
          onUndo={handleUndo}
        />

        {/* RIGHT PROPERTY INSPECTOR PANEL (Design view only) */}
        {mode === 'design' && (
          <div className="flex shrink-0 h-full relative z-20">
            {!rightSidebarCollapsed ? (
              <div className="relative flex h-full">
                {/* Small floating collapse handle button overlaying the boundary */}
                <button
                  type="button"
                  onClick={() => setRightSidebarCollapsed(true)}
                  className="absolute top-1/2 -translate-y-1/2 -left-3 w-6 h-12 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-l-md flex items-center justify-center shadow-xs cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors z-45 border-r-0"
                  title="Collapse inspector"
                  id="collapse-inspector-btn"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                </button>
                <RightSidebar
                  selectedNode={nodes.find((n) => n.id === selectedNodeId) || null}
                  selectedNodeIds={selectedNodeIds}
                  onSelectNodeIds={setSelectedNodeIds}
                  onBulkAlign={handleBulkAlign}
                  onBulkDelete={handleBulkDelete}
                  onBulkDuplicate={handleBulkDuplicate}
                  allNodes={nodes}
                  theme={theme}
                  onUpdateTheme={handleUpdateTheme}
                  onUpdateNode={handleUpdateNode}
                  onDeleteNode={handleDeleteNode}
                  onDuplicateNode={handleDuplicateNode}
                  onMoveUpInParent={handleMoveUpInParent}
                  onMoveDownInParent={handleMoveDownInParent}
                  onDetachFromParent={handleDetachFromParent}
                />
              </div>
            ) : (
              <div 
                className="w-11 border-l border-zinc-200 dark:border-zinc-800 bg-[#ffffff] dark:bg-[#09090b] flex flex-col items-center pt-4 shrink-0 relative transition-all duration-200 animate-in fade-in slide-in-from-right-4"
                id="collapsed-inspector-indicator"
              >
                <button
                  type="button"
                  onClick={() => setRightSidebarCollapsed(false)}
                  className="w-7 h-7 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 rounded-lg flex items-center justify-center shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all text-xs font-bold"
                  title="Expand inspector"
                >
                  ⚙️
                </button>
                <div className="h-full flex items-center justify-center select-none pt-12 text-center">
                  <span className="text-[9px] font-bold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase leading-none transform rotate-90 origin-center whitespace-nowrap">
                    INSPECTOR PANEL
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* REACT JSX/JSON EXPORTER COMPILATION PORTAL */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        compiledCode={compiledTSXCode}
        onImportJSON={handleImportJSON}
        currentHierarchyJSON={currentHierarchyJSON}
      />

    </div>
  );
}
