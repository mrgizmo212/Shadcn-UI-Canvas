/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CanvasNode, ThemeSettings } from './types';

function indent(spaces: number): string {
  return ' '.repeat(spaces);
}

// Map radius options to Tailwind rounded style strings
function getRadiusClass(radius: string): string {
  switch (radius) {
    case 'none':
      return 'rounded-none';
    case 'sm':
      return 'rounded-sm';
    case 'md':
      return 'rounded-md';
    case 'lg':
      return 'rounded-lg';
    case 'full':
      return 'rounded-full';
    default:
      return 'rounded-md';
  }
}

export function generateReactCode(
  nodes: CanvasNode[],
  theme: ThemeSettings
): string {
  // 1. Separate roots from children
  const topLevels = nodes.filter((n) => !n.parentId);
  
  // Create a mapping of parent ID -> sorted children (by coordinates or ID to keep stable layout)
  const childrenMap: Record<string, CanvasNode[]> = {};
  nodes.forEach((node) => {
    if (node.parentId) {
      if (!childrenMap[node.parentId]) {
        childrenMap[node.parentId] = [];
      }
      childrenMap[node.parentId].push(node);
    }
  });

  // Sort children by X coordinate inside rows, zoom direction, or visual order
  Object.keys(childrenMap).forEach((parentId) => {
    childrenMap[parentId].sort((a, b) => {
      // Sort primarily by Y, then X for grid-like flows
      if (Math.abs(a.y - b.y) < 20) {
        return a.x - b.x;
      }
      return a.y - b.y;
    });
  });

  // Sort top levels visually (top-down, left-to-right)
  topLevels.sort((a, b) => {
    if (Math.abs(a.y - b.y) < 40) {
      return a.x - b.x;
    }
    return a.y - b.y;
  });

  const radius = getRadiusClass(theme.radius);

  // Generate component tree code recursively
  function renderNodeJSX(node: CanvasNode, spaces: number): string {
    const spaceInd = indent(spaces);
    const props = node.properties;
    const subNodes = childrenMap[node.id] || [];

    switch (node.type) {
      case 'button': {
        let variantClass = 'bg-slate-900 text-white hover:bg-slate-800';
        if (theme.darkMode) {
          variantClass = 'bg-white text-slate-950 hover:bg-slate-100';
        }
        
        if (props.variant === 'secondary') {
          variantClass = 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100';
        } else if (props.variant === 'outline') {
          variantClass = 'border border-slate-200 bg-transparent text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-100 dark:hover:bg-slate-800';
        } else if (props.variant === 'ghost') {
          variantClass = 'hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100 text-slate-700';
        } else if (props.variant === 'destructive') {
          variantClass = 'bg-red-500 text-white hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800';
        }

        let sizeClass = 'h-9 px-4 py-2 text-sm';
        if (props.size === 'sm') {
          sizeClass = 'h-8 px-3 text-xs';
        } else if (props.size === 'lg') {
          sizeClass = 'h-10 px-8 text-base';
        }

        return `${spaceInd}<button\n${spaceInd}  className="inline-flex items-center justify-center font-medium ${radius} transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 disabled:pointer-events-none disabled:opacity-50 ${variantClass} ${sizeClass}"\n${spaceInd}  ${props.disabled ? 'disabled' : ''}\n${spaceInd}>\n${spaceInd}  ${props.label || 'Button'}\n${spaceInd}</button>`;
      }

      case 'input': {
        return `${spaceInd}<div className="grid w-full items-center gap-1.5">\n${spaceInd}  <label className="text-xs font-medium leading-none text-slate-500">${props.label || 'Input Label'}</label>\n${spaceInd}  <input\n${spaceInd}    type="${props.type || 'text'}"\n${spaceInd}    placeholder="${props.placeholder || 'Enter value...'}"\n${spaceInd}    className="flex h-9 w-full ${radius} border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 dark:border-slate-800 dark:placeholder:text-slate-500"\n${spaceInd}  />\n${spaceInd}</div>`;
      }

      case 'textarea': {
        return `${spaceInd}<div className="grid w-full gap-1.5">\n${spaceInd}  <label className="text-xs font-medium leading-none text-slate-500">${props.label || 'Textarea Label'}</label>\n${spaceInd}  <textarea\n${spaceInd}    placeholder="${props.placeholder || 'Type description...'}"\n${spaceInd}    className="flex min-h-[60px] w-full ${radius} border border-slate-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 dark:border-slate-800 dark:placeholder:text-slate-500"\n${spaceInd}  />\n${spaceInd}</div>`;
      }

      case 'badge': {
        let variantClass = 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900';
        if (props.variant === 'secondary') {
          variantClass = 'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100';
        } else if (props.variant === 'outline') {
          variantClass = 'border border-slate-200 text-slate-900 dark:border-slate-800 dark:text-slate-100';
        } else if (props.variant === 'destructive') {
          variantClass = 'bg-red-500 text-white hover:bg-red-600 dark:bg-red-700 dark:text-red-100';
        }

        return `${spaceInd}<span className="inline-flex items-center rounded-all px-2.5 py-0.5 text-xs font-semibold select-none border transition-colors ${radius} ${variantClass}">\n${spaceInd}  ${props.label || 'Badge'}\n${spaceInd}</span>`;
      }

      case 'switch': {
        return `${spaceInd}<div className="flex items-center space-x-2">\n${spaceInd}  <button\n${spaceInd}    role="switch"\n${spaceInd}    aria-checked="${props.checked ? 'true' : 'false'}"\n${spaceInd}    className="inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${props.checked ? 'bg-slate-900 dark:bg-slate-100' : 'bg-slate-200 dark:bg-slate-800'}"\n${spaceInd}  >\n${spaceInd}    <span className="pointer-events-none block h-4 w-4 rounded-full bg-white dark:bg-slate-950 shadow-lg ring-0 transition-transform ${props.checked ? 'translate-x-4' : 'translate-x-0'}" />\n${spaceInd}  </button>\n${spaceInd}  <span className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300">${props.label || 'Toggle'}</span>\n${spaceInd}</div>`;
      }

      case 'slider': {
        const percent = props.value !== undefined ? props.value : 50;
        return `${spaceInd}<div className="grid w-full gap-2">\n${spaceInd}  <div className="flex justify-between text-xs font-medium text-slate-500">\n${spaceInd}    <span>${props.label || 'Label'}</span>\n${spaceInd}    <span>${percent}%</span>\n${spaceInd}  </div>\n${spaceInd}  <div className="relative flex w-full touch-none select-none items-center h-5 cursor-pointer">\n${spaceInd}    <div className="relative h-1.5 w-full grow rounded-full bg-slate-150 dark:bg-slate-800">\n${spaceInd}      <div className="absolute h-full rounded-full bg-slate-900 dark:bg-slate-100" style={{ width: '${percent}%' }} />\n${spaceInd}    </div>\n${spaceInd}    <div className="absolute h-4 w-4 rounded-full border border-slate-900 dark:border-slate-100 bg-white shadow-lg transition-transform focus-visible:outline-none" style={{ left: 'calc(${percent}% - 8px)' }} />\n${spaceInd}  </div>\n${spaceInd}</div>`;
      }

      case 'checkbox': {
        return `${spaceInd}<div className="flex items-center space-x-2">\n${spaceInd}  <div className="peer h-4 w-4 shrink-0 rounded-sm border border-slate-300 dark:border-slate-700 flex items-center justify-center cursor-pointer ${props.checked ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-950' : 'bg-transparent'}">\n${spaceInd}    {${props.checked ? 'true' : 'false'} && (\n${spaceInd}      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3">\n${spaceInd}        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />\n${spaceInd}      </svg>\n${spaceInd}    )}\n${spaceInd}  </div>\n${spaceInd}  <label className="text-sm font-medium leading-none text-slate-700 dark:text-slate-300 cursor-pointer">\n${spaceInd}    ${props.label || 'Option checkbox'}\n${spaceInd}  </label>\n${spaceInd}</div>`;
      }

      case 'radioGroup': {
        const opts = (props.options || 'Item A, Item B')
          .split(',')
          .map((o: string) => o.trim());
        const selected = props.selected || opts[0];
        
        return `${spaceInd}<div className="grid gap-2">\n${spaceInd}  <span className="text-sm font-medium text-slate-500">${props.label || 'Options'}</span>\n${spaceInd}  <div className="grid gap-2">\n${opts
          .map(
            (o: string) =>
              `${spaceInd}    <label className="flex items-center space-x-2 text-sm text-slate-700 dark:text-slate-300 cursor-pointer">\n${spaceInd}      <div className="h-4 w-4 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center ${
                selected === o ? 'border-slate-900 dark:border-slate-100' : ''
              }">\n${spaceInd}        ${
                selected === o
                  ? `<div className="h-1.5 w-1.5 rounded-full bg-slate-900 dark:bg-slate-100" />`
                  : ''
              }\n${spaceInd}      </div>\n${spaceInd}      <span>${o}</span>\n${spaceInd}    </label>`
          )
          .join('\n')}\n${spaceInd}  </div>\n${spaceInd}</div>`;
      }

      case 'label': {
        return `${spaceInd}<h4 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-white uppercase">${props.text || 'Label'}</h4>`;
      }

      case 'select': {
        return `${spaceInd}<div className="grid w-full gap-1.5">\n${spaceInd}  <label className="text-xs font-medium leading-none text-slate-500">${props.label || 'Dropdown'}</label>\n${spaceInd}  <div className="flex h-9 w-full items-center justify-between border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-sm shadow-sm ${radius}">\n${spaceInd}    <span className="text-slate-700 dark:text-slate-300">${props.selected || 'Choose option...'}</span>\n${spaceInd}    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-500">\n${spaceInd}      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />\n${spaceInd}    </svg>\n${spaceInd}  </div>\n${spaceInd}</div>`;
      }

      case 'avatar': {
        let sizepx = 'h-10 w-10';
        if (props.size === 'sm') sizepx = 'h-8 w-8';
        else if (props.size === 'lg') sizepx = 'h-14 w-14';

        return `${spaceInd}<div className="relative flex shrink-0 overflow-hidden rounded-full ${sizepx}">\n${spaceInd}  <img\n${spaceInd}    src="${props.src || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200'}"\n${spaceInd}    alt="Avatar"\n${spaceInd}    referrerPolicy="no-referrer"\n${spaceInd}    className="aspect-square h-full w-full object-cover"\n${spaceInd}  />\n${spaceInd}</div>`;
      }

      case 'progress': {
        const val = props.value !== undefined ? props.value : 60;
        return `${spaceInd}<div className="grid w-full gap-1 p-0.5">\n${spaceInd}  <div className="flex justify-between text-xs text-slate-500 font-medium">\n${spaceInd}    <span>${props.label || 'Progress'}</span>\n${spaceInd}    <span>${val}%</span>\n${spaceInd}  </div>\n${spaceInd}  <div className="w-full h-2 rounded bg-slate-100 dark:bg-slate-800 overflow-hidden">\n${spaceInd}    <div className="h-full bg-slate-900 dark:bg-slate-100 rounded transition-all" style={{ width: '${val}%' }} />\n${spaceInd}  </div>\n${spaceInd}</div>`;
      }

      case 'skeleton': {
        let layoutClass = 'h-6 w-full';
        if (props.type === 'circle') {
          layoutClass = 'h-12 w-12 rounded-full';
        } else if (props.type === 'card') {
          layoutClass = 'h-24 w-full rounded';
        }
        return `${spaceInd}<div className="animate-pulse bg-slate-200 dark:bg-slate-800 ${layoutClass}" />`;
      }

      case 'separator': {
        const isVer = props.orientation === 'vertical';
        return `${spaceInd}<div className="${isVer ? 'h-full w-[1px] min-h-[40px]' : 'h-[1px] w-full'} bg-slate-200 dark:bg-slate-800" />`;
      }

      case 'alert': {
        const isDestructive = props.variant === 'destructive';
        const colorClass = isDestructive 
          ? 'border-red-500/50 text-red-600 dark:text-red-500 bg-red-50/20' 
          : 'border-slate-200 text-slate-900 dark:border-slate-800 dark:text-slate-100';

        return `${spaceInd}<div className="relative w-full border ${radius} p-4 [&>svg~*]:pl-7 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground ${colorClass}">\n${spaceInd}  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">\n${spaceInd}    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />\n${spaceInd}  </svg>\n${spaceInd}  <h5 className="mb-1 font-medium leading-none tracking-tight">${props.title || 'Notification Log'}</h5>\n${spaceInd}  <div className="text-xs opacity-90 leading-relaxed">${props.description || 'Log update body details.'}</div>\n${spaceInd}</div>`;
      }

      case 'card': {
        const nestedChildrenHTML = subNodes
          .map((c) => renderNodeJSX(c, spaces + 4))
          .join('\n\n');

        return `${spaceInd}<div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-950 dark:text-slate-50 shadow-sm ${radius}">\n${spaceInd}  <div className="flex flex-col space-y-1.5 p-6">\n${spaceInd}    <h3 className="font-semibold leading-none tracking-tight text-lg text-slate-900 dark:text-white">${props.title || 'Card Title'}</h3>\n${spaceInd}    <p className="text-xs text-slate-500">${props.description || 'Description info.'}</p>\n${spaceInd}  </div>\n${spaceInd}  <div className="p-6 pt-0 space-y-4">\n${nestedChildrenHTML || `${spaceInd}    {/* Custom Drop Items */}`}\n${spaceInd}  </div>\n${props.showFooter ? `\n${spaceInd}  <div className="flex items-center p-6 pt-0 border-t border-slate-100 dark:border-slate-900 text-xs text-slate-500 mt-2">\n${spaceInd}    ${props.footerText || 'Footer feedback details.'}\n${spaceInd}  </div>` : ''}\n${spaceInd}</div>`;
      }

      case 'calendar': {
        return `${spaceInd}<div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 ${radius} shadow-sm w-fit">\n${spaceInd}  <div className="flex items-center justify-between mb-4">\n${spaceInd}    <button className="h-7 w-7 border border-slate-200 dark:border-slate-800 rounded bg-transparent p-0 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-900"><b>&lt;</b></button>\n${spaceInd}    <span className="text-sm font-semibold select-none">May 2026</span>\n${spaceInd}    <button className="h-7 w-7 border border-slate-200 dark:border-slate-800 rounded bg-transparent p-0 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-900"><b>&gt;</b></button>\n${spaceInd}  </div>\n${spaceInd}  <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500 mb-2">\n${spaceInd}    <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>\n${spaceInd}  </div>\n${spaceInd}  <div className="grid grid-cols-7 gap-1 text-xs text-center">\n${spaceInd}    {/* Calendar simulated matrix grid */}\n${spaceInd}    <span className="p-1 px-1.5 text-slate-400">26</span><span className="p-1 px-1.5 text-slate-400">27</span><span className="p-1 px-1.5 text-slate-400">28</span><span className="p-1 px-1.5 text-slate-400">29</span><span className="p-1 px-1.5 text-slate-400">30</span><span className="p-1 p-1 pb-1 text-slate-900 dark:text-white font-medium">1</span><span className="p-1">2</span>\n${spaceInd}    <span className="p-1">3</span><span className="p-1">4</span><span className="p-1">5</span><span className="p-1">6</span><span className="p-1">7</span><span className="p-1">8</span><span className="p-1">9</span>\n${spaceInd}    <span className="p-1">10</span><span className="p-1">11</span><span className="p-1">12</span><span className="p-1">13</span><span className="p-1">14</span><span className="p-1 font-semibold border border-slate-900 dark:border-slate-100 ${radius}">20</span><span className="p-1">21</span>\n${spaceInd}    <span className="p-1">22</span><span className="p-1">23</span><span className="p-1 overflow-hidden">24</span><span className="p-1">25</span><span className="p-1">26</span><span className="p-1">27</span><span className="p-1">28</span>\n${spaceInd}    <span className="p-1">29</span><span className="p-1">30</span><span className="p-1">31</span><span className="p-1 text-slate-400">1</span><span className="p-1 text-slate-400">2</span><span className="p-1 text-slate-400">3</span><span className="p-1 text-slate-400">4</span>\n${spaceInd}  </div>\n${spaceInd}</div>`;
      }

      case 'table': {
        const headers = (props.headers || 'Name, Role, Status')
          .split(',')
          .map((h: string) => h.trim());
        const rawRows = props.rows || '';
        const rowsList = rawRows
          .split('|')
          .filter((line: string) => line.trim())
          .map((line: string) => {
            return line.split(',').map((cell: string) => cell.trim());
          });

        return `${spaceInd}<div className="w-full overflow-auto border border-slate-200 dark:border-slate-800 ${radius} shadow-sm bg-white dark:bg-slate-950">\n${spaceInd}  <div className="p-4 border-b border-slate-150 dark:border-slate-900">\n${spaceInd}    <h4 className="font-semibold text-sm text-slate-900 dark:text-white">${props.title || 'Data List'}</h4>\n${spaceInd}  </div>\n${spaceInd}  <table className="w-full caption-bottom text-xs">\n${spaceInd}    <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">\n${spaceInd}      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">\n${headers
          .map(
            (h) =>
              `${spaceInd}        <th className="h-10 px-4 text-left align-middle font-medium text-slate-500">${h}</th>`
          )
          .join('\n')}\n${spaceInd}      </tr>\n${spaceInd}    </thead>\n${spaceInd}    <tbody className="[&_tr:last-child]:border-0">\n${rowsList
          .map(
            (row) =>
              `${spaceInd}      <tr className="border-b border-slate-200 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-900/20">\n${row
                .map(
                  (cell) =>
                    `${spaceInd}        <td className="p-4 align-middle font-medium">${cell}</td>`
                )
                .join('\n')}\n${spaceInd}      </tr>`
          )
          .join('\n')}\n${spaceInd}    </tbody>\n${spaceInd}  </table>\n${spaceInd}</div>`;
      }

      case 'accordion': {
        return `${spaceInd}<div className="border-b border-slate-200 dark:border-slate-800 py-3">\n${spaceInd}  <button className="flex w-full items-center justify-between text-sm font-medium transition-all hover:underline py-1.5 text-left text-slate-900 dark:text-white">\n${spaceInd}    <span>${props.title || 'Accordion SectionTitle'}</span>\n${spaceInd}    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-slate-500 transform transition-transform ${props.isExpanded ? 'rotate-180' : ''}">\n${spaceInd}      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />\n${spaceInd}    </svg>\n${spaceInd}  </button>\n${spaceInd}  {${props.isExpanded ? 'true' : 'false'} && (\n${spaceInd}    <div className="pt-2 pb-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400 transition-all font-normal">\n${spaceInd}      ${props.content || 'Content specifications body.'}\n${spaceInd}    </div>\n${spaceInd}  )}\n${spaceInd}</div>`;
      }

      case 'tabs': {
        const tabs = (props.headers || 'Account, Password')
          .split(',')
          .map((t: string) => t.trim());
        const selected = props.selectedTab || tabs[0];
        
        return `${spaceInd}<div className="w-full space-y-2">\n${spaceInd}  <div className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900 p-1 text-slate-500 w-full md:w-auto">\n${tabs
          .map(
            (tab) =>
              `${spaceInd}    <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                selected === tab
                  ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-950 dark:text-white'
                  : 'hover:text-slate-900 dark:hover:text-slate-100'
              }">\n${spaceInd}      ${tab}\n${spaceInd}    </button>`
          )
          .join('\n')}\n${spaceInd}  </div>\n${spaceInd}  <div className="mt-2 border border-slate-200 dark:border-slate-800 p-4 ${radius} bg-white dark:bg-slate-950">\n${spaceInd}    <p className="text-xs text-slate-600 dark:text-slate-400 capitalize-first">${props.content || 'Tabs contextual guidelines.'}</p>\n${spaceInd}  </div>\n${spaceInd}</div>`;
      }

      case 'dialog': {
        if (!props.isOpen) {
          return `${spaceInd}{/* Accorded Dialog Trigger mock code. Set isOpen=true in state to view modal overlay */}\n${spaceInd}<div className="border border-dashed border-slate-200 dark:border-slate-800 p-4 ${radius} text-center text-xs text-slate-500">\n${spaceInd}  <span>Dialog modal: <b>${props.title || 'Sure?'}</b> (Hidden default. Simulated click trigger toggle)</span>\n${spaceInd}</div>`;
        }
        return `${spaceInd}<div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">\n${spaceInd}  <div className="w-full max-w-[440px] border border-slate-200 dark:border-slate-850 p-6 bg-white dark:bg-slate-950 shadow-2xl ${radius} animate-in fade-in-50 zoom-in-95">\n${spaceInd}    <h3 className="text-base font-semibold text-slate-950 dark:text-white leading-none mb-1.5">${props.title || 'Are you absolutely sure?'}</h3>\n${spaceInd}    <p className="text-xs text-slate-500 mb-6 leading-relaxed">${props.description || 'This is the modal active configuration.'}</p>\n${spaceInd}    <div className="flex justify-end gap-2">\n${spaceInd}      <button className="inline-flex h-8 items-center justify-center rounded px-3 text-xs border border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 hover:bg-slate-50 dark:text-white dark:hover:bg-slate-900">${props.cancelLabel || 'Cancel'}</button>\n${spaceInd}      <button className="inline-flex h-8 items-center justify-center rounded px-3 text-xs bg-slate-920 text-white hover:bg-slate-850 dark:bg-white dark:text-slate-950">${props.confirmLabel || 'Proceed'}</button>\n${spaceInd}    </div>\n${spaceInd}  </div>\n${spaceInd}</div>`;
      }

      case 'sheet': {
        if (!props.isOpen) {
          return `${spaceInd}{/* Accorded Sheet Slideout trigger mockup. Set isOpen=true to preview */}\n${spaceInd}<div className="border border-dashed border-slate-200 dark:border-slate-800 p-4 ${radius} text-center text-xs text-slate-500">\n${spaceInd}  <span>Sheet drawer: <b>${props.title || 'Edit Profile'}</b> (Hidden default)</span>\n${spaceInd}</div>`;
        }
        const sideClass = props.side === 'left' ? 'left-0 h-full w-[300px]' : 'right-0 h-full w-[300px]';
        return `${spaceInd}<div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-end">\n${spaceInd}  <div className="fixed ${sideClass} bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 p-6 shadow-2xl animate-in slide-in-from-right duration-200 space-y-4">\n${spaceInd}    <div>\n${spaceInd}      <h3 className="text-base font-semibold text-slate-900 dark:text-white leading-none mb-1.5">${props.title || 'Sheet Slider Title'}</h3>\n${spaceInd}      <p className="text-xs text-slate-500 leading-relaxed">${props.description || 'Profile configurations detail forms.'}</p>\n${spaceInd}    </div>\n${spaceInd}    {/* Sheet layout content children slot */}\n${spaceInd}  </div>\n${spaceInd}</div>`;
      }

      case 'flexRow': {
        const nestedChildrenHTML = subNodes
          .map((c) => renderNodeJSX(c, spaces + 4))
          .join('\n\n');

        const gapMap: Record<string, string> = { '2': 'gap-2', '4': 'gap-4', '6': 'gap-6', '8': 'gap-8' };
        const gapClass = gapMap[props.gap] || 'gap-4';

        const alignMap: Record<string, string> = {
          'start': 'items-start',
          'center': 'items-center',
          'end': 'items-end',
          'stretch': 'items-stretch',
        };
        const alignClass = alignMap[props.align] || 'items-center';

        const justifyMap: Record<string, string> = {
          'start': 'justify-start',
          'center': 'justify-center',
          'end': 'justify-end',
          'between': 'justify-between',
          'around': 'justify-around',
        };
        const justifyClass = justifyMap[props.justify] || 'justify-between';

        const padMap: Record<string, string> = { '0': 'p-0', '2': 'p-2', '4': 'p-4', '6': 'p-6' };
        const paddingClass = padMap[props.padding] || 'p-4';

        return `${spaceInd}<div className="flex flex-row ${gapClass} ${alignClass} ${justifyClass} ${paddingClass} w-full overflow-hidden ${props.borderStyle || ''}">\n${nestedChildrenHTML || `${spaceInd}  {/* Flex row container elements placement */}`}\n${spaceInd}</div>`;
      }

      case 'flexCol': {
        const nestedChildrenHTML = subNodes
          .map((c) => renderNodeJSX(c, spaces + 4))
          .join('\n\n');

        const gapMap: Record<string, string> = { '2': 'gap-2', '4': 'gap-4', '6': 'gap-6', '8': 'gap-8' };
        const gapClass = gapMap[props.gap] || 'gap-4';

        const alignMap: Record<string, string> = {
          'start': 'items-start',
          'center': 'items-center',
          'end': 'items-end',
          'stretch': 'items-stretch',
        };
        const alignClass = alignMap[props.align] || 'items-stretch';

        const padMap: Record<string, string> = { '0': 'p-0', '2': 'p-2', '4': 'p-4', '6': 'p-6' };
        const paddingClass = padMap[props.padding] || 'p-4';

        return `${spaceInd}<div className="flex flex-col ${gapClass} ${alignClass} ${paddingClass} w-full">\n${nestedChildrenHTML || `${spaceInd}  {/* Flex column container nodes nested */}`}\n${spaceInd}</div>`;
      }

      case 'gridShell': {
        const nestedChildrenHTML = subNodes
          .map((c) => renderNodeJSX(c, spaces + 4))
          .join('\n\n');

        const colMap: Record<string, string> = {
          '1': 'grid-cols-1',
          '2': 'grid-cols-1 md:grid-cols-2',
          '3': 'grid-cols-1 md:grid-cols-3',
          '4': 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4',
        };
        const gridColClass = colMap[props.columns] || 'grid-cols-1 md:grid-cols-3';

        const gapMap: Record<string, string> = { '2': 'gap-2', '4': 'gap-4', '6': 'gap-6', '8': 'gap-8' };
        const gapClass = gapMap[props.gap] || 'gap-4';

        const padMap: Record<string, string> = { '0': 'p-0', '2': 'p-2', '4': 'p-4', '6': 'p-6' };
        const paddingClass = padMap[props.padding] || 'p-0';

        return `${spaceInd}<div className="grid ${gridColClass} ${gapClass} ${paddingClass} w-full">\n${nestedChildrenHTML || `${spaceInd}  {/* Columns elements mapping list shadow */}`}\n${spaceInd}</div>`;
      }

      default:
        return `${spaceInd}<div>Unknown Node: ${node.type}</div>`;
    }
  }

  const rootNodesHTML = topLevels
    .map((n) => renderNodeJSX(n, 4))
    .join('\n\n');

  // Format code in pristine ES React block style
  return `import React, { useState } from 'react';

export default function RenderedWorkspaceLayout() {
  // Theme styling configuration:
  // Base theme vibe: ${theme.baseColor.toUpperCase()}
  // Mode: ${theme.darkMode ? 'DARK MODE' : 'LIGHT MODE'}
  // Corner radii: ${theme.radius.toUpperCase()}

  return (
    <div className="${theme.darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} min-h-screen font-sans w-full p-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
${rootNodesHTML || '        {/* Drag and drop items into workspace grid to populate elements */}'}
      </div>
    </div>
  );
}
`;
}
