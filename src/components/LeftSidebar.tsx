/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TOOL_ITEMS, LAYOUT_TEMPLATES } from '../componentsData';
import { ComponentType, ToolItem } from '../types';
import { Search, Sparkles, BookOpen, Layers, Plus, Compass } from 'lucide-react';

interface LeftSidebarProps {
  onAddNode: (type: ComponentType) => void;
  onLoadTemplate: (name: string) => void;
  onDragStartItem: (type: ComponentType) => void;
  nodesCount: number;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  onAddNode,
  onLoadTemplate,
  onDragStartItem,
  nodesCount,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCatalog, setActiveCatalog] = useState<'components' | 'templates'>('components');

  // Filter components based on search query
  const filteredItems = TOOL_ITEMS.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Group filtered items by category
  const categories = ['Elements', 'Overlays', 'Layout Shells'] as const;

  return (
    <div className="w-80 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] flex flex-col h-full shrink-0 relative select-none text-left">
      
      {/* Sidebar header */}
      <div className="p-4 border-b border-zinc-150 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/20 text-left">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-6 w-6 rounded bg-[#09090b] dark:bg-white flex items-center justify-center text-xs font-black text-white dark:text-zinc-950 shrink-0 select-none shadow">
            📦
          </div>
          <h2 className="text-xs font-bold tracking-widest text-[#09090b] dark:text-zinc-400 uppercase leading-none">
            Shadcn Toolbox
          </h2>
        </div>
        <p className="text-[11px] text-zinc-500 font-medium leading-normal">
          Drag components directly onto the grid, or click <b>"Add to Center"</b> to instantly place elements inside your viewport.
        </p>
      </div>

      {/* Catalog / Templates Mode toggles */}
      <div className="flex border-b border-zinc-150 dark:border-zinc-900 p-1 bg-zinc-50/30 dark:bg-zinc-950/40 gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => { setActiveCatalog('components'); setSearchQuery(''); }}
          className={`flex-1 py-1.5 text-[11px] font-bold rounded-md select-none transition-all cursor-pointer flex items-center justify-center gap-1.5 border-0 bg-transparent ${
            activeCatalog === 'components'
              ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-350 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Components ({TOOL_ITEMS.length})</span>
        </button>
        
        <button
          type="button"
          onClick={() => { setActiveCatalog('templates'); setSearchQuery(''); }}
          className={`flex-1 py-1.5 text-[11px] font-bold rounded-md select-none transition-all cursor-pointer flex items-center justify-center gap-1.5 border-0 bg-transparent ${
            activeCatalog === 'templates'
              ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-350 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/40'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-550" />
          <span>Templates</span>
        </button>
      </div>

      {/* Primary search element */}
      {activeCatalog === 'components' && (
        <div className="p-3 border-b border-zinc-150 dark:border-zinc-900 shrink-0 bg-zinc-50/10 dark:bg-zinc-900/10">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400 stroke-[2.5]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search components (e.g. Card, Button)..."
              className="w-full h-9 pl-9 pr-4 text-xs bg-zinc-100 border border-transparent hover:border-zinc-300 dark:bg-zinc-900 rounded-lg focus-visible:outline-none focus:border-zinc-400 dark:focus:border-zinc-800 transition-all text-[#09090b] dark:text-[#fafafa]"
            />
          </div>
        </div>
      )}

      {/* Catalog listing container */}
      <div className="flex-grow overflow-y-auto p-4 space-y-5 min-h-0">
        
        {activeCatalog === 'components' ? (
          categories.map((cat) => {
            const itemsInCat = filteredItems.filter((i) => i.category === cat);
            if (itemsInCat.length === 0) return null;

            return (
              <div key={cat} className="space-y-2.5 text-left">
                <div className="flex items-center gap-1.5 border-b border-zinc-150 dark:border-zinc-900 pb-1.5">
                  <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 tracking-widest uppercase">
                    {cat}
                  </span>
                  <span className="text-[10px] bg-zinc-100 dark:bg-zinc-850 text-zinc-650 dark:text-zinc-400 font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {itemsInCat.length}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2 border-0 bg-transparent">
                  {itemsInCat.map((item) => (
                    <div
                      key={item.type}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', item.type);
                        e.dataTransfer.effectAllowed = 'copy';
                        onDragStartItem(item.type);
                      }}
                      className="group p-3 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 bg-white dark:bg-zinc-900/40 rounded-lg shadow-3xs cursor-grab active:cursor-grabbing transition-all flex flex-col items-start relative select-none"
                    >
                      {/* Grid overlay coordinates decoration */}
                      <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 group-hover:bg-zinc-400 dark:group-hover:bg-zinc-200 transition-colors" />

                      <div className="w-full flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-1 mb-1.5">
                        <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">
                          {item.name}
                        </span>
                        
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddNode(item.type);
                          }}
                          title="Instant compile to center"
                          className="px-1.5 py-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer border border-transparent transition-colors bg-transparent"
                        >
                          Add +
                        </button>
                      </div>

                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 leading-relaxed font-semibold self-stretch">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        ) : (
          <div className="space-y-4 text-left border-0 bg-transparent">
            <div className="flex items-center gap-1.5 border-b border-zinc-150 dark:border-zinc-900 pb-2">
              <Compass className="w-4 h-4 text-zinc-400" />
              <span className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase">
                Featured Grid Layouts
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3.5 border-0 bg-transparent">
              {LAYOUT_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.name}
                  className="p-4 border border-zinc-250 dark:border-zinc-800 bg-white hover:bg-zinc-50/50 dark:bg-zinc-900/10 hover:border-zinc-400 dark:hover:border-zinc-650 rounded-lg shadow-3xs hover:shadow-xs transition-all relative flex flex-col justify-between"
                >
                  <div className="space-y-1 mb-4 select-none">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-zinc-850 dark:text-white uppercase tracking-tight">
                        {tpl.name}
                      </span>
                      <span className="text-[9px] bg-zinc-50 dark:bg-zinc-950/20 text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 px-1.5 py-0.5 rounded leading-none font-bold">
                        {tpl.category}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-zinc-400 dark:text-zinc-500 leading-normal font-medium">
                      {tpl.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onLoadTemplate(tpl.name)}
                    className="w-full text-center py-2 text-xs font-bold bg-zinc-900 hover:bg-zinc-850 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100/90 rounded-md shadow-3xs cursor-pointer active:scale-95 transition-all border-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Instantly Build Layout</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeCatalog === 'components' && filteredItems.length === 0 && (
          <div className="py-12 text-center text-zinc-450 text-xs">
            No matching Shadcn elements found.
          </div>
        )}

      </div>

      {/* Sidebar Footer count metrics */}
      <div className="p-3 bg-zinc-50/55 dark:bg-zinc-950/55 border-t border-zinc-150 dark:border-zinc-900 text-center shrink-0">
        <span className="text-[10px] font-semibold text-zinc-450 dark:text-zinc-500">
          COMPILER ACTIVE · <b>{nodesCount}</b> COMPONENT NODES ON GRID
        </span>
      </div>

    </div>
  );
};
