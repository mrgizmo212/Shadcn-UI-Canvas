/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TOOL_ITEMS } from '../componentsData';
import { ComponentType } from '../types';
import { Search, Layers, ChevronDown, ChevronRight } from 'lucide-react';

interface LeftSidebarProps {
  onAddNode: (type: ComponentType) => void;
  onDragStartItem: (type: ComponentType) => void;
  nodesCount: number;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  onAddNode,
  onDragStartItem,
  nodesCount,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({
    'Elements': false,
    'Overlays': false,
    'Layout Shells': false,
  });

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

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

      {/* Primary search element */}
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

      {/* Catalog listing container */}
      <div className="flex-grow overflow-y-auto p-4 space-y-5 min-h-0">
        
        {categories.map((cat) => {
          const itemsInCat = filteredItems.filter((i) => i.category === cat);
          if (itemsInCat.length === 0) return null;
          const isCollapsed = collapsedCategories[cat];

          return (
            <div key={cat} className="space-y-2.5 text-left">
              <div 
                onClick={() => toggleCategory(cat)}
                className="flex items-center justify-between border-b border-zinc-150 dark:border-zinc-900 pb-1.5 cursor-pointer hover:opacity-80 active:scale-99 transition-all select-none group"
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-zinc-450 dark:text-zinc-500 tracking-widest uppercase group-hover:text-zinc-600 dark:group-hover:text-zinc-350 transition-colors">
                    {cat}
                  </span>
                  <span className="text-[10px] bg-zinc-100 dark:bg-zinc-850 text-zinc-650 dark:text-zinc-400 font-bold px-1.5 py-0.5 rounded-full leading-none">
                    {itemsInCat.length}
                  </span>
                </div>
                {isCollapsed ? (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-350 transition-colors" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-350 transition-colors" />
                )}
              </div>

              {!isCollapsed && (
                <div className="grid grid-cols-1 gap-2 border-0 bg-transparent animate-in fade-in duration-200">
                  {itemsInCat.map((item) => (
                    <div
                      key={item.type}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', item.type);
                        e.dataTransfer.effectAllowed = 'copy';
                        onDragStartItem(item.type);
                      }}
                      className="group p-3 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-650 bg-white dark:bg-zinc-900/40 rounded-lg shadow-3xs cursor-grab active:cursor-grabbing transition-all flex flex-col items-start relative select-none"
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
                          className="px-1.5 py-0.5 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[10px] font-bold text-zinc-650 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer border border-transparent transition-colors bg-transparent"
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
              )}
            </div>
          );
        })}

        {filteredItems.length === 0 && (
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
