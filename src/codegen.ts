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

      case 'breadcrumb': {
        const links = (props.links || 'Home, Components, Breadcrumb').split(',').map((t: string) => t.trim());
        return `${spaceInd}<nav className="flex" aria-label="Breadcrumb">\n${spaceInd}  <ol className="inline-flex items-center space-x-1 md:space-x-3 text-xs text-slate-500 font-medium">\n${links.map((link, idx) => {
          const isLast = idx === links.length - 1;
          return `${spaceInd}    <li className="inline flex items-center">\n${isLast ? `${spaceInd}      <span className="text-slate-900 dark:text-slate-100 font-semibold">${link}</span>` : `${spaceInd}      <a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">${link}</a>\n${spaceInd}      <span className="mx-2 text-slate-400">/</span>`}\n${spaceInd}    </li>`;
        }).join('\n')}\n${spaceInd}  </ol>\n${spaceInd}</nav>`;
      }

      case 'popover': {
        return `${spaceInd}<div className="relative inline-block text-left w-full">\n${spaceInd}  <button className="flex h-9 w-full items-center justify-between border border-slate-205 bg-transparent px-3 py-2 text-xs shadow-3xs ${radius}">\n${spaceInd}    <span>${props.trigger || 'Configure Params'}</span>\n${spaceInd}  </button>\n${spaceInd}  {/* Popover content simulated statically for layouts view */}\n${spaceInd}  <div className="absolute z-10 mt-2 w-60 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 p-4 shadow-lg ${radius} hidden group-hover:block">\n${spaceInd}    <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-1">${props.title || 'Edit Options'}</h4>\n${spaceInd}    <p className="text-[10px] text-slate-500 leading-normal">${props.description || 'Set port parameters and database details.'}</p>\n${spaceInd}  </div>\n${spaceInd}</div>`;
      }

      case 'tooltip': {
        return `${spaceInd}<div className="relative group inline-block w-full">\n${spaceInd}  <button className="flex h-9 w-full items-center justify-between border border-slate-200 bg-transparent px-3 py-2 text-xs shadow-3xs ${radius}">\n${spaceInd}    <span>${props.trigger || 'Hover over me'}</span>\n${spaceInd}  </button>\n${spaceInd}  <div className="absolute z-10 bottom-full mb-2 hidden group-hover:block bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-[10px] py-1 px-2 rounded shadow-md pointer-events-none whitespace-nowrap">\n${spaceInd}    ${props.content || 'This action is highly persistent!'}\n${spaceInd}  </div>\n${spaceInd}</div>`;
      }

      case 'buttonGroup': {
        const btns = (props.buttons || 'Left, Middle, Right').split(',').map((b: string) => b.trim());
        return `${spaceInd}<div className="inline-flex rounded-md shadow-3xs">\n${btns.map((btn, idx) => {
          const isActive = idx === (props.activeIndex ?? 0);
          const activeClass = isActive ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-transparent text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900';
          return `${spaceInd}  <button className="px-3.5 py-1.5 text-xs font-semibold border -ml-px first:rounded-l-md last:rounded-r-md transition-all ${activeClass}">\n${spaceInd}    ${btn}\n${spaceInd}  </button>`;
        }).join('\n')}\n${spaceInd}</div>`;
      }

      case 'inputGroup': {
        return `${spaceInd}<div className="flex rounded-md shadow-3xs overflow-hidden w-full">\n${props.prefix ? `${spaceInd}  <span className="inline-flex items-center px-2.5 border border-r-0 border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900 text-slate-500 text-xs">${props.prefix}</span>\n` : ''}${spaceInd}  <input type="text" placeholder="${props.placeholder || 'github.com'}" className="flex h-9 w-full border border-slate-200 bg-transparent px-3 py-1 text-xs focus-visible:outline-none dark:border-slate-800" />\n${props.suffix ? `\n${spaceInd}  <span className="inline-flex items-center px-2.5 border border-l-0 border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900 text-slate-500 text-xs">${props.suffix}</span>` : ''}\n${spaceInd}</div>`;
      }

      case 'inputOtp': {
        const len = Number(props.length ?? 6);
        const value = props.value || '123';
        const slots = Array.from({ length: len });
        return `${spaceInd}<div className="flex items-center justify-center space-x-1.5">\n${slots.map((_, idx) => {
          const char = value[idx] || '';
          return `${spaceInd}  <div className="w-8 h-8 rounded border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xs font-mono bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold shadow-3xs">\n${spaceInd}    ${char}\n${spaceInd}  </div>`;
        }).join('\n')}\n${spaceInd}</div>`;
      }

      case 'nativeSelect': {
        const list = (props.options || 'United States, Canada, United Kingdom').split(',').map((o: string) => o.trim());
        return `${spaceInd}<div className="grid w-full gap-1.5">\n${spaceInd}  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 capitalize-first">${props.label || 'Country Option'}</label>\n${spaceInd}  <select className="flex h-9 w-full ${radius} border border-slate-200 bg-transparent px-3 py-1 text-xs shadow-3xs focus:outline-none dark:border-slate-800 text-slate-800 dark:text-slate-200">\n${list.map((opt) => `${spaceInd}    <option>${opt}</option>`).join('\n')}\n${spaceInd}  </select>\n${spaceInd}</div>`;
      }

      case 'combobox': {
        return `${spaceInd}<div className="relative w-full">\n${spaceInd}  <button className="flex h-9 w-full items-center justify-between border border-slate-200 bg-transparent px-3 py-2 text-xs shadow-3xs ${radius} dark:border-slate-800 text-slate-800 dark:text-slate-205">\n${spaceInd}    <span>${props.selected || 'Select option...'}</span>\n${spaceInd}    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400">\n${spaceInd}      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />\n${spaceInd}    </svg>\n${spaceInd}  </button>\n${spaceInd}</div>`;
      }

      case 'toggle': {
        const activeClass = props.isActive ? 'bg-slate-100 text-slate-900 border-slate-350 dark:bg-slate-800 dark:text-white dark:border-slate-700' : 'bg-transparent text-slate-650 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900';
        return `${spaceInd}<button className="inline-flex h-9 px-3 items-center justify-center border border-slate-202 ${radius} text-xs font-semibold transition-colors ${activeClass}">\n${spaceInd}  ${props.label || 'Toggle Option'}\n${spaceInd}</button>`;
      }

      case 'toggleGroup': {
        const list = (props.options || 'Left, Center, Right').split(',').map((o: string) => o.trim());
        return `${spaceInd}<div className="inline-flex border border-slate-200 dark:border-slate-800 p-1 bg-slate-50 dark:bg-slate-900 overflow-hidden ${radius}">\n${list.map((o) => {
          const isSelected = o === props.selected;
          const selectClass = isSelected ? 'bg-white text-slate-900 shadow-3xs dark:bg-slate-800 dark:text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-250';
          return `${spaceInd}  <button className="px-2.5 py-1 text-xs font-semibold rounded ${selectClass}">\n${spaceInd}    ${o}\n${spaceInd}  </button>`;
        }).join('\n')}\n${spaceInd}</div>`;
      }

      case 'kbd': {
        return `${spaceInd}<kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-500 shadow-3xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">${props.text || '⌘K'}</kbd>`;
      }

      case 'spinner': {
        let sizeClass = 'h-5 w-5';
        if (props.size === 'sm') sizeClass = 'h-3.5 w-3.5';
        else if (props.size === 'lg') sizeClass = 'h-8 w-8';

        let colorClass = 'text-slate-500';
        if (props.color === 'zinc') colorClass = 'text-zinc-500 dark:text-zinc-400';
        else if (props.color === 'primary') colorClass = 'text-slate-900 dark:text-white';
        else if (props.color === 'sky') colorClass = 'text-sky-550 dark:text-sky-400';
        else if (props.color === 'blue') colorClass = 'text-blue-600 dark:text-blue-400';
        else if (props.color === 'indigo') colorClass = 'text-indigo-600 dark:text-indigo-400';
        else if (props.color === 'purple') colorClass = 'text-purple-600 dark:text-purple-400';
        else if (props.color === 'violet') colorClass = 'text-violet-600 dark:text-violet-400';
        else if (props.color === 'pink') colorClass = 'text-pink-600 dark:text-pink-400';
        else if (props.color === 'red') colorClass = 'text-red-650 dark:text-red-400';
        else if (props.color === 'orange') colorClass = 'text-orange-500 dark:text-orange-400';
        else if (props.color === 'amber') colorClass = 'text-amber-500 dark:text-amber-400';
        else if (props.color === 'yellow') colorClass = 'text-yellow-500 dark:text-yellow-400';
        else if (props.color === 'green') colorClass = 'text-green-600 dark:text-green-400';
        else if (props.color === 'emerald') colorClass = 'text-emerald-500 dark:text-emerald-400';
        else if (props.color === 'teal') colorClass = 'text-teal-555 dark:text-teal-400';

        return `${spaceInd}<div className="flex items-center justify-center">\n${spaceInd}  <svg className="animate-spin ${sizeClass} ${colorClass}" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">\n${spaceInd}    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>\n${spaceInd}    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>\n${spaceInd}  </svg>\n${spaceInd}</div>`;
      }

      case 'typography': {
        const elType = props.variant === 'h1' ? 'h1' : props.variant === 'h2' ? 'h2' : props.variant === 'h3' ? 'h3' : props.variant === 'code' ? 'code' : 'p';
        let designClass = 'text-base text-slate-700 dark:text-slate-300 leading-relaxed';
        if (props.variant === 'h1') designClass = 'scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl text-slate-900 dark:text-white';
        else if (props.variant === 'h2') designClass = 'scroll-m-20 border-b border-slate-200 pb-2 text-2xl font-semibold tracking-tight first:mt-0 text-slate-900 dark:text-white dark:border-slate-800';
        else if (props.variant === 'h3') designClass = 'scroll-m-20 text-xl font-semibold tracking-tight text-slate-900 dark:text-white';
        else if (props.variant === 'lead') designClass = 'text-lg text-slate-500 font-medium leading-relaxed dark:text-slate-400';
        else if (props.variant === 'code') designClass = 'relative rounded bg-slate-100 px-[0.3rem] py-[0.2rem] font-mono text-xs font-semibold text-slate-900 dark:bg-slate-900 dark:text-slate-100';
        return `${spaceInd}<${elType} className="${designClass}">${props.text || 'Typography text copy'}</${elType}>`;
      }

      case 'emptyState': {
        return `${spaceInd}<div className="flex min-h-[160px] flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-200 p-6 text-center animate-in fade-in-50 dark:border-slate-800">\n${spaceInd}  <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">\n${spaceInd}    <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">${props.title || 'No data logs found'}</h3>\n${spaceInd}    <p className="mb-4 mt-2 text-xs text-slate-500 max-w-sm leading-normal">${props.description || 'Get started by creating your first telemetry profile endpoint.'}</p>\n${spaceInd}    <button className="inline-flex h-8 items-center justify-center bg-slate-900 text-white hover:bg-slate-850 text-xs px-3 font-semibold ${radius} dark:bg-white dark:text-slate-950">${props.buttonLabel || 'Deploy service'}</button>\n${spaceInd}  </div>\n${spaceInd}</div>`;
      }

      case 'fieldContainer': {
        const nestedChildrenHTML = subNodes.map((c) => renderNodeJSX(c, spaces + 4)).join('\n\n');
        return `${spaceInd}<div className="space-y-1.5 text-left w-full">\n${spaceInd}  <div>\n${spaceInd}    <label className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">${props.label || 'Configuration settings'}</label>\n${spaceInd}    <p className="text-[10px] text-slate-500 leading-normal">${props.description || 'Provide valid parameters for visual endpoints'}</p>\n${spaceInd}  </div>\n${spaceInd}  <div className="py-1 space-y-2">\n${nestedChildrenHTML || `${spaceInd}    {/* Input controls go here */}`}\n${spaceInd}  </div>\n${props.helper ? `\n${spaceInd}  <p className="text-[10px] text-slate-400 dark:text-slate-500">${props.helper}</p>` : ''}\n${spaceInd}</div>`;
      }

      case 'listItem': {
        return `${spaceInd}<div className="flex items-center justify-between p-3.5 border border-slate-150 ${radius} bg-white dark:bg-slate-950 dark:border-slate-850 hover:bg-slate-50 transition-colors w-full">\n${spaceInd}  <div className="text-left">\n${spaceInd}    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">${props.title || 'Core Engine Node'}</h4>\n${spaceInd}    <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">${props.description || 'Telemetry pipeline status indicator'}</p>\n${spaceInd}  </div>\n${props.meta ? `\n${spaceInd}  <span className="text-[10px] font-mono text-slate-400 bg-slate-105 py-0.5 px-2 rounded-full dark:bg-slate-900 dark:text-slate-500">${props.meta}</span>` : ''}\n${spaceInd}</div>`;
      }

      case 'datePicker': {
        return `${spaceInd}<div className="grid w-full gap-1.5 text-left">\n${spaceInd}  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">${props.label || 'Select Day'}</label>\n${spaceInd}  <button className="flex h-9 w-full items-center justify-between border border-slate-202 dark:border-slate-800 bg-transparent px-3 py-2 text-xs shadow-3xs ${radius} text-slate-700 dark:text-slate-300">\n${spaceInd}    <span>${props.selectedDate || '2026-05-20'}</span>\n${spaceInd}    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-slate-400">\n${spaceInd}      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />\n${spaceInd}    </svg>\n${spaceInd}  </button>\n${spaceInd}</div>`;
      }

      case 'direction': {
        return `${spaceInd}<div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-300" dir="${props.dir || 'ltr'}">\n${spaceInd}  <span>Active Writing Direction: <b>${(props.dir || 'ltr').toUpperCase()}</b></span>\n${spaceInd}</div>`;
      }

      case 'alertDialog': {
        return `${spaceInd}{/* Simulations for AlertDialog */}\n${spaceInd}<div className="border border-red-500/30 p-4 ${radius} text-left text-xs bg-red-500/5">\n${spaceInd}  <h4 className="font-bold text-red-650 dark:text-red-450 mb-1">${props.title || 'Confirm deletion?'}</h4>\n${spaceInd}  <p className="text-slate-500 mb-4">${props.description || 'Warning: Action is irreversible.'}</p>\n${spaceInd}  <div className="flex gap-2 justify-end">\n${spaceInd}    <button className="h-7 px-2.5 rounded border border-slate-200 text-[10px] bg-transparent hover:bg-slate-50">${props.cancelLabel || 'Cancel'}</button>\n${spaceInd}    <button className="h-7 px-2.5 text-[10px] rounded bg-red-650 text-white hover:bg-red-500">${props.confirmLabel || 'Proceed'}</button>\n${spaceInd}  </div>\n${spaceInd}</div>`;
      }

      case 'dataTable': {
        const headers = (props.headers || 'Task, Service, Latency').split(',').map((h: string) => h.trim());
        const rawRows = props.rows || '';
        const rowsList = rawRows.split('|').filter((line: string) => line.trim()).map((line: string) => line.split(',').map((cell: string) => cell.trim()));
        return `${spaceInd}<div className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-3xs ${radius}">\n${spaceInd}  <div className="p-4 border-b border-slate-100 dark:border-slate-900">\n${spaceInd}    <h4 className="font-bold text-xs text-slate-905 dark:text-white uppercase tracking-wider">${props.title || 'Microservices Registry'}</h4>\n${spaceInd}  </div>\n${spaceInd}  <table className="w-full text-[10px] text-left">\n${spaceInd}    <thead className="bg-slate-50 text-slate-500 dark:bg-slate-900/50 dark:text-slate-400">\n${spaceInd}      <tr>\n${headers.map((h) => `${spaceInd}        <th className="p-2.5 font-bold">${h}</th>`).join('\n')}\n${spaceInd}      </tr>\n${spaceInd}    </thead>\n${spaceInd}    <tbody className="divide-y divide-slate-100 dark:divide-slate-900">\n${rowsList.map((row) => `${spaceInd}      <tr>\n${row.map((cell) => `${spaceInd}        <td className="p-2.5 font-semibold text-slate-700 dark:text-slate-300">${cell}</td>`).join('\n')}\n${spaceInd}      </tr>`).join('\n')}\n${spaceInd}    </tbody>\n${spaceInd}  </table>\n${spaceInd}</div>`;
      }

      case 'drawer': {
        return `${spaceInd}<div className="border border-dashed border-slate-200 dark:border-slate-800 p-4 ${radius} text-center text-xs text-slate-500 bg-slate-50/50 dark:bg-slate-950/20">\n${spaceInd}  <span>Bottom Drawer Drawer: <b>${props.title || 'Edit Profile'}</b> (${props.description || 'Slide drawer simulation'})</span>\n${spaceInd}</div>`;
      }

      case 'command': {
        const grps = (props.groups || 'Suggestions, Settings').split(',').map((g: string) => g.trim());
        const items = (props.items || 'Add nodes, Set theme, Open menu').split(',').map((it: string) => it.trim());
        return `${spaceInd}<div className="w-full border border-slate-200 dark:border-slate-830 rounded-lg p-2.5 bg-white dark:bg-slate-950 shadow-md max-w-md text-left">\n${spaceInd}  <input type="text" placeholder="${props.placeholder || 'Type shortcuts command...'}" className="w-full bg-transparent border-b border-slate-100 pb-2 text-xs outline-none dark:border-slate-900 focus:placeholder:text-slate-500" />\n${spaceInd}  <div className="mt-2 space-y-3">\n${grps.map((grp) => `${spaceInd}    <div>\n${spaceInd}      <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">${grp}</span>\n${spaceInd}      <div className="mt-1 space-y-1">\n${items.map((it) => `${spaceInd}        <div className="p-1 px-2 hover:bg-slate-50 dark:hover:bg-slate-900 rounded text-xs select-none cursor-pointer flex justify-between text-slate-700 dark:text-slate-350">\n${spaceInd}          <span>${it}</span>\n${spaceInd}        </div>`).join('\n')}\n${spaceInd}      </div>\n${spaceInd}    </div>`).join('\n')}\n${spaceInd}  </div>\n${spaceInd}</div>`;
      }

      case 'contextMenu': {
        const list = (props.items || 'Back, Forward, Refactor, Settings').split(',').map((i: string) => i.trim());
        return `${spaceInd}<div className="relative group inline-block w-full text-left">\n${spaceInd}  <div className="p-6 border-2 border-dashed border-slate-201 dark:border-slate-800 ${radius} text-xs text-slate-500 text-center select-none cursor-context-menu hover:bg-slate-50 dark:hover:bg-slate-900/10">\n${spaceInd}    <span>${props.trigger || 'Simulated Right-Click trigger area'}</span>\n${spaceInd}  </div>\n${spaceInd}  <div className="absolute left-4 top-1/2 hidden group-hover:block z-15 w-40 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 p-1 rounded shadow-md text-xs">\n${list.map((it) => `${spaceInd}    <div className="p-1.5 px-2.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded cursor-pointer">${it}</div>`).join('\n')}\n${spaceInd}  </div>\n${spaceInd}</div>`;
      }

      case 'dropdownMenu': {
        const list = (props.items || 'Profile Details, Settings, Billing, Logout').split(',').map((i: string) => i.trim());
        return `${spaceInd}<div className="relative group inline-block w-full text-left">\n${spaceInd}  <button className="flex h-9 w-full items-center justify-between border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 text-xs shadow-3xs ${radius}">\n${spaceInd}    <span>${props.trigger || 'View Admin Options'}</span>\n${spaceInd}  </button>\n${spaceInd}  <div className="absolute right-0 mt-1 hidden group-hover:block z-15 w-40 border border-slate-105 dark:border-slate-850 bg-white dark:bg-slate-950 p-1 rounded shadow-md text-xs">\n${list.map((it) => `${spaceInd}    <div className="p-1.5 px-2.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded cursor-pointer">${it}</div>`).join('\n')}\n${spaceInd}  </div>\n${spaceInd}</div>`;
      }

      case 'menubar': {
        const navs = (props.menus || 'File, Edit, Selection, View, Help').split(',').map((n: string) => n.trim());
        return `${spaceInd}<div className="inline-flex h-9 items-center space-x-1 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-1 ${radius} shadow-3xs">\n${navs.map((n) => `${spaceInd}  <button className="px-2.5 py-1 text-xs font-semibold rounded hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 transition-all bg-transparent border-0">${n}</button>`).join('\n')}\n${spaceInd}</div>`;
      }

      case 'navigationMenu': {
        const list = (props.items || 'Docs, API Reference, GitHub Release, Blog').split(',').map((i: string) => i.trim());
        return `${spaceInd}<div className="inline-flex h-9 items-center space-x-4 px-2">\n${spaceInd}  <span className="text-xs font-bold text-slate-900 dark:text-white">${props.trigger || 'Overview'}</span>\n${list.map((it) => `${spaceInd}  <a href="#" className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors">${it}</a>`).join('\n')}\n${spaceInd}</div>`;
      }

      case 'pagination': {
        const curr = Number(props.currentPage ?? 1);
        const tot = Number(props.totalPages ?? 5);
        return `${spaceInd}<div className="flex items-center justify-center space-x-1.5 py-1.5">\n${spaceInd}  <button className="h-7 w-7 border rounded bg-transparent flex items-center justify-center hover:bg-slate-100 text-xs text-slate-500"><b>&lt;</b></button>\n${Array.from({ length: Math.min(tot, 3) }).map((_, i) => `${spaceInd}  <button className="h-7 px-2.5 border rounded text-xs ${i + 1 === curr ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold' : 'bg-transparent text-slate-600 hover:bg-slate-50'}">${i + 1}</button>`).join('\n')}\n${spaceInd}  <span className="text-xs text-slate-400 p-1">...</span>\n${spaceInd}  <button className="h-7 px-2.5 border rounded text-xs bg-transparent text-slate-600">${tot}</button>\n${spaceInd}  <button className="h-7 w-7 border rounded bg-transparent flex items-center justify-center hover:bg-slate-100 text-xs text-slate-500"><b>&gt;</b></button>\n${spaceInd}</div>`;
      }

      case 'hoverCard': {
        return `${spaceInd}<div className="relative group inline-block text-left w-full">\n${spaceInd}  <span className="text-xs underline decoration-dotted underline-offset-4 cursor-help font-bold text-slate-800 dark:text-slate-200">${props.triggerText || 'Hover parameters detail'}</span>\n${spaceInd}  <div className="absolute z-10 top-full mt-1.5 hidden group-hover:block w-64 border border-slate-202 dark:border-slate-850 p-4 bg-white dark:bg-slate-950 shadow-md ${radius}">\n${spaceInd}    <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">${props.title || 'Gemini API Engine'}</h4>\n${spaceInd}    <p className="text-[10px] text-slate-500 mt-1 leading-normal">${props.description || 'Integrates full-stack pipeline parameters'}</p>\n${spaceInd}    <p className="text-[9px] text-slate-400 mt-2 font-mono">${props.joined || 'Joined June 2026'}</p>\n${spaceInd}  </div>\n${spaceInd}</div>`;
      }

      case 'resizable': {
        return `${spaceInd}<div className="flex border border-slate-200 dark:border-slate-800 w-full rounded-lg overflow-hidden h-24 text-[11px] text-slate-550 font-mono">\n${spaceInd}  <div className="flex-1 p-3 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/10">${props.leftLabel || 'Workspace Left'}</div>\n${spaceInd}  <div className="w-[1px] bg-slate-200 dark:bg-slate-850 relative">\n${spaceInd}    <div className="absolute -translate-y-1/2 top-1/2 -left-1.5 h-6 w-3 bg-white dark:bg-slate-950 rounded border flex items-center justify-center text-[8px] cursor-col-resize text-slate-400">||</div>\n${spaceInd}  </div>\n${spaceInd}  <div className="flex-1 p-3 flex items-center justify-center">${props.rightLabel || 'Workspace Right'}</div>\n${spaceInd}</div>`;
      }

      case 'aspectRatio': {
        return `${spaceInd}<div className="relative w-full rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800" style={{ aspectRatio: '${props.ratio === '4/3' ? '4/3' : props.ratio === '1/1' ? '1/1' : '16/9'}' }}>\n${spaceInd}  <img src="${props.imageSrc || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400'}" alt="Aspect Fitted Layout" className="absolute inset-0 h-full w-full object-cover" />\n${spaceInd}</div>`;
      }

      case 'carousel': {
        const list = (props.slides || 'Primary Node overview, Secondary Database specs, Live monitoring stats').split(',').map((s: string) => s.trim());
        return `${spaceInd}<div className="relative w-full border border-slate-200 dark:border-slate-800 p-4 ${radius} text-center select-none bg-white dark:bg-slate-950">\n${spaceInd}  <div className="px-8 min-h-[40px] flex items-center justify-center">\n${spaceInd}    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">${list[0] || 'Active slide description'}</p>\n${spaceInd}  </div>\n${spaceInd}  <button className="absolute left-2.5 top-1/2 -translate-y-1/2 h-6 w-6 border rounded-full bg-white dark:bg-slate-950 flex items-center justify-center text-[10px] hover:bg-slate-50 cursor-pointer shadow-3xs">&lt;</button>\n${spaceInd}  <button className="absolute right-2.5 top-1/2 -translate-y-1/2 h-6 w-6 border rounded-full bg-white dark:bg-slate-950 flex items-center justify-center text-[10px] hover:bg-slate-50 cursor-pointer shadow-3xs">&gt;</button>\n${spaceInd}</div>`;
      }

      case 'chart': {
        const list = (props.dataPoints || 'Mon, 40 | Tue, 60 | Wed, 45 | Thu, 80').split('|').map((pt: string) => pt.trim()).filter(Boolean);
        return `${spaceInd}<div className="w-full border border-slate-200 dark:border-slate-800 p-5 bg-white dark:bg-slate-950 shadow-3xs ${radius} text-left">\n${spaceInd}  <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-6">${props.title || 'Telemetry stats graph'}</h4>\n${spaceInd}  <div className="flex items-end justify-between h-20 px-1 border-b border-l border-slate-150 dark:border-slate-900">\n${list.map((pt) => {
          const parts = pt.split(',');
          const label = parts[0]?.trim() || '';
          const val = Math.min(100, Math.max(10, Number(parts[1]?.trim() || '50')));
          return `${spaceInd}    <div className="flex flex-col items-center flex-1">\n${spaceInd}      <div className="w-5 bg-slate-900 dark:bg-slate-100 rounded-t-xs" style={{ height: '${val * 0.7}px' }} title="${val}" />\n${spaceInd}      <span className="text-[8px] text-slate-400 font-mono mt-1.5">${label}</span>\n${spaceInd}    </div>`;
        }).join('\n')}\n${spaceInd}  </div>\n${spaceInd}</div>`;
      }

      case 'collapsible': {
        const list = (props.content || 'Database parameters initialized, Secondary sync active, Cloud platform telemetry live').split('|').map((s: string) => s.trim()).filter(Boolean);
        return `${spaceInd}<div className="w-full border border-slate-200 dark:border-slate-800 p-3.5 bg-white dark:bg-slate-950 ${radius}">\n${spaceInd}  <div className="flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-900">\n${spaceInd}    <span className="text-xs font-semibold text-slate-900 dark:text-white">${props.title || 'Pipeline status logs'}</span>\n${spaceInd}    <button className="p-1 px-2 border rounded-md text-[9px] hover:bg-slate-50">Toggle</button>\n${spaceInd}  </div>\n${spaceInd}  <div className="mt-2.5 space-y-1 text-[10px] text-slate-500 text-left">\n${list.map((it) => `${spaceInd}    <div className="p-1 px-1.5 hover:bg-slate-50 dark:hover:bg-slate-900/15 rounded">${it}</div>`).join('\n')}\n${spaceInd}  </div>\n${spaceInd}</div>`;
      }

      case 'scrollArea': {
        const list = (props.content || 'Pipeline node initialized successfully | Telemetry data loaded | Connection established port 3000 | Core node sync done').split('|').map((i: string) => i.trim()).filter(Boolean);
        return `${spaceInd}<div className="w-full border border-slate-200 dark:border-slate-800 h-28 overflow-y-auto p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950/25 text-left">\n${spaceInd}  <div className="space-y-1.5 font-mono text-[9px] text-slate-500">\n${list.map((it) => `${spaceInd}    <div className="border-b border-slate-100 pb-1 last:border-0 dark:border-slate-900">> ${it}</div>`).join('\n')}\n${spaceInd}  </div>\n${spaceInd}</div>`;
      }

      case 'sidebar': {
        const list = (props.items || 'Overview, Analytics, Services, Database, Settings').split(',').map((it: string) => it.trim());
        return `${spaceInd}<div className="w-52 h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-850 p-4 shrink-0 text-left flex flex-col space-y-4">\n${spaceInd}  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">${props.title || 'System Controller'}</h3>\n${spaceInd}  <nav className="space-y-1 flex-1">\n${list.map((it) => `${spaceInd}    <button className="w-full text-left py-1.5 px-2.5 rounded hover:bg-slate-55 dark:hover:bg-slate-900 text-xs font-medium text-slate-705 dark:text-slate-300 transition-all border-0 bg-transparent">${it}</button>`).join('\n')}\n${spaceInd}  </nav>\n${spaceInd}</div>`;
      }

      case 'sonner': {
        return `${spaceInd}<button className="inline-flex h-9 items-center justify-center text-xs font-bold border rounded px-3.5 hover:bg-slate-50 transition-all text-slate-800 dark:text-slate-200 dark:border-slate-800 bg-transparent w-full">\n${spaceInd}  ${props.label || 'Display Toast Alert'}\n${spaceInd}</button>`;
      }

      case 'toast': {
        return `${spaceInd}<button className="inline-flex h-9 items-center justify-center text-xs font-bold border rounded px-3.5 hover:bg-slate-50 transition-all text-slate-800 dark:text-slate-200 dark:border-slate-800 bg-transparent w-full">\n${spaceInd}  ${props.label || 'Show Dynamic Banner'}\n${spaceInd}</button>`;
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
