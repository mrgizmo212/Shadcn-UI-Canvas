/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CanvasNode, ThemeSettings, BaseColor, RadiusOption } from '../types';
import { 
  Settings, 
  Trash2, 
  Copy, 
  Sun, 
  Moon, 
  Layers, 
  Grid, 
  Link, 
  Unlink, 
  ArrowUp, 
  ArrowDown 
} from 'lucide-react';

interface RightSidebarProps {
  selectedNode: CanvasNode | null;
  selectedNodeIds?: string[];
  onSelectNodeIds?: (ids: string[]) => void;
  onBulkAlign?: (alignment: 'left' | 'right' | 'top' | 'bottom' | 'distribute-h' | 'distribute-v') => void;
  onBulkDelete?: () => void;
  onBulkDuplicate?: () => void;
  allNodes: CanvasNode[];
  theme: ThemeSettings;
  onUpdateTheme: (theme: Partial<ThemeSettings>) => void;
  onUpdateNode: (nodeId: string, updates: Partial<CanvasNode>) => void;
  onDeleteNode: (nodeId: string) => void;
  onDuplicateNode: (nodeId: string) => void;
  onMoveUpInParent?: (nodeId: string) => void;
  onMoveDownInParent?: (nodeId: string) => void;
  onDetachFromParent?: (nodeId: string) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  selectedNode,
  selectedNodeIds,
  onSelectNodeIds,
  onBulkAlign,
  onBulkDelete,
  onBulkDuplicate,
  allNodes,
  theme,
  onUpdateTheme,
  onUpdateNode,
  onDeleteNode,
  onDuplicateNode,
  onMoveUpInParent,
  onMoveDownInParent,
  onDetachFromParent,
}) => {
  // Extract custom properties
  const props = selectedNode?.properties || {};

  const handlePropertyChange = (key: string, value: any) => {
    if (!selectedNode) return;
    const updatedProps = { ...selectedNode.properties, [key]: value };
    onUpdateNode(selectedNode.id, { properties: updatedProps });
  };

  const handleDimensionChange = (key: 'x' | 'y' | 'width' | 'height', value: number) => {
    if (!selectedNode) return;
    onUpdateNode(selectedNode.id, { [key]: value });
  };

  // List of other items that can act as containers for manual nesting selector
  const containerNodes = allNodes.filter(
    (n) => n.id !== selectedNode?.id && 
    (n.type === 'card' || n.type === 'flexRow' || n.type === 'flexCol' || n.type === 'gridShell')
  );

  const handleNestNode = (parentId: string) => {
    if (!selectedNode) return;
    if (parentId === '') {
      onDetachFromParent?.(selectedNode.id);
    } else {
      onUpdateNode(selectedNode.id, { parentId });
    }
  };

  return (
    <div className="w-80 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] flex flex-col h-full shrink-0 relative select-none text-left">
      
      {/* Sidebar header */}
      <div className="p-4 border-b border-zinc-150 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/20 text-left shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-4 h-4 text-zinc-500 dark:text-zinc-400 animate-spin-slow" />
          <h2 className="text-xs font-bold tracking-widest text-[#09090b] dark:text-zinc-400 uppercase leading-none">
            {selectedNodeIds && selectedNodeIds.length > 1 
              ? 'MULTI-SELECT PANEL' 
              : selectedNode 
              ? 'PROPERTIES PANEL' 
              : 'GLOBAL SETTINGS'
            }
          </h2>
        </div>
        <p className="text-[11px] text-zinc-500 font-medium leading-normal">
          {selectedNodeIds && selectedNodeIds.length > 1 
            ? `Configure or coordinate your selection of ${selectedNodeIds.length} components.`
            : selectedNode 
            ? `Configure parameters of your selected [${selectedNode.type}] element.` 
            : 'Configure layout themes, border spacing, and workspace parameters.'
          }
        </p>
      </div>

      {/* Primary inspect dashboard body */}
      <div className="flex-grow overflow-y-auto p-4 space-y-5 min-h-0">
        
        {selectedNodeIds && selectedNodeIds.length > 1 ? (
          <div className="space-y-5">
            {/* BULK ACTIONS / SELECTION SUMMARY */}
            <div className="bg-zinc-55/40 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/80 p-3 rounded-lg space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-500">
                  Current Selection
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 rounded-full">
                  {selectedNodeIds.length} items
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onBulkDuplicate?.()}
                  className="py-1.5 px-3 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-[11px] font-bold hover:bg-zinc-50 dark:hover:bg-zinc-950 text-zinc-700 dark:text-zinc-300 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Copy className="w-3 h-3" />
                  <span>Duplicate</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => onBulkDelete?.()}
                  className="py-1.5 px-3 rounded bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 text-[11px] font-bold hover:bg-red-100/50 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-red-200/50 dark:border-red-900/40"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => onSelectNodeIds?.([])}
                className="w-full py-1.5 rounded text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 text-[10px] font-bold text-center border-0 bg-transparent cursor-pointer transition-all uppercase tracking-wider"
              >
                Deselect selection cluster
              </button>
            </div>

            {/* ALIGNMENT ENGINE PLATFORM */}
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-400 dark:text-zinc-500">
                Bulk Alignment Tools
              </span>
              <p className="text-[11px] text-zinc-450 dark:text-zinc-500 leading-normal">
                Instantly align or distribute coordinate boundaries of your selected elements in 12px grid snaps.
              </p>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onBulkAlign?.('left')}
                  className="py-2.5 px-2.5 rounded border border-zinc-200 dark:border-zinc-805 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 text-left text-[11px] font-medium text-zinc-750 dark:text-zinc-300 cursor-pointer transition-all"
                >
                  <div className="font-bold text-zinc-900 dark:text-white text-[11px] mb-0.5">Align Left</div>
                  <div className="text-[9px] text-zinc-400 leading-tight">Snap X coordinates to furthest left element</div>
                </button>

                <button
                  type="button"
                  onClick={() => onBulkAlign?.('right')}
                  className="py-2.5 px-2.5 rounded border border-zinc-200 dark:border-zinc-805 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 text-left text-[11px] font-medium text-zinc-750 dark:text-zinc-300 cursor-pointer transition-all"
                >
                  <div className="font-bold text-zinc-900 dark:text-white text-[11px] mb-0.5">Align Right</div>
                  <div className="text-[9px] text-zinc-400 leading-tight">Snap X coordinates to furthest right edge</div>
                </button>

                <button
                  type="button"
                  onClick={() => onBulkAlign?.('top')}
                  className="py-2.5 px-2.5 rounded border border-zinc-200 dark:border-zinc-805 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 text-left text-[11px] font-medium text-zinc-755 dark:text-zinc-300 cursor-pointer transition-all"
                >
                  <div className="font-bold text-zinc-900 dark:text-white text-[11px] mb-0.5">Align Top</div>
                  <div className="text-[9px] text-zinc-400 leading-tight">Snap Y coordinates to furthest top element</div>
                </button>

                <button
                  type="button"
                  onClick={() => onBulkAlign?.('bottom')}
                  className="py-2.5 px-2.5 rounded border border-zinc-200 dark:border-zinc-805 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 text-left text-[11px] font-medium text-zinc-755 dark:text-zinc-300 cursor-pointer transition-all"
                >
                  <div className="font-bold text-zinc-900 dark:text-white text-[11px] mb-0.5">Align Bottom</div>
                  <div className="text-[9px] text-zinc-400 leading-tight">Snap Y coordinates to furthest bottom edge</div>
                </button>
              </div>

              <div className="h-[1px] bg-zinc-100 dark:bg-zinc-900 my-1" />

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => onBulkAlign?.('distribute-h')}
                  className="w-full py-2 px-3 rounded border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 text-left text-[11px] font-semibold text-zinc-750 dark:text-zinc-300 cursor-pointer transition-all flex items-center justify-between"
                >
                  <span>Distribute Horizontally</span>
                  <span className="text-[9px] text-zinc-400 font-normal">Equal gaps along X axis</span>
                </button>

                <button
                  type="button"
                  onClick={() => onBulkAlign?.('distribute-v')}
                  className="w-full py-2 px-3 rounded border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900 text-left text-[11px] font-semibold text-zinc-750 dark:text-zinc-300 cursor-pointer transition-all flex items-center justify-between"
                >
                  <span>Distribute Vertically</span>
                  <span className="text-[9px] text-zinc-400 font-normal">Equal gaps along Y axis</span>
                </button>
              </div>
            </div>

            {/* QUICK SELECTION MEMBERS LIST */}
            <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#09090b] dark:text-zinc-400">
                Selected Components
              </span>
              <div className="max-h-56 overflow-y-auto border border-zinc-200 dark:border-zinc-900 rounded bg-zinc-50/50 dark:bg-zinc-950/20 divide-y divide-zinc-150 dark:divide-zinc-900">
                {allNodes.filter(n => selectedNodeIds.includes(n.id)).map(n => (
                  <div key={n.id} className="p-2 flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-250 truncate block mr-2">
                      [{n.type}] - {n.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectNodeIds?.(selectedNodeIds.filter(id => id !== n.id))}
                      className="px-1.5 py-0.5 rounded text-[9px] font-mono text-zinc-450 hover:bg-zinc-200 dark:hover:bg-zinc-850 border-0 bg-transparent cursor-pointer transition-all"
                    >
                      Deselect
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : selectedNode ? (
          <div className="space-y-4">
            
            {/* Standard actions toolbar duplication/delete */}
            <div className="grid grid-cols-2 gap-2 border-b border-slate-50 dark:border-slate-900 pb-3">
              <button
                type="button"
                onClick={() => onDuplicateNode(selectedNode.id)}
                className="py-1.5 px-3 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold hover:bg-slate-50 text-slate-700 dark:text-slate-350 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicate</span>
              </button>
              
              <button
                type="button"
                onClick={() => onDeleteNode(selectedNode.id)}
                className="py-1.5 px-3 rounded bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-950/40 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-red-200/50 dark:border-red-900/40"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>

            {/* NESTING MANAGER */}
            <div className="space-y-2 border-b border-slate-50 dark:border-slate-900 pb-3">
              <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 tracking-wider uppercase select-none">
                Layout nesting alignment
              </span>

              {selectedNode.parentId ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[11px] font-semibold text-amber-600 bg-amber-500/5 px-2.5 py-1.5 rounded border border-amber-500/20">
                    <span className="truncate">Nested under ID: {selectedNode.parentId}</span>
                    <button
                      onClick={() => onDetachFromParent?.(selectedNode.id)}
                      title="Detach from parent"
                      className="p-1 hover:bg-amber-500/10 text-amber-700 rounded cursor-pointer"
                    >
                      <Unlink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  {/* Order control */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => onMoveUpInParent?.(selectedNode.id)}
                      className="py-1 px-2 border border-slate-250 dark:border-slate-800 text-[10.5px] font-semibold rounded flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                      <span>Move item left/up</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveDownInParent?.(selectedNode.id)}
                      className="py-1 px-2 border border-slate-250 dark:border-slate-800 text-[10.5px] font-semibold rounded flex items-center justify-center gap-1 cursor-pointer active:scale-95"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                      <span>Move item right/down</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 select-none pb-0.5">
                    <Link className="w-3.5 h-3.5" />
                    <span>Assign component to layer slot:</span>
                  </div>
                  <select
                    value={selectedNode.parentId || ''}
                    onChange={(e) => handleNestNode(e.target.value)}
                    className="w-full text-xs h-9 border border-slate-280 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-md px-2 focus-visible:outline-none focus:border-slate-400 font-medium"
                  >
                    <option value="">Freestanding (Moves freely on canvas)</option>
                    {containerNodes.map((n) => {
                      let typeLabel = '';
                      switch (n.type) {
                        case 'flexRow':
                          typeLabel = 'Horizontal Row';
                          break;
                        case 'flexCol':
                          typeLabel = 'Vertical Column';
                          break;
                        case 'gridShell':
                          typeLabel = 'Grid Layout';
                          break;
                        case 'card':
                          typeLabel = 'Card Panel';
                          break;
                        default:
                          typeLabel = n.type;
                      }
                      
                      const nameSnippet = n.properties.title 
                        ? `"${n.properties.title}"` 
                        : `unnamed (ID: ${n.id.substring(0, 5)})`;
                        
                      return (
                        <option key={n.id} value={n.id}>
                          Move into: {typeLabel} — {nameSnippet}
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}
            </div>

            {/* DIMENSIONS CONTROLS (Only for freestanding absolute layouts) */}
            {!selectedNode.parentId && (
              <div className="space-y-2 border-b border-slate-50 dark:border-slate-900 pb-3">
                <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 tracking-wider uppercase select-none">
                  Absolute coordinates (px)
                </span>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">X offset</label>
                    <input
                      type="number"
                      value={selectedNode.x}
                      onChange={(e) => handleDimensionChange('x', Number(e.target.value))}
                      className="w-full h-8 px-2 bg-slate-50 dark:bg-slate-900 border border-transparent hover:border-slate-300 dark:hover:border-slate-800 rounded focus:border-slate-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Y offset</label>
                    <input
                      type="number"
                      value={selectedNode.y}
                      onChange={(e) => handleDimensionChange('y', Number(e.target.value))}
                      className="w-full h-8 px-2 bg-slate-50 dark:bg-slate-900 border border-transparent hover:border-slate-300 dark:hover:border-slate-800 rounded focus:border-slate-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Width</label>
                    <input
                      type="number"
                      value={selectedNode.width || 0}
                      onChange={(e) => handleDimensionChange('width', Number(e.target.value))}
                      className="w-full h-8 px-2 bg-slate-50 dark:bg-slate-900 border border-transparent hover:border-slate-300 dark:hover:border-slate-800 rounded focus:border-slate-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase">Height</label>
                    <input
                      type="number"
                      value={selectedNode.height || 0}
                      onChange={(e) => handleDimensionChange('height', Number(e.target.value))}
                      className="w-full h-8 px-2 bg-slate-50 dark:bg-slate-900 border border-transparent hover:border-slate-300 dark:hover:border-slate-800 rounded focus:border-slate-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* BRAND CUSTOM STYLING OVERRIDES */}
            <div className="space-y-3.5 border-b border-slate-100 dark:border-slate-900 pb-4 pt-1">
              <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 tracking-wider uppercase select-none flex items-center justify-between">
                <span>Color & style overrides</span>
                <span className="text-[9px] bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 font-bold px-1.5 py-0.5 rounded leading-none">Canvas overrides</span>
              </span>

              <div className="space-y-3">
                {/* Background color */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-450 flex items-center justify-between">
                    <span>Background frame color</span>
                    <span className="font-mono text-[9px] text-zinc-400">bgColor</span>
                  </label>
                  <select
                    value={props.bgColor || ''}
                    onChange={(e) => handlePropertyChange('bgColor', e.target.value)}
                    className="w-full text-xs h-9 border border-slate-200 dark:border-slate-800 px-2 rounded-lg bg-white dark:bg-slate-900 focus:border-slate-400 focus:outline-none"
                    id="bgColor-picker"
                  >
                    <option value="">Default theme-governed frame</option>
                    <option value="white">Solid White panel</option>
                    <option value="zinc">Cool Zinc frame (Soft-border)</option>
                    <option value="slate">Slate Gray tone (Soft-border)</option>
                    <option value="neutral">Warm Neutral frame (Soft-border)</option>
                    <option value="stone">Warm Stone frame (Soft-border)</option>
                    <option value="red">Cherry Red warning glow</option>
                    <option value="green">Emerald Green success glow</option>
                    <option value="blue">Celestial Blue information info</option>
                    <option value="yellow">Golden Amber warning alert</option>
                    <option value="purple">Cosmic Purple accent brand</option>
                    <option value="orange">Mandarin Orange warm glow</option>
                    <option value="teal">Minty Teal high-contrast</option>
                    <option value="zincActive">Deep Solid Dark/Light inverse</option>
                    <option value="indigoActive">Electric Indigo solid active</option>
                  </select>
                </div>

                {/* Text Color overrides */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-450 flex items-center justify-between">
                    <span>Forefront Text Color</span>
                    <span className="font-mono text-[9px] text-zinc-400">textColor</span>
                  </label>
                  <select
                    value={props.textColor || ''}
                    onChange={(e) => handlePropertyChange('textColor', e.target.value)}
                    className="w-full text-xs h-9 border border-slate-200 dark:border-slate-800 px-2 rounded-lg bg-white dark:bg-slate-900 focus:border-slate-400 focus:outline-none"
                    id="textColor-picker"
                  >
                    <option value="">Default theme text coloring</option>
                    <option value="dark">Standard High-contrast (Deep Charcoal/White)</option>
                    <option value="zinc">Subtle Slate-gray indicator</option>
                    <option value="red">Warning Alert Red Text</option>
                    <option value="green">Success Emerald Green Text</option>
                    <option value="blue">Information Royal Blue Text</option>
                    <option value="yellow">Bright Amber Highlights Text</option>
                    <option value="purple">Deep Royal Purple Typography</option>
                    <option value="orange">Spicy Mandarin Orange Text</option>
                    <option value="pink">Hot Magenta Pink Accent</option>
                    <option value="teal">Clean Mint Teal type text</option>
                    <option value="white">Forced Pure White</option>
                  </select>
                </div>

                {/* Custom arbitrary Tailwind classes */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-450 flex items-center justify-between">
                    <span>Custom Tailwind utilities</span>
                    <span className="font-mono text-[9px] text-zinc-400">customClass</span>
                  </label>
                  <input
                    type="text"
                    value={props.customClass || ''}
                    onChange={(e) => handlePropertyChange('customClass', e.target.value)}
                    placeholder="e.g. shadow-lg border-2 border-dashed border-sky-400 animate-pulse duration-1000 p-6 rotate-1 font-sans"
                    className="w-full h-9 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-slate-400 focus:outline-none font-mono"
                    id="customClass-input"
                  />
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Try entering standard styles (e.g. scale, duration, rotation, padding, flex elements, or shadow filters).
                  </p>
                </div>
              </div>
            </div>

            {/* COMPONENT SPECIFIC DYNAMIC PARAMETERS */}
            <div className="space-y-3.5">
              <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 tracking-wider uppercase select-none">
                Element Parameters
              </span>

              {/* Text, Label & Title field (Applicable to almost all elements) */}
              {(props.label !== undefined || props.title !== undefined) && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">
                    {props.title !== undefined ? 'Header Title' : 'Button Name Label'}
                  </label>
                  <input
                    type="text"
                    value={props.title !== undefined ? props.title : props.label}
                    onChange={(e) => handlePropertyChange(props.title !== undefined ? 'title' : 'label', e.target.value)}
                    className="w-full h-9 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-xs"
                  />
                </div>
              )}

              {/* Subtext description (Cards, Alerts) */}
              {props.description !== undefined && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Description details</label>
                  <textarea
                    value={props.description}
                    onChange={(e) => handlePropertyChange('description', e.target.value)}
                    rows={2}
                    className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-lg text-xs"
                  />
                </div>
              )}

              {/* Dynamic properties based on type */}
              {selectedNode.type === 'button' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Style Variant</label>
                    <select
                      value={props.variant || 'default'}
                      onChange={(e) => handlePropertyChange('variant', e.target.value)}
                      className="w-full text-xs h-9 border border-slate-200 dark:border-slate-850 px-2 rounded-lg"
                    >
                      <option value="default">Default theme (Primary)</option>
                      <option value="secondary">Secondary layout</option>
                      <option value="outline">Outline border</option>
                      <option value="ghost">Ghost hover flat</option>
                      <option value="destructive">Destructive (Red)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Component Size</label>
                    <select
                      value={props.size || 'default'}
                      onChange={(e) => handlePropertyChange('size', e.target.value)}
                      className="w-full text-xs h-9 border border-slate-200 dark:border-slate-850 px-2 rounded-lg"
                    >
                      <option value="sm">Small size</option>
                      <option value="default">Normal size</option>
                      <option value="lg">Large stretch</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2 py-0.5 select-none">
                    <input
                      type="checkbox"
                      id="btn-disabled-toggle"
                      checked={props.disabled || false}
                      onChange={(e) => handlePropertyChange('disabled', e.target.checked)}
                      className="h-4.5 w-4.5 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="btn-disabled-toggle" className="text-xs font-semibold text-slate-600 dark:text-slate-350 cursor-pointer">
                      Disable action button
                    </label>
                  </div>
                </>
              )}

              {selectedNode.type === 'input' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Placeholder text</label>
                    <input
                      type="text"
                      value={props.placeholder || ''}
                      onChange={(e) => handlePropertyChange('placeholder', e.target.value)}
                      className="w-full h-9 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Input Category</label>
                    <select
                      value={props.type || 'text'}
                      onChange={(e) => handlePropertyChange('type', e.target.value)}
                      className="w-full text-xs h-9 border border-slate-200 dark:border-slate-850 px-2 rounded-lg"
                    >
                      <option value="text">Standard Text</option>
                      <option value="email">Email input</option>
                      <option value="password">Password parameters</option>
                      <option value="number">Quantitative numeric</option>
                    </select>
                  </div>
                </>
              )}

              {selectedNode.type === 'textarea' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Placeholder text</label>
                  <input
                    type="text"
                    value={props.placeholder || ''}
                    onChange={(e) => handlePropertyChange('placeholder', e.target.value)}
                    className="w-full h-9 border border-slate-200 dark:border-slate-850 px-3 py-1.5 rounded-lg text-xs"
                  />
                </div>
              )}

              {selectedNode.type === 'badge' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Badge variant</label>
                  <select
                    value={props.variant || 'default'}
                    onChange={(e) => handlePropertyChange('variant', e.target.value)}
                    className="w-full text-xs h-9 border border-slate-205 dark:border-slate-850 px-2 rounded-lg"
                  >
                    <option value="default">Default Primary</option>
                    <option value="secondary">Secondary background</option>
                    <option value="outline">Thin border outline</option>
                    <option value="destructive">Destructive Error</option>
                  </select>
                </div>
              )}

              {selectedNode.type === 'slider' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Default value</label>
                    <input
                      type="number"
                      value={props.value || 50}
                      onChange={(e) => handlePropertyChange('value', Number(e.target.value))}
                      className="w-full h-9 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-450">Min value</label>
                      <input
                        type="number"
                        value={props.min || 0}
                        onChange={(e) => handlePropertyChange('min', Number(e.target.value))}
                        className="w-full h-8 border border-slate-200 px-2 rounded"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-450">Max value</label>
                      <input
                        type="number"
                        value={props.max || 100}
                        onChange={(e) => handlePropertyChange('max', Number(e.target.value))}
                        className="w-full h-8 border border-slate-200 px-2 rounded"
                      />
                    </div>
                  </div>
                </>
              )}

              {(selectedNode.type === 'switch' || selectedNode.type === 'checkbox') && (
                <div className="flex items-center space-x-2 py-1 select-none">
                  <input
                    type="checkbox"
                    id="prop-checked-toggle"
                    checked={props.checked || false}
                    onChange={(e) => handlePropertyChange('checked', e.target.checked)}
                    className="h-4.5 w-4.5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="prop-checked-toggle" className="text-xs font-semibold text-slate-600 dark:text-slate-350 cursor-pointer">
                    Selected/Checked default
                  </label>
                </div>
              )}

              {(selectedNode.type === 'radioGroup' || selectedNode.type === 'select') && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Options listing (comma separated)</label>
                    <input
                      type="text"
                      value={props.options || ''}
                      onChange={(e) => handlePropertyChange('options', e.target.value)}
                      className="w-full h-9 border border-slate-200 dark:border-slate-850 px-3 py-1.5 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Default Selected Option</label>
                    <input
                      type="text"
                      value={props.selected || ''}
                      onChange={(e) => handlePropertyChange('selected', e.target.value)}
                      className="w-full h-9 border border-slate-200 dark:border-slate-850 px-3 py-1.5 rounded-lg text-xs"
                    />
                  </div>
                </>
              )}

              {selectedNode.type === 'avatar' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Image source Url</label>
                    <input
                      type="text"
                      value={props.src || ''}
                      onChange={(e) => handlePropertyChange('src', e.target.value)}
                      className="w-full h-9 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono truncate"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Initials placeholder</label>
                    <input
                      type="text"
                      maxLength={3}
                      value={props.fallback || 'CN'}
                      onChange={(e) => handlePropertyChange('fallback', e.target.value)}
                      className="w-full h-9 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Avatar scaling size</label>
                    <select
                      value={props.size || 'md'}
                      onChange={(e) => handlePropertyChange('size', e.target.value)}
                      className="w-full text-xs h-9 border border-slate-200 px-2 rounded-lg"
                    >
                      <option value="sm">Small (32px)</option>
                      <option value="md">Medium (40px)</option>
                      <option value="lg">Large (56px)</option>
                    </select>
                  </div>
                </>
              )}

              {selectedNode.type === 'progress' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Progress level (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={props.value || 60}
                    onChange={(e) => handlePropertyChange('value', Number(e.target.value))}
                    className="w-full h-9 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-xs"
                  />
                </div>
              )}

              {selectedNode.type === 'skeleton' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Placeholder display style</label>
                  <select
                    value={props.type || 'card'}
                    onChange={(e) => handlePropertyChange('type', e.target.value)}
                    className="w-full text-xs h-9 border border-slate-200 px-2 rounded-lg"
                  >
                    <option value="line">Thin horizontal line</option>
                    <option value="circle">Circular profile widget</option>
                    <option value="card">Large rectangular card asset</option>
                  </select>
                </div>
              )}

              {selectedNode.type === 'separator' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Divider alignment</label>
                  <select
                    value={props.orientation || 'horizontal'}
                    onChange={(e) => handlePropertyChange('orientation', e.target.value)}
                    className="w-full text-xs h-9 border border-slate-200 px-2 rounded-lg"
                  >
                    <option value="horizontal">Horizontal line</option>
                    <option value="vertical">Vertical spacer</option>
                  </select>
                </div>
              )}

              {selectedNode.type === 'label' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Label Caption text</label>
                  <input
                    type="text"
                    value={props.text || ''}
                    onChange={(e) => handlePropertyChange('text', e.target.value)}
                    className="w-full h-9 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-xs"
                  />
                </div>
              )}

              {selectedNode.type === 'alert' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Visual Warning style</label>
                  <select
                    value={props.variant || 'default'}
                    onChange={(e) => handlePropertyChange('variant', e.target.value)}
                    className="w-full text-xs h-9 border border-slate-200 dark:border-slate-855 px-2 rounded-lg"
                  >
                    <option value="default">Information banner</option>
                    <option value="destructive">Attention Warning (Red alert)</option>
                  </select>
                </div>
              )}

              {selectedNode.type === 'card' && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center space-x-2 py-1 select-none">
                    <input
                      type="checkbox"
                      id="card-footer-toggle"
                      checked={props.showFooter || false}
                      onChange={(e) => handlePropertyChange('showFooter', e.target.checked)}
                      className="h-4.5 w-4.5 rounded text-indigo-600"
                    />
                    <label htmlFor="card-footer-toggle" className="text-xs font-semibold text-slate-600 dark:text-slate-350 cursor-pointer">
                      Display card footer bar
                    </label>
                  </div>
                  
                  {props.showFooter && (
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Footer note text</label>
                      <input
                        type="text"
                        value={props.footerText || ''}
                        onChange={(e) => handlePropertyChange('footerText', e.target.value)}
                        className="w-full h-9 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-xs"
                      />
                    </div>
                  )}
                </div>
              )}

              {selectedNode.type === 'table' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Table headers (comma divided)</label>
                    <input
                      type="text"
                      value={props.headers || ''}
                      onChange={(e) => handlePropertyChange('headers', e.target.value)}
                      className="w-full h-9 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-450 font-mono">Row matrix (cells split with commas, rows with pipes |)</label>
                    <textarea
                      value={props.rows || ''}
                      onChange={(e) => handlePropertyChange('rows', e.target.value)}
                      rows={4}
                      className="w-full border border-slate-200 dark:border-slate-800 p-2 text-xs font-mono"
                    />
                  </div>
                </>
              )}

              {selectedNode.type === 'accordion' && (
                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Collapsible detail summary content</label>
                    <textarea
                      value={props.content || ''}
                      onChange={(e) => handlePropertyChange('content', e.target.value)}
                      rows={3}
                      className="w-full border border-slate-200 dark:border-slate-800 p-2 text-xs"
                    />
                  </div>
                  <div className="flex items-center space-x-2 py-0.5 select-none">
                    <input
                      type="checkbox"
                      id="accordion-expanded-prop"
                      checked={props.isExpanded || false}
                      onChange={(e) => handlePropertyChange('isExpanded', e.target.checked)}
                      className="h-4.5 w-4.5 rounded text-indigo-600"
                    />
                    <label htmlFor="accordion-expanded-prop" className="text-xs font-semibold text-slate-650 cursor-pointer select-none">
                      Expand element by default
                    </label>
                  </div>
                </div>
              )}

              {selectedNode.type === 'tabs' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Tab navigation options (comma divided)</label>
                    <input
                      type="text"
                      value={props.headers || ''}
                      onChange={(e) => handlePropertyChange('headers', e.target.value)}
                      className="w-full h-9 border border-slate-200 dark:border-slate-850 px-3 py-1.5 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Tab description block content</label>
                    <textarea
                      value={props.content || ''}
                      onChange={(e) => handlePropertyChange('content', e.target.value)}
                      rows={3}
                      className="w-full border border-slate-200 dark:border-slate-800 p-2.5 text-xs"
                    />
                  </div>
                </>
              )}

              {selectedNode.type === 'dialog' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Modal description statement</label>
                    <textarea
                      value={props.description || ''}
                      onChange={(e) => handlePropertyChange('description', e.target.value)}
                      rows={3}
                      className="w-full border border-slate-200 dark:border-slate-800 p-2 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Close button label</label>
                      <input
                        type="text"
                        value={props.cancelLabel || 'Close'}
                        onChange={(e) => handlePropertyChange('cancelLabel', e.target.value)}
                        className="w-full h-8 border border-slate-200 px-2 rounded"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Confirm button label</label>
                      <input
                        type="text"
                        value={props.confirmLabel || 'Proceed'}
                        onChange={(e) => handlePropertyChange('confirmLabel', e.target.value)}
                        className="w-full h-8 border border-slate-200 px-2 rounded"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 py-1 select-none">
                    <input
                      type="checkbox"
                      id="diag-isopen-toggle"
                      checked={props.isOpen || false}
                      onChange={(e) => handlePropertyChange('isOpen', e.target.checked)}
                      className="h-4.5 w-4.5 rounded text-indigo-650"
                    />
                    <label htmlFor="diag-isopen-toggle" className="text-xs font-semibold text-slate-700 cursor-pointer">
                      Pop-up Active overlay (Simulate Dialog)
                    </label>
                  </div>
                </>
              )}

              {selectedNode.type === 'sheet' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Slideout sidebar context</label>
                    <textarea
                      value={props.description || ''}
                      onChange={(e) => handlePropertyChange('description', e.target.value)}
                      rows={3}
                      className="w-full border border-slate-200 dark:border-slate-855 p-2 text-xs"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Slideout alignment edge</label>
                    <select
                      value={props.side || 'right'}
                      onChange={(e) => handlePropertyChange('side', e.target.value)}
                      className="w-full h-9 border border-slate-200 text-xs px-2 rounded-lg"
                    >
                      <option value="right">Slide from Right side edge</option>
                      <option value="left">Slide from Left side edge</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2 py-1 select-none">
                    <input
                      type="checkbox"
                      id="sheet-isopen-toggle"
                      checked={props.isOpen || false}
                      onChange={(e) => handlePropertyChange('isOpen', e.target.checked)}
                      className="h-4.5 w-4.5 rounded text-indigo-650"
                    />
                    <label htmlFor="sheet-isopen-toggle" className="text-xs font-semibold text-slate-700 cursor-pointer">
                      Trigger Slide-out Drawer overlay
                    </label>
                  </div>
                </>
              )}

              {/* Flex, Layout configurations */}
              {selectedNode.type === 'flexRow' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Element spacing Column gap</label>
                    <select
                      value={props.gap || '4'}
                      onChange={(e) => handlePropertyChange('gap', e.target.value)}
                      className="w-full text-xs h-9 border border-slate-200 px-2 rounded-lg"
                    >
                      <option value="2">Minimal gaps (8px)</option>
                      <option value="4">Standard gaps (16px)</option>
                      <option value="6">Comfortable gaps (24px)</option>
                      <option value="8">Extra-spacious gaps (32px)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Vertical aligned orientation</label>
                    <select
                      value={props.align || 'center'}
                      onChange={(e) => handlePropertyChange('align', e.target.value)}
                      className="w-full text-xs h-9 border border-slate-200 px-2 rounded-lg"
                    >
                      <option value="start">Align starting edge (Top)</option>
                      <option value="center">Align vertical centers</option>
                      <option value="end">Align trailing edge (Bottom)</option>
                      <option value="stretch">Fill height slots</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Horizontal distributed flow</label>
                    <select
                      value={props.justify || 'between'}
                      onChange={(e) => handlePropertyChange('justify', e.target.value)}
                      className="w-full text-xs h-9 border border-slate-200 px-2 rounded-lg"
                    >
                      <option value="start">Pack to left end</option>
                      <option value="center">Center item stack</option>
                      <option value="end">Pack to right end</option>
                      <option value="between">Spread evenly between</option>
                      <option value="around">Spread padding around</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Frame Internal Padding</label>
                    <select
                      value={props.padding || '4'}
                      onChange={(e) => handlePropertyChange('padding', e.target.value)}
                      className="w-full text-xs h-9 border border-slate-200 px-2 rounded-lg"
                    >
                      <option value="0">No cushion (0px)</option>
                      <option value="2">Thin border spacing (8px)</option>
                      <option value="4">Standard border padding (16px)</option>
                      <option value="6">Comfy cushion margin (24px)</option>
                    </select>
                  </div>
                </>
              )}

              {selectedNode.type === 'flexCol' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Element spacing Row gap</label>
                    <select
                      value={props.gap || '4'}
                      onChange={(e) => handlePropertyChange('gap', e.target.value)}
                      className="w-full text-xs h-9 border border-slate-200 px-2 rounded-lg"
                    >
                      <option value="2">Minimal gaps (8px)</option>
                      <option value="4">Standard gaps (16px)</option>
                      <option value="6">Comfortable gaps (24px)</option>
                      <option value="8">Extra-spacious gaps (32px)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Horizontal aligned orientation</label>
                    <select
                      value={props.align || 'stretch'}
                      onChange={(e) => handlePropertyChange('align', e.target.value)}
                      className="w-full text-xs h-9 border border-slate-200 px-2 rounded-lg"
                    >
                      <option value="start">Align starting edge (Left)</option>
                      <option value="center">Align horizontal centers</option>
                      <option value="end">Align trailing edge (Right)</option>
                      <option value="stretch">Fill width stretch parameters</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Frame Internal Padding</label>
                    <select
                      value={props.padding || '4'}
                      onChange={(e) => handlePropertyChange('padding', e.target.value)}
                      className="w-full text-xs h-9 border border-slate-200 px-2 rounded-lg"
                    >
                      <option value="0">No cushion (0px)</option>
                      <option value="2">Thin border spacing (8px)</option>
                      <option value="4">Standard border padding (16px)</option>
                      <option value="6">Comfy cushion margin (24px)</option>
                    </select>
                  </div>
                </>
              )}

              {selectedNode.type === 'gridShell' && (
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Grid column count</label>
                    <select
                      value={props.columns || '3'}
                      onChange={(e) => handlePropertyChange('columns', e.target.value)}
                      className="w-full text-xs h-9 border border-slate-200 px-2 rounded-lg"
                    >
                      <option value="1">1 Single Column</option>
                      <option value="2">2 Columns layout</option>
                      <option value="3">3 Columns grid structure</option>
                      <option value="4">4 Columns dense grid matrix</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Grid flow layout gaps</label>
                    <select
                      value={props.gap || '4'}
                      onChange={(e) => handlePropertyChange('gap', e.target.value)}
                      className="w-full text-xs h-9 border border-slate-200 px-2 rounded-lg"
                    >
                      <option value="2">Compact gaps (8px)</option>
                      <option value="4">Standard spacing (16px)</option>
                      <option value="6">Comfortable spacing (24px)</option>
                      <option value="8">Extra-capacious (32px)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-450">Inner padding</label>
                    <select
                      value={props.padding || '0'}
                      onChange={(e) => handlePropertyChange('padding', e.target.value)}
                      className="w-full text-xs h-9 border border-slate-200 px-2 rounded-lg"
                    >
                      <option value="0">No padding (0px, Default)</option>
                      <option value="2">Thin border bounds (8px)</option>
                      <option value="4">Standard cushion gap (16px)</option>
                    </select>
                  </div>
                </>
              )}

            </div>
          </div>
        ) : (
          <div className="space-y-5 text-left">
            
            {/* Visual Base Color Theme selection presets */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 tracking-wider uppercase select-none">
                Base color theme
              </span>
              
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {(['zinc', 'slate', 'neutral', 'stone'] as BaseColor[]).map((col) => {
                  const isActive = theme.baseColor === col;
                  const labelMap: Record<BaseColor, string> = {
                    zinc: ' Zinc Tone',
                    slate: ' Slate Cool',
                    neutral: ' Neutral Gray',
                    stone: ' Stone Warm',
                  };
 
                  return (
                    <button
                      key={col}
                      type="button"
                      onClick={() => onUpdateTheme({ baseColor: col })}
                      className={`h-9 px-3 rounded border text-left font-bold flex items-center justify-between cursor-pointer transition-all active:scale-[0.98] ${
                        isActive
                          ? 'border-zinc-950 bg-zinc-50 text-zinc-950 dark:border-white dark:bg-white/10 dark:text-white'
                          : 'border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-650 dark:text-zinc-400'
                      }`}
                    >
                      <span className="capitalize">{labelMap[col]}</span>
                      {isActive && <div className="h-1.5 w-1.5 rounded-full bg-zinc-950 dark:bg-white" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* LIGHT AND DARK TOGGLER BUTTONS */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 tracking-wider uppercase select-none">
                Perspective theme mode
              </span>
              
              <div className="grid grid-cols-2 gap-1 p-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-900/50">
                <button
                  type="button"
                  onClick={() => onUpdateTheme({ darkMode: false })}
                  className={`py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1.5 select-none transition-all cursor-pointer border-0 ${
                    !theme.darkMode
                      ? 'bg-white text-zinc-950 shadow-3xs'
                      : 'text-zinc-450 hover:text-zinc-200 bg-transparent'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Bright Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateTheme({ darkMode: true })}
                  className={`py-1.5 rounded text-xs font-bold flex items-center justify-center gap-1.5 select-none transition-all cursor-pointer border-0 ${
                    theme.darkMode
                      ? 'bg-zinc-950 text-white shadow-3xs'
                      : 'text-zinc-500 hover:text-zinc-800 bg-transparent'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-zinc-450" />
                  <span>Ambient Dark</span>
                </button>
              </div>
            </div>

            {/* RADII OPTIONS PRESETS */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 tracking-wider uppercase select-none">
                Border Radius scaling curves
              </span>

              <div className="flex flex-wrap gap-1.5 select-none text-[10px] font-bold">
                {(['none', 'sm', 'md', 'lg', 'full'] as RadiusOption[]).map((rad) => {
                  const isActive = theme.radius === rad;
                  return (
                    <button
                      key={rad}
                      type="button"
                      onClick={() => onUpdateTheme({ radius: rad })}
                      className={`h-8 px-3 rounded border select-none cursor-pointer transition-all active:scale-[0.96] uppercase font-bold ${
                        isActive
                          ? 'border-zinc-950 bg-zinc-50 text-zinc-950 dark:border-white dark:bg-white/10 dark:text-white'
                          : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 text-zinc-650 dark:text-zinc-400 bg-transparent'
                      }`}
                    >
                      {rad}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* EMPTY STATE INDICATOR BOX */}
            <div className="p-4 bg-slate-50/50 dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5 text-slate-400 dark:text-slate-500 select-none text-center">
              <span className="text-xl">💡</span>
              <p className="text-[10.5px] leading-normal font-medium max-w-[200px] mx-auto">
                No element is highlighted. Click any node on the infinite canvas to begin tuning its specific configuration parameters.
              </p>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
