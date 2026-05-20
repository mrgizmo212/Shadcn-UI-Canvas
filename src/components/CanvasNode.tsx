/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CanvasNode, ThemeSettings } from '../types';
import { 
  Calendar as CalendarIcon, 
  ChevronRight, 
  ChevronDown, 
  Check, 
  Trash2, 
  Plus, 
  Copy, 
  MoveUp, 
  MoveDown, 
  LogOut, 
  Info, 
  AlertTriangle, 
  Grid, 
  Maximize2 
} from 'lucide-react';

import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './ui/breadcrumb';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { AspectRatio } from './ui/aspect-ratio';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from './ui/carousel';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from './ui/collapsible';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from './ui/command';
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from './ui/context-menu';
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from './ui/drawer';
import { HoverCard, HoverCardTrigger, HoverCardContent } from './ui/hover-card';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from './ui/input-otp';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from './ui/navigation-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from './ui/pagination';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './ui/resizable';
import { ScrollArea } from './ui/scroll-area';
import { SidebarProvider } from './ui/sidebar';
import { Toggle } from './ui/toggle';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from './ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
} from './ui/menubar';
import { Loader2 } from 'lucide-react';
import { toast as toastImpl } from 'sonner';

interface CanvasNodeProps {
  node: CanvasNode;
  theme: ThemeSettings;
  mode: 'design' | 'play';
  isSelected: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  onDetach?: (id: string) => void;
  onResizeStart?: (e: React.MouseEvent) => void;
  children?: React.ReactNode;
  allNodes?: CanvasNode[];
  onSelectNodeIds?: (ids: string[]) => void;
  onUpdateNode?: (nodeId: string, updates: Partial<CanvasNode>) => void;
}

export const CanvasNodeRenderer: React.FC<CanvasNodeProps> = ({
  node,
  theme,
  mode,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onDetach,
  onResizeStart,
  children,
  allNodes,
  onSelectNodeIds,
  onUpdateNode,
}) => {
  const props = node.properties;

  // Local state for interactive play simulations
  const [isChecked, setIsChecked] = useState<boolean>(props.checked || false);
  const [sliderVal, setSliderVal] = useState<number>(props.value || 50);
  const [activeTab, setActiveTab] = useState<string>('');
  const [accordionExpanded, setAccordionExpanded] = useState<boolean>(props.isExpanded || false);
  const [inputValue, setInputValue] = useState<string>(props.value || '');
  const [dialogOpen, setDialogOpen] = useState<boolean>(props.isOpen || false);
  const [sheetOpen, setSheetOpen] = useState<boolean>(props.isOpen || false);
  const [radioSelected, setRadioSelected] = useState<string>(props.selected || '');
  const [selectSelected, setSelectSelected] = useState<string>(props.selected || '');
  const [isActiveSelectOpen, setIsActiveSelectOpen] = useState<boolean>(false);

  // Granular inline text editing states
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>('');

  const startEditing = (field: string, initialValue: string) => {
    if (mode !== 'design') return;
    setEditingField(field);
    setEditText(initialValue);
  };

  const saveEditing = () => {
    if (editingField && onUpdateNode) {
      const updatedProps = { ...props, [editingField]: editText };
      onUpdateNode(node.id, { properties: updatedProps });
    }
    setEditingField(null);
  };

  const renderEditableText = (field: string, defaultValue: string, className: string, isTextarea = false) => {
    const val = props[field] !== undefined ? props[field] : defaultValue;
    if (mode === 'design' && editingField === field) {
      if (isTextarea) {
        return (
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={saveEditing}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveEditing(); }
              if (e.key === 'Escape') setEditingField(null);
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-full text-xs font-normal border border-blue-500 rounded p-1 bg-white dark:bg-zinc-950 text-black dark:text-white focus:outline-hidden pointer-events-auto"
            autoFocus
          />
        );
      }
      return (
        <input
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={saveEditing}
          onKeyDown={(e) => {
            if (e.key === 'Enter') saveEditing();
            if (e.key === 'Escape') setEditingField(null);
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          className="w-full text-xs font-normal border border-blue-500 rounded px-1.5 py-0.5 bg-white dark:bg-[#09090b] text-black dark:text-white focus:outline-hidden pointer-events-auto"
          autoFocus
        />
      );
    }

    return (
      <span
        onDoubleClick={(e) => {
          e.stopPropagation();
          startEditing(field, val);
        }}
        title="Double-click to edit text"
        className={`${className} cursor-text hover:bg-zinc-100/50 dark:hover:bg-zinc-800/30 rounded px-1.5 py-0.5 transition-all duration-150 pointer-events-auto inline-block min-w-[20px]`}
      >
        {val}
      </span>
    );
  };

  // Synchronize local states with node properties when properties change in panel
  useEffect(() => {
    if (props.checked !== undefined) setIsChecked(props.checked);
  }, [props.checked]);

  useEffect(() => {
    if (props.value !== undefined) setSliderVal(props.value);
  }, [props.value]);

  useEffect(() => {
    if (props.isExpanded !== undefined) setAccordionExpanded(props.isExpanded);
  }, [props.isExpanded]);

  useEffect(() => {
    if (props.isOpen !== undefined) {
      setDialogOpen(props.isOpen);
      setSheetOpen(props.isOpen);
    }
  }, [props.isOpen]);

  useEffect(() => {
    if (props.selected !== undefined) {
      setRadioSelected(props.selected);
      setSelectSelected(props.selected);
    }
  }, [props.selected]);

  // Handle active calendar day selection
  const [selectedDay, setSelectedDay] = useState<number>(20);

  // Set initial tab based on properties
  useEffect(() => {
    if (props.headers) {
      const tabsList = props.headers.split(',').map((t: string) => t.trim());
      setActiveTab(tabsList[0]);
    }
  }, [props.headers]);

  // Radius styles
  const getRadiusClass = (radiusOpt: string) => {
    switch (radiusOpt) {
      case 'none': return 'rounded-none';
      case 'sm': return 'rounded-sm';
      case 'md': return 'rounded-md';
      case 'lg': return 'rounded-lg';
      case 'full': return 'rounded-full';
      default: return 'rounded-md';
    }
  };

  const radius = getRadiusClass(theme.radius);

  const getThemeClass = (role: string) => {
    const c = theme.baseColor; // 'zinc' | 'slate' | 'neutral' | 'stone'
    
    const themes: Record<string, Record<string, string>> = {
      // Backgrounds
      bgMuted: {
        zinc: 'bg-zinc-150/80 dark:bg-zinc-900',
        slate: 'bg-slate-150/80 dark:bg-slate-900',
        neutral: 'bg-neutral-150/80 dark:bg-neutral-900',
        stone: 'bg-stone-150/80 dark:bg-stone-900'
      },
      bgActive: {
        zinc: 'bg-zinc-950 dark:bg-white',
        slate: 'bg-slate-950 dark:bg-white',
        neutral: 'bg-neutral-950 dark:bg-white',
        stone: 'bg-stone-950 dark:bg-white'
      },
      bgActiveHover: {
        zinc: 'hover:bg-zinc-900 dark:hover:bg-zinc-100',
        slate: 'hover:bg-slate-900 dark:hover:bg-slate-100',
        neutral: 'hover:bg-neutral-900 dark:hover:bg-neutral-100',
        stone: 'hover:bg-stone-900 dark:hover:bg-stone-100'
      },
      bgHover: {
        zinc: 'hover:bg-zinc-100/70 dark:hover:bg-zinc-800/60',
        slate: 'hover:bg-slate-100/70 dark:hover:bg-slate-800/60',
        neutral: 'hover:bg-neutral-100/70 dark:hover:bg-neutral-800/60',
        stone: 'hover:bg-stone-100/70 dark:hover:bg-stone-800/60'
      },
      // Borders
      border: {
        zinc: 'border-zinc-200 dark:border-zinc-800',
        slate: 'border-slate-200 dark:border-slate-800',
        neutral: 'border-neutral-200 dark:border-neutral-800',
        stone: 'border-stone-200 dark:border-stone-800'
      },
      borderActive: {
        zinc: 'border-zinc-950 dark:border-white',
        slate: 'border-slate-950 dark:border-white',
        neutral: 'border-neutral-950 dark:border-white',
        stone: 'border-stone-950 dark:border-white'
      },
      // Texts
      textTitle: {
        zinc: 'text-zinc-950 dark:text-zinc-50',
        slate: 'text-slate-950 dark:text-slate-50',
        neutral: 'text-neutral-950 dark:text-neutral-50',
        stone: 'text-stone-950 dark:text-stone-50'
      },
      textBody: {
        zinc: 'text-zinc-750 dark:text-zinc-300',
        slate: 'text-slate-750 dark:text-slate-300',
        neutral: 'text-neutral-750 dark:text-neutral-300',
        stone: 'text-stone-750 dark:text-stone-300'
      },
      textMuted: {
        zinc: 'text-zinc-500 dark:text-zinc-400',
        slate: 'text-slate-500 dark:text-slate-400',
        neutral: 'text-neutral-500 dark:text-neutral-400',
        stone: 'text-stone-500 dark:text-stone-400'
      },
      textPrimaryBtn: {
        zinc: 'text-white dark:text-zinc-950',
        slate: 'text-white dark:text-slate-950',
        neutral: 'text-white dark:text-neutral-950',
        stone: 'text-white dark:text-stone-950'
      },
      // Controls
      accent: {
        zinc: 'accent-zinc-950 dark:accent-white',
        slate: 'accent-slate-950 dark:accent-white',
        neutral: 'accent-neutral-950 dark:accent-white',
        stone: 'accent-stone-950 dark:accent-white'
      },
      ring: {
        zinc: 'focus-visible:ring-zinc-450 dark:focus-visible:ring-zinc-500',
        slate: 'focus-visible:ring-slate-450 dark:focus-visible:ring-slate-500',
        neutral: 'focus-visible:ring-neutral-450 dark:focus-visible:ring-neutral-500',
        stone: 'focus-visible:ring-stone-450 dark:focus-visible:ring-stone-500'
      }
    };
    
    return themes[role]?.[c] || themes[role]?.['zinc'];
  };

  // Dynamic design system override classes (text, background, border styles)
  const getCustomStyleOverrides = () => {
    let classes = '';

    // Text style overrides
    if (props.textColor) {
      if (props.textColor.startsWith('text-')) {
        classes += ` ${props.textColor}`;
      } else {
        const textColors: Record<string, string> = {
          default: '',
          red: 'text-red-650 dark:text-red-400',
          green: 'text-green-650 dark:text-green-400',
          blue: 'text-blue-600 dark:text-blue-400',
          yellow: 'text-amber-600 dark:text-amber-450',
          purple: 'text-purple-650 dark:text-purple-400',
          orange: 'text-orange-600 dark:text-orange-400',
          pink: 'text-pink-600 dark:text-pink-400',
          teal: 'text-teal-650 dark:text-teal-400',
          white: 'text-white dark:text-white',
          dark: 'text-zinc-950 dark:text-zinc-50',
          zinc: 'text-zinc-700 dark:text-zinc-350'
        };
        classes += ` ${textColors[props.textColor] || ''}`;
      }
    }

    // Background and border style overrides
    if (props.bgColor) {
      if (props.bgColor.startsWith('bg-')) {
        classes += ` ${props.bgColor}`;
      } else {
        const bgColors: Record<string, string> = {
          default: '',
          white: 'bg-white dark:bg-zinc-950',
          zinc: 'bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850',
          slate: 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850',
          neutral: 'bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850',
          stone: 'bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-850',
          red: 'bg-red-50/75 border border-red-200 text-red-650 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400',
          green: 'bg-green-50/75 border border-green-200 text-green-755 dark:bg-green-950/20 dark:border-green-900/30 dark:text-green-400',
          blue: 'bg-blue-50/75 border border-blue-200 text-blue-755 dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400',
          yellow: 'bg-amber-50/75 border border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-450',
          purple: 'bg-purple-50/75 border border-purple-200 text-purple-750 dark:bg-purple-950/20 dark:border-purple-900/30 dark:text-purple-400',
          orange: 'bg-orange-50/75 border border-orange-200 text-orange-750 dark:bg-orange-950/20 dark:border-orange-900/30 dark:text-orange-400',
          teal: 'bg-teal-50/75 border border-teal-200 text-teal-750 dark:bg-teal-950/20 dark:border-teal-900/30 dark:text-teal-400',
          zincActive: 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-transparent',
          indigoActive: 'bg-indigo-600 text-white dark:bg-indigo-500 dark:text-white border-transparent'
        };
        classes += ` ${bgColors[props.bgColor] || ''}`;
      }
    }

    if (props.customClass) {
      classes += ` ${props.customClass}`;
    }

    return classes;
  };

  // Theme color modifiers for active components
  const activeBg = `${getThemeClass('bgActive')} ${getThemeClass('textPrimaryBtn')}`;
  const activeBorder = getThemeClass('borderActive');

  const renderContent = () => {
    switch (node.type) {
      case 'button': {
        // Direct clicking in play mode can mock firing notifications or alerts
        const handleBtnClick = () => {
          if (mode === 'play') {
            if (props.variant === 'destructive') {
              alert('💥 Simulated destructive endpoint action fired successfully inside play workspace sandbox!');
            } else {
              alert(`🔔 Action execution: "${props.label || 'Default Button'}" pressed!`);
            }
          }
        };

        const mapVariant = () => {
          if (props.bgColor || props.textColor) return 'custom';
          if (props.variant === 'secondary') return 'secondary';
          if (props.variant === 'outline') return 'outline';
          if (props.variant === 'ghost') return 'ghost';
          if (props.variant === 'destructive') return 'destructive';
          return 'default';
        };

        const mapSize = () => {
          if (props.size === 'sm') return 'sm';
          if (props.size === 'lg') return 'lg';
          return 'default';
        };

        return (
          <Button
            onClick={handleBtnClick}
            disabled={props.disabled}
            variant={mapVariant() as any}
            size={mapSize()}
            className={`w-full h-full select-none cursor-pointer ${radius} ${getCustomStyleOverrides()}`}
          >
            {renderEditableText('label', 'Action Button', 'font-medium text-xs')}
          </Button>
        );
      }

      case 'input': {
        return (
          <div className="grid w-full gap-1.5 p-1">
            <label className={`text-xs font-semibold leading-none ${getThemeClass('textMuted')} select-none text-left`}>
              {renderEditableText('label', 'Input Parameter', 'font-semibold text-xs')}
            </label>
            <Input
              type={props.type || 'text'}
              disabled={mode === 'design'}
              placeholder={props.placeholder || 'e.g. hello world'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className={radius}
            />
          </div>
        );
      }

      case 'textarea': {
        return (
          <div className="grid w-full gap-1.5 p-1">
            <label className={`text-xs font-semibold leading-none ${getThemeClass('textMuted')} select-none text-left`}>
              {renderEditableText('label', 'Description Textarea', 'font-semibold text-xs')}
            </label>
            <Textarea
              disabled={mode === 'design'}
              placeholder={props.placeholder || 'Type description contents here...'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className={radius}
            />
          </div>
        );
      }

      case 'badge': {
        const mapVariant = () => {
          if (props.bgColor || props.textColor) return 'custom';
          if (props.variant === 'secondary') return 'secondary';
          if (props.variant === 'outline') return 'outline';
          if (props.variant === 'destructive') return 'destructive';
          return 'default';
        };

        return (
          <Badge
            variant={mapVariant()}
            className={`whitespace-nowrap select-none ${radius} ${getCustomStyleOverrides()}`}
          >
            {renderEditableText('label', 'New Status', 'font-semibold text-xs')}
          </Badge>
        );
      }

      case 'switch': {
        return (
          <div className="flex items-center space-x-3.5 py-1 select-none text-left">
            <Switch
              checked={isChecked}
              onCheckedChange={mode === 'play' ? setIsChecked : undefined}
              disabled={mode !== 'play'}
            />
            <span className={`text-sm font-medium leading-none ${getThemeClass('textBody')}`}>
              {renderEditableText('label', 'Toggled option', 'text-sm font-medium')}
            </span>
          </div>
        );
      }

      case 'slider': {
        const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          if (mode === 'play') {
            setSliderVal(Number(e.target.value));
          }
        };

        return (
          <div className="grid w-full gap-2 p-1 text-left">
            <div className={`flex justify-between text-xs font-semibold ${getThemeClass('textMuted')} select-none items-center`}>
              <span>{renderEditableText('label', 'Adjust quantitative', 'text-xs font-semibold')}</span>
              <span className={`font-mono ${getThemeClass('textBody')}`}>{sliderVal}%</span>
            </div>
            <div className="relative flex w-full touch-none select-none items-center">
              <input
                type="range"
                min={props.min || 0}
                max={props.max || 100}
                value={sliderVal}
                onChange={handleSliderChange}
                disabled={mode === 'design'}
                className={`w-full h-1.5 ${getThemeClass('bgMuted')} rounded-lg appearance-none cursor-pointer ${getThemeClass('accent')}`}
              />
            </div>
          </div>
        );
      }

      case 'checkbox': {
        const toggleCheck = () => {
          if (mode === 'play') {
            setIsChecked(!isChecked);
          }
        };

        return (
          <div className="flex items-center space-x-2 py-1 select-none text-left">
            <Checkbox
              checked={isChecked}
              onCheckedChange={mode === 'play' ? setIsChecked : undefined}
              disabled={mode !== 'play'}
              id={`chk-${node.id}`}
            />
            <label htmlFor={`chk-${node.id}`} className={`text-xs font-medium leading-tight ${getThemeClass('textBody')} ${mode === 'play' ? 'cursor-pointer' : ''}`}>
              {renderEditableText('label', 'Form checkbox description', 'text-xs font-medium')}
            </label>
          </div>
        );
      }

      case 'radioGroup': {
        const optionsList = (props.options || 'Starter tier, Enterprise custom')
          .split(',')
          .map((t: string) => t.trim());
        
        return (
          <div className="grid gap-2.5 p-1 text-left w-full">
            {props.label !== undefined && (
              <span className={`text-xs font-semibold ${getThemeClass('textMuted')} select-none`}>
                {renderEditableText('label', 'Choose plan tier:', 'text-xs font-semibold')}
              </span>
            )}
            <RadioGroup
              value={radioSelected || optionsList[0]}
              onValueChange={mode === 'play' ? setRadioSelected : undefined}
              disabled={mode !== 'play'}
              className="grid gap-2"
            >
              {optionsList.map((option, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-2.5 select-none"
                >
                  <RadioGroupItem value={option} id={`rad-${node.id}-${idx}`} />
                  <label htmlFor={`rad-${node.id}-${idx}`} className={`text-sm font-medium ${getThemeClass('textBody')} ${mode === 'play' ? 'cursor-pointer' : ''}`}>
                    {option}
                  </label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
      }

      case 'label': {
        return (
          <h4 className={`text-xs font-bold tracking-wider ${getThemeClass('textMuted')} uppercase select-none text-left p-0.5`}>
            {renderEditableText('text', 'Section Header Landmark', 'text-xs font-bold tracking-wider uppercase')}
          </h4>
        );
      }

      case 'select': {
        const selectOptions = (props.options || 'United States, Deutschland, France')
          .split(',')
          .map((t: string) => t.trim());

        // Fill background based on state
        const currentActiveVal = selectSelected || selectOptions[0];

        const toggleDropdown = () => {
          if (mode === 'play') {
            setIsActiveSelectOpen(!isActiveSelectOpen);
          }
        };

        const handleOptionClick = (val: string) => {
          setSelectSelected(val);
          setIsActiveSelectOpen(false);
        };

        return (
          <div className={`grid w-full gap-1.5 p-1 text-left relative ${getThemeClass('textBody')}`}>
            {props.label !== undefined && (
              <label className={`text-xs font-semibold ${getThemeClass('textMuted')} select-none`}>
                {renderEditableText('label', 'Theme Selection', 'text-xs font-semibold')}
              </label>
            )}
            <div
              onClick={toggleDropdown}
              className={`flex h-9 w-full items-center justify-between border ${getThemeClass('border')} bg-white dark:bg-zinc-950 px-3 py-2 text-sm shadow-sm hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors ${radius} ${mode === 'play' ? 'cursor-pointer' : ''}`}
            >
              <span>{currentActiveVal}</span>
              <ChevronDown className="w-4 h-4 text-zinc-500 stroke-[2]" />
            </div>

            {/* Simulated Select Dropdown overlay */}
            {isActiveSelectOpen && mode === 'play' && (
              <div className={`absolute top-[105%] left-1 right-1 z-30 bg-white dark:bg-zinc-950 border ${getThemeClass('border')} shadow-xl rounded-md max-h-48 overflow-y-auto animate-in fade-in duration-100`}>
                {selectOptions.map((opt, i) => (
                  <div
                    key={i}
                    onClick={() => handleOptionClick(opt)}
                    className={`flex items-center justify-between px-3 py-2 text-xs ${getThemeClass('bgHover')} cursor-pointer ${getThemeClass('textBody')}`}
                  >
                    <span>{opt}</span>
                    {currentActiveVal === opt && <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-white stroke-[2]" />}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      case 'avatar': {
        let sizepx = 'h-10 w-10';
        if (props.size === 'sm') sizepx = 'h-8 w-8';
        else if (props.size === 'lg') sizepx = 'h-14 w-14';

        const fallBackInitial = props.fallback || 'CN';

        return (
          <div className={`relative flex shrink-0 border ${getThemeClass('border')} overflow-hidden rounded-full select-none justify-center items-center bg-zinc-100 dark:bg-zinc-800 ${sizepx}`}>
            <img
              src={props.src || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200'}
              alt="Avatar avatar"
              referrerPolicy="no-referrer"
              className="aspect-square h-full w-full object-cover"
              onError={(e) => {
                // If image fails, convert to text view
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            {/* Fallback element */}
            <span className={`absolute flex h-full w-full items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800 text-xs font-semibold ${getThemeClass('textBody')} uppercase`}>
              {fallBackInitial}
            </span>
          </div>
        );
      }

      case 'progress': {
        return (
          <div className={`grid w-full gap-1 p-1 text-left ${getThemeClass('textBody')}`}>
            <div className={`flex justify-between text-xs font-semibold ${getThemeClass('textMuted')} select-none items-center`}>
              <span>{renderEditableText('label', 'Progress Meter', 'text-xs font-semibold')}</span>
              <span className={`font-mono ${getThemeClass('textBody')}`}>{sliderVal}%</span>
            </div>
            <div className={`w-full h-2 rounded ${getThemeClass('bgMuted')} overflow-hidden`}>
              <div 
                className={`h-full ${getThemeClass('bgActive')} rounded transition-all duration-300`} 
                style={{ width: `${sliderVal}%` }}
              />
            </div>
          </div>
        );
      }

      case 'skeleton': {
        let typeClass = 'h-5 w-full';
        if (props.type === 'circle') {
          typeClass = 'h-12 w-12 rounded-full';
        } else if (props.type === 'card') {
          typeClass = 'h-16 w-full rounded';
        }

        return (
          <div className={`w-full flex items-center justify-center p-1 bg-transparent`}>
            <div className={`animate-pulse ${getThemeClass('bgMuted')} ${typeClass}`} />
          </div>
        );
      }

      case 'separator': {
        const isVertical = props.orientation === 'vertical';
        return (
          <div className="flex items-center justify-center py-1 select-none w-full h-full">
            <div className={`${
              isVertical ? 'h-full min-h-[30px] w-[1px] mx-auto' : 'w-full h-[1px]'
            } ${getThemeClass('bgMuted')}`} />
          </div>
        );
      }

      case 'alert': {
        const isDestructive = props.variant === 'destructive';
        const containerStyle = (props.bgColor || props.textColor || props.customClass)
          ? `relative w-full p-4 text-left shadow-2xs border ${radius}`
          : `relative w-full border ${radius} p-4 text-left shadow-sm ${
              isDestructive 
                ? 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400' 
                : `${getThemeClass('border')} bg-white dark:bg-zinc-950/50 ${getThemeClass('textTitle')}`
            }`;
        
        return (
          <div className={containerStyle}>
            <div className="flex gap-3 items-start">
              {isDestructive ? (
                <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
              ) : (
                <Info className={`w-5 h-5 ${getThemeClass('textMuted')} shrink-0`} />
              )}
              <div className="space-y-1 w-full text-left">
                <h5 className="font-semibold text-sm leading-none">
                  {renderEditableText('title', 'Sandbox System Update', 'font-semibold text-sm leading-none')}
                </h5>
                <p className={`text-xs ${getThemeClass('textMuted')} leading-normal font-normal`}>
                  {renderEditableText('description', 'Provide general status indicators of the sandbox server.', 'text-xs font-normal', true)}
                </p>
              </div>
            </div>
          </div>
        );
      }

      case 'card': {
        const bgBorderClass = (props.bgColor || props.textColor || props.customClass)
          ? 'shadow-xs flex flex-col text-left overflow-hidden h-full w-full border border-transparent/10'
          : `border ${getThemeClass('border')} bg-white dark:bg-zinc-950 shadow-sm flex flex-col text-left overflow-hidden h-full w-full`;
        
        return (
          <div className={`${bgBorderClass} ${radius}`}>
            <div className={`flex flex-col space-y-1.5 p-4 md:p-6 pb-4 border-b ${getThemeClass('border')}`}>
              <h3 className={`font-bold text-lg leading-none tracking-tight ${getThemeClass('textTitle')}`}>
                {renderEditableText('title', 'Visual Widget', 'font-bold text-lg leading-none tracking-tight')}
              </h3>
              <p className={`text-xs ${getThemeClass('textMuted')} font-medium`}>
                {renderEditableText('description', 'Widget container descriptor instructions.', 'text-xs font-medium', true)}
              </p>
            </div>
            
            {/* Nested Nodes content slot */}
            <div className="p-4 md:p-6 flex-grow space-y-4">
              {children || (
                <div className={`flex flex-col items-center justify-center border-2 border-dashed ${getThemeClass('border')} p-8 rounded text-center text-xs ${getThemeClass('textMuted')}`}>
                  <Plus className="w-5 h-5 mb-2 opacity-50" />
                  <span>Drop elements inside this slot</span>
                </div>
              )}
            </div>

            {props.showFooter && (
              <div className={`px-6 py-3 border-t ${getThemeClass('border')} text-xs ${getThemeClass('textMuted')} font-medium ${getThemeClass('bgMuted')}`}>
                {renderEditableText('footerText', 'Widget update schedule info.', 'text-xs font-medium')}
              </div>
            )}
          </div>
        );
      }

      case 'calendar': {
        const days = Array.from({ length: 31 }, (_, i) => i + 1);
        const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

        const handleDayClick = (day: number) => {
          if (mode === 'play') {
            setSelectedDay(day);
          }
        };

        return (
          <div className={`border ${getThemeClass('border')} bg-white dark:bg-zinc-950 p-4 shadow-sm w-fit ${radius} select-none mx-auto text-left`}>
            <div className="flex items-center justify-between mb-4 px-1.5">
              <button className={`h-7 w-7 border ${getThemeClass('border')} rounded bg-transparent p-0 flex items-center justify-center text-xs hover:${getThemeClass('bgHover')} cursor-pointer ${getThemeClass('textTitle')}`}><b>&lt;</b></button>
              <span className={`text-sm font-semibold ${getThemeClass('textTitle')}`}>May 2026</span>
              <button className={`h-7 w-7 border ${getThemeClass('border')} rounded bg-transparent p-0 flex items-center justify-center text-xs hover:${getThemeClass('bgHover')} cursor-pointer ${getThemeClass('textTitle')}`}><b>&gt;</b></button>
            </div>
            <div className={`grid grid-cols-7 gap-1.5 text-center text-[11px] font-semibold ${getThemeClass('textMuted')} mb-2`}>
              {weekdays.map((w, i) => (
                <span key={i}>{w}</span>
              ))}
            </div>
            <div className={`grid grid-cols-7 gap-1 text-[11px] text-center font-medium ${getThemeClass('textBody')}`}>
              {/* Simulated lead days for May 2026 (starts on Friday index 5) */}
              <span className="p-1.5 text-zinc-300 dark:text-zinc-700">26</span>
              <span className="p-1.5 text-zinc-300 dark:text-zinc-700">27</span>
              <span className="p-1.5 text-zinc-300 dark:text-zinc-700">28</span>
              <span className="p-1.5 text-zinc-300 dark:text-zinc-700">29</span>
              <span className="p-1.5 text-zinc-300 dark:text-zinc-700">30</span>
              
              {days.map((day) => {
                const isSelected = selectedDay === day;
                return (
                  <span
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`p-1.5 rounded transition-all cursor-pointer flex items-center justify-center h-7 w-7 ${
                      isSelected 
                        ? `${getThemeClass('bgActive')} ${getThemeClass('textPrimaryBtn')} font-bold shadow-md` 
                        : `${getThemeClass('bgHover')} ${getThemeClass('textBody')}`
                    }`}
                  >
                    {day}
                  </span>
                );
              })}
              <span className="p-1.5 text-zinc-300 dark:text-zinc-700">1</span>
              <span className="p-1.5 text-zinc-300 dark:text-zinc-700">2</span>
            </div>
          </div>
        );
      }

      case 'table': {
        const headersList = (props.headers || 'ID, Domain, Plan, Status')
          .split(',')
          .map((h: string) => h.trim());
        const rowsList = (props.rows || 'INV-01, dev-replica.io, $120.00, Complete | INV-02, demo-zone.net, $0.00, Pending')
          .split('|')
          .filter((line: string) => line.trim())
          .map((line: string) => line.split(',').map((cell: string) => cell.trim()));

        return (
          <div className={`overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm w-full h-full text-left flex flex-col ${radius}`}>
            {props.title !== undefined && (
              <div className="p-4 border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/20">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {renderEditableText('title', 'Sandbox Database Table', 'font-bold text-sm')}
                </h4>
              </div>
            )}
            <div className="flex-grow overflow-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    {headersList.map((header, i) => (
                      <th key={i} className="h-9 px-4 text-left align-middle font-semibold whitespace-nowrap">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {rowsList.map((cells, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                      {cells.map((cell, colIdx) => (
                        <td key={colIdx} className="px-4 py-3 align-middle font-medium text-slate-700 dark:text-slate-350 whitespace-nowrap">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {rowsList.length === 0 && (
                    <tr>
                      <td colSpan={headersList.length} className="text-center py-8 text-slate-400">
                        No rows generated. Configure in panel.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );
      }

      case 'accordion': {
        const toggleAccordion = () => {
          if (mode === 'play') {
            setAccordionExpanded(!accordionExpanded);
          }
        };

        return (
          <div className="border-b border-slate-200 dark:border-slate-800 py-2.5 text-left w-full select-none">
            <button
              onClick={toggleAccordion}
              className="flex w-full items-center justify-between text-sm font-semibold py-1.5 text-slate-900 dark:text-white hover:underline cursor-pointer"
            >
              <span>{renderEditableText('title', 'Collapsible Accordion Header', 'text-sm font-semibold')}</span>
              <ChevronDown className={`w-4 h-4 text-slate-500 shrink-0 transform transition-transform duration-200 ${
                accordionExpanded ? 'rotate-180' : ''
              }`} />
            </button>
            <div className={`grid transition-all duration-200 overflow-hidden ${
              accordionExpanded ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'
            }`}>
              <div className="overflow-hidden text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                {renderEditableText('content', 'This is the expanded detail body associated with this collapsible pane toggle.', 'text-xs font-normal', true)}
              </div>
            </div>
          </div>
        );
      }

      case 'tabs': {
        const tabHeaders = (props.headers || 'Overview, Analytics, Options')
          .split(',')
          .map((t: string) => t.trim());

        const handleTabClick = (tab: string) => {
          if (mode === 'play') {
            setActiveTab(tab);
          }
        };

        return (
          <div className="w-full text-left space-y-3.5 p-1 h-full flex flex-col">
            <div className="inline-flex items-center justify-start rounded-lg bg-slate-100 dark:bg-slate-900 p-1 text-slate-500 shrink-0 overflow-x-auto max-w-full">
              {tabHeaders.map((head, i) => {
                const isSelected = activeTab === head || (!activeTab && i === 0);
                return (
                  <button
                    key={i}
                    onClick={() => handleTabClick(head)}
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold ring-offset-background transition-all hover:text-slate-900 dark:hover:text-white cursor-pointer ${
                      isSelected 
                        ? 'bg-white text-slate-950 dark:bg-slate-950 dark:text-white shadow-sm' 
                        : ''
                    }`}
                  >
                    {head}
                  </button>
                );
              })}
            </div>
            <div className={`border border-slate-200 dark:border-slate-800 p-4 ${radius} bg-white dark:bg-slate-950 shadow-sm flex-grow`}>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal font-medium">
                Showing workspace content metrics for tab: <b className="text-slate-900 dark:text-white uppercase text-[11px] font-bold block mt-1">{activeTab || tabHeaders[0]}</b>
                <span className="block mt-2 text-slate-500 border-t border-slate-100 dark:border-slate-850 pt-2 text-[11px] w-full">
                  {renderEditableText('content', 'Modify the tabs headers and documentation lists inside the property builder panel.', 'text-xs font-normal', true)}
                </span>
              </p>
            </div>
          </div>
        );
      }

      case 'dialog': {
        const toggleDialog = () => {
          if (mode === 'play') {
            setDialogOpen(!dialogOpen);
          }
        };

        if (mode === 'design') {
          return (
            <div className="border border-dashed border-slate-300 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded text-center text-xs text-slate-500 w-full select-none flex flex-col gap-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Dialog Overlay (Hidden by Default)</span>
              <div className="flex flex-col gap-2 p-1.5 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-zinc-950 mt-1 pointer-events-auto">
                <span className="font-semibold">{renderEditableText('title', 'Are you sure?', 'font-bold text-slate-900 dark:text-white')}</span>
                <span className="text-[11px] opacity-70">{renderEditableText('description', 'This is the simulated dialog state content.', 'text-xs font-normal', true)}</span>
              </div>
            </div>
          );
        }

        return (
          <div className="text-left w-full select-none">
            <button
              onClick={toggleDialog}
              className={`w-full justify-center h-9 px-4 text-xs font-semibold rounded bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex items-center cursor-pointer`}
            >
              Simulate Dialog Action popup
            </button>

            {dialogOpen && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                <main className={`w-full max-w-sm border border-slate-200 dark:border-slate-850 p-6 bg-white dark:bg-slate-950 shadow-2xl ${radius} animate-in fade-in duration-200 flex flex-col`}>
                  <h3 className="text-base font-bold text-slate-950 dark:text-white mb-2 leading-none">{props.title || 'Confirm cluster wipe?'}</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed font-medium mb-6">
                    {props.description || 'This overlay intercepts click gates to simulate administrative boundaries.'}
                  </p>
                  <div className="flex gap-2 justify-end self-end">
                    <button
                      onClick={toggleDialog}
                      className="cursor-pointer inline-flex items-center justify-center font-semibold text-xs border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-transparent rounded h-8 px-3.5 hover:bg-slate-50 dark:hover:bg-slate-900"
                    >
                      {props.cancelLabel || 'Close'}
                    </button>
                    <button
                      onClick={() => {
                        alert('✅ Executed sandbox command successfully!');
                        setDialogOpen(false);
                      }}
                      className="cursor-pointer inline-flex items-center justify-center font-semibold text-xs bg-slate-900 text-white dark:bg-white dark:text-slate-950 rounded h-8 px-4"
                    >
                      {props.confirmLabel || 'Proceed'}
                    </button>
                  </div>
                </main>
              </div>
            )}
          </div>
        );
      }

      case 'sheet': {
        const toggleSheet = () => {
          if (mode === 'play') {
            setSheetOpen(!sheetOpen);
          }
        };

        if (mode === 'design') {
          return (
            <div className="border border-dashed border-slate-300 dark:border-slate-750 bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded text-center text-xs text-slate-500 w-full select-none flex flex-col gap-1">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Sheet Slideout (Hidden by Default)</span>
              <div className="flex flex-col gap-2 p-1.5 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-zinc-950 mt-1 pointer-events-auto">
                <span className="font-semibold">{renderEditableText('title', 'Edit Profile', 'font-bold text-slate-900 dark:text-white')}</span>
                <span className="text-[11px] opacity-70">{renderEditableText('description', 'Adjust overall colors and layouts in this simulated panel setup.', 'text-xs font-normal', true)}</span>
              </div>
            </div>
          );
        }

        const isLeft = props.side === 'left';
        const positionClass = isLeft ? 'left-0 h-full w-[280px] border-r animate-in slide-in-from-left' : 'right-0 h-full w-[280px] border-l animate-in slide-in-from-right';

        return (
          <div className="text-left w-full select-none">
            <button
              onClick={toggleSheet}
              className={`w-full justify-center h-9 px-4 text-xs font-semibold rounded border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 bg-transparent flex items-center cursor-pointer hover:bg-slate-50`}
            >
              Simulate Drawer slide ({props.side || 'right'})
            </button>

            {sheetOpen && (
              <div 
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex leading-none justify-end"
                onClick={toggleSheet}
              >
                <aside 
                  className={`fixed ${positionClass} bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-850 p-6 shadow-2xl flex flex-col justify-between h-full z-50 text-left`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-950 dark:text-white leading-none mb-1">{props.title || 'Edit Profile'}</h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 leading-normal font-medium">{props.description || 'Edit configuration params.'}</p>
                    </div>
                    
                    <div className="space-y-3 pt-4">
                      {/* Simulated form inputs */}
                      <div className="grid gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Profile Username</label>
                        <input type="text" defaultValue="dev_engineer" className="text-xs border border-slate-200 dark:border-slate-800 px-2 py-1 rounded bg-transparent" />
                      </div>
                      <div className="grid gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Routing Domain</label>
                        <input type="text" defaultValue="us.nebula.run.app" className="text-xs border border-slate-200 dark:border-slate-800 px-2 py-1 rounded bg-transparent" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-6 border-t border-slate-100 dark:border-slate-900">
                    <button
                      onClick={toggleSheet}
                      className="cursor-pointer inline-flex items-center justify-center font-semibold text-xs border border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 h-8 px-4 rounded"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => setSheetOpen(false)}
                      className="cursor-pointer inline-flex items-center justify-center font-semibold text-xs bg-slate-900 text-white dark:bg-white dark:text-slate-950 h-8 px-4 rounded"
                    >
                      Save changes
                    </button>
                  </div>
                </aside>
              </div>
            )}
          </div>
        );
      }

      // LAYOUT CONTAINERS
      case 'flexRow': {
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

        return (
          <div className={`flex flex-row ${gapClass} ${alignClass} ${justifyClass} ${paddingClass} w-full h-full min-h-[50px] overflow-hidden overflow-x-auto ${props.borderStyle || 'border border-slate-100 dark:border-slate-900 rounded bg-slate-50/10 dark:bg-slate-950/10'}`}>
            {children || (
              <div className="flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 p-4 rounded text-center text-xs text-slate-400 w-full">
                <span>Row Slot: Drag items here</span>
              </div>
            )}
          </div>
        );
      }

      case 'flexCol': {
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

        return (
          <div className={`flex flex-col ${gapClass} ${alignClass} ${paddingClass} w-full h-full min-h-[50px] ${props.borderStyle || 'border border-slate-100 dark:border-slate-900 rounded bg-slate-50/10 dark:bg-slate-950/10'}`}>
            {children || (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 rounded text-center text-xs text-slate-400 w-full">
                <span>Col Slot: Drag items here</span>
              </div>
            )}
          </div>
        );
      }

      case 'breadcrumb': {
        const linksList = (props.links || 'Home, Components, Breadcrumb')
          .split(',')
          .map((t: string) => t.trim());
        
        return (
          <div className="py-1 w-full text-left">
            <Breadcrumb>
              <BreadcrumbList>
                {linksList.map((link, idx) => {
                  const isLast = idx === linksList.length - 1;
                  return (
                    <React.Fragment key={idx}>
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage>{link}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href="#" onClick={(e) => { e.preventDefault(); if (mode === 'play') alert(`Navigating to ${link}`); }}>{link}</BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                      {!isLast && <BreadcrumbSeparator />}
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        );
      }

      case 'popover': {
        return (
          <div className="py-1 w-full text-left">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  {renderEditableText('trigger', 'Configure Params', 'font-medium text-xs')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-60 p-4">
                <h4 className="font-bold text-sm text-foreground mb-1">
                  {renderEditableText('title', 'Edit Options', 'font-bold text-sm')}
                </h4>
                <p className="text-xs text-muted-foreground leading-normal">
                  {renderEditableText('description', 'Set port parameters and database details.', 'text-xs', true)}
                </p>
                {mode === 'play' && (
                  <div className="mt-3 flex gap-1 justify-end">
                    <Button size="xs" onClick={() => alert('Configuration Saved')}>Save</Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        );
      }

      case 'tooltip': {
        return (
          <div className="py-1 w-full text-left">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    {renderEditableText('trigger', 'Hover over me', 'font-medium text-xs')}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{props.content || 'This action is highly persistent and cannot be undone!'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      }

      case 'buttonGroup': {
        const btns = (props.buttons || 'Left, Middle, Right').split(',').map((b: string) => b.trim());
        return (
          <div className="flex items-center -space-x-px py-1">
            {btns.map((btn, idx) => {
              const isActive = idx === (props.activeIndex ?? 0);
              return (
                <Button
                  key={idx}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    if (mode === 'play') {
                      toastImpl.success(`Selected group option: ${btn}`);
                    }
                  }}
                  className={`rounded-none first:rounded-l-md last:rounded-r-md text-xs`}
                >
                  {btn}
                </Button>
              );
            })}
          </div>
        );
      }

      case 'inputGroup': {
        return (
          <div className="flex items-center -space-x-px w-full py-1">
            {props.prefix && (
              <span className="inline-flex items-center px-2.5 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-xs h-9">
                {props.prefix}
              </span>
            )}
            <Input
              type="text"
              disabled={mode === 'design'}
              placeholder={props.placeholder || 'github.com'}
              className="rounded-none first:rounded-l-md last:rounded-r-md flex-1 text-xs h-9"
            />
            {props.suffix && (
              <span className="inline-flex items-center px-2.5 rounded-r-md border border-l-0 border-input bg-muted text-muted-foreground text-xs h-9">
                {props.suffix}
              </span>
            )}
          </div>
        );
      }

      case 'inputOtp': {
        const len = Number(props.length ?? 6);
        const slots = Array.from({ length: len });
        return (
          <div className="py-1 flex justify-center text-left">
            <InputOTP maxLength={len} value={props.value || '123'}>
              <InputOTPGroup>
                {slots.map((_, idx) => (
                  <InputOTPSlot key={idx} index={idx} className="w-8 h-8 text-xs font-mono" />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        );
      }

      case 'nativeSelect': {
        const list = (props.options || 'United States, Canada, United Kingdom').split(',').map((o: string) => o.trim());
        return (
          <div className="grid w-full gap-1.5 p-1 text-left">
            <label className={`text-xs font-semibold leading-none ${getThemeClass('textMuted')} select-none`}>
              {props.label || 'Country Option'}
            </label>
            <select
              disabled={mode === 'design'}
              className={`flex h-9 w-full ${radius} border border-input bg-transparent px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring`}
            >
              {list.map((opt, idx) => (
                <option key={idx} value={opt} className="bg-background text-foreground text-xs">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        );
      }

      case 'combobox': {
        const list = (props.options || 'Next.js, React, Remix, Svelte, Vue').split(',').map((f: string) => f.trim());
        return (
          <div className="py-1 w-full text-left">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-full text-xs justify-between font-normal">
                  <span>{props.selected || 'Select option...'}</span>
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-52 p-0">
                <Command className="p-1">
                  <CommandInput placeholder={props.placeholder || 'Search options...'} className="h-8 text-xs" />
                  <CommandList className="max-h-[160px] overflow-y-auto">
                    <CommandEmpty className="py-2 text-center text-xs">No options found.</CommandEmpty>
                    <CommandGroup>
                      {list.map((framework, idx) => (
                        <CommandItem
                          key={idx}
                          value={framework}
                          onSelect={() => {
                            if (mode === 'play') {
                              toastImpl.success(`Selected option: ${framework}`);
                            }
                          }}
                          className="flex items-center justify-between text-xs cursor-pointer p-1.5 hover:bg-muted font-medium"
                        >
                          <span>{framework}</span>
                          {props.selected === framework && <Check className="h-3 w-3 text-primary-foreground" />}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        );
      }

      case 'toggle': {
        return (
          <div className="py-1 text-left">
            <Toggle
              defaultPressed={!!props.isActive}
              onPressedChange={(pressed) => {
                if (mode === 'play') {
                  toastImpl.info(`Toggle state changed: ${pressed}`);
                }
              }}
              className="text-xs"
            >
              {props.label || 'Bold Text'}
            </Toggle>
          </div>
        );
      }

      case 'toggleGroup': {
        const list = (props.options || 'Left, Center, Right, Justify').split(',').map((o: string) => o.trim());
        return (
          <div className="py-1 text-left">
            <ToggleGroup type="single" defaultValue={props.selected} className="justify-start gap-1">
              {list.map((opt, idx) => (
                <ToggleGroupItem
                  value={opt}
                  key={idx}
                  className="text-xs px-2.5 h-8 font-normal cursor-pointer"
                  onClick={() => {
                    if (mode === 'play') {
                      toastImpl.success(`Toggle Group component active: ${opt}`);
                    }
                  }}
                >
                  {opt}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        );
      }

      case 'kbd': {
        return (
          <kbd className="inline-flex items-center h-5 select-none rounded border border-input bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground leading-none">
            {props.text || '⌘K'}
          </kbd>
        );
      }

      case 'spinner': {
        const sizeMap: Record<string, string> = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
        const spinSize = sizeMap[props.size] || 'h-8 w-8';
        const colorMap: Record<string, string> = {
          muted: 'text-muted-foreground',
          zinc: 'text-zinc-500 dark:text-zinc-400',
          primary: 'text-primary',
          sky: 'text-sky-500 dark:text-sky-450',
          blue: 'text-blue-600 dark:text-blue-400',
          indigo: 'text-indigo-600 dark:text-indigo-400',
          purple: 'text-purple-600 dark:text-purple-400',
          violet: 'text-violet-600 dark:text-violet-400',
          pink: 'text-pink-600 dark:text-pink-400',
          red: 'text-red-600 dark:text-red-400',
          orange: 'text-orange-500 dark:text-orange-400',
          amber: 'text-amber-500 dark:text-amber-400',
          yellow: 'text-yellow-500 dark:text-yellow-400',
          green: 'text-green-600 dark:text-green-400',
          emerald: 'text-emerald-500 dark:text-emerald-400',
          teal: 'text-teal-500 dark:text-teal-400',
        };
        const colorClass = colorMap[props.color] || 'text-muted-foreground';
        return (
          <div className="flex items-center justify-center py-2 h-full w-full">
            <Loader2 className={`animate-spin ${colorClass} ${spinSize}`} />
          </div>
        );
      }

      case 'typography': {
        const text = props.text || 'Visual Design Engine Framework';
        const variant = props.variant || 'h2';

        if (variant === 'h1') {
          return <h1 className="text-2xl font-extrabold tracking-tight text-foreground leading-none text-left">{text}</h1>;
        } else if (variant === 'h2') {
          return <h2 className="text-xl font-bold tracking-tight text-foreground/90 pb-1 border-b border-muted leading-tight text-left">{text}</h2>;
        } else if (variant === 'h3') {
          return <h3 className="text-lg font-semibold tracking-tight text-foreground/80 leading-normal text-left">{text}</h3>;
        } else if (variant === 'lead') {
          return <p className="text-base text-muted-foreground leading-relaxed text-left">{text}</p>;
        } else if (variant === 'code') {
          return <code className="relative rounded bg-muted px-[0.3rem] py-[0.15rem] font-mono text-sm font-semibold select-all">{text}</code>;
        }
        return <p className="text-sm text-foreground/75 leading-normal text-left">{text}</p>;
      }

      case 'emptyState': {
        return (
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-input rounded-lg text-center w-full h-full min-h-[140px] bg-background/5 text-left">
            <Info className="h-7 w-7 text-muted-foreground mb-2" />
            <span className="font-bold text-sm text-foreground mb-1">{props.title || 'No items created yet'}</span>
            <p className="text-xs text-muted-foreground max-w-[280px] leading-relaxed mb-3">
              {props.description || 'Get started by creating your first cluster configurations.'}
            </p>
            <Button size="xs" onClick={() => { if (mode === 'play') toastImpl.info('Simulated setup action triggered!'); }}>
              {props.buttonLabel || 'Add Node Server'}
            </Button>
          </div>
        );
      }

      case 'fieldContainer': {
        return (
          <div className="grid w-full gap-1 p-2 border border-input/40 rounded bg-muted/5 text-left">
            <h4 className="text-xs font-semibold text-foreground leading-none flex items-center gap-1.5">
              <span>{props.label || 'Security Settings passphrase'}</span>
              <span className="text-destructive font-mono text-[9px]">*</span>
            </h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              {props.description || 'Used for signing overall environment credentials.'}
            </p>
            <div className="h-8 rounded bg-muted/60 dark:bg-muted/30 border border-input border-dashed flex items-center px-2 text-[10px] text-slate-400 font-mono">
              [ Field visual injection area ]
            </div>
            {props.helper && (
              <span className="text-[9px] text-slate-400 font-medium leading-none mt-0.5">
                ✦ Helper: {props.helper}
              </span>
            )}
          </div>
        );
      }

      case 'listItem': {
        return (
          <div className="flex items-start justify-between p-3 border border-input rounded-lg bg-background/20 shadow-sm w-full text-left">
            <div className="grid gap-1 flex-1 min-w-0 pr-2">
              <span className="font-bold text-xs text-foreground truncate">{props.title || 'Enable VPC Encryption'}</span>
              <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">
                {props.description || 'Automatically route internal calls securely with wireguard endpoints.'}
              </p>
            </div>
            {props.meta && (
              <Badge variant="outline" className="text-[9px] h-4.5 px-1.5 shrink-0 whitespace-nowrap self-center bg-muted/50 border-input/60">
                {props.meta}
              </Badge>
            )}
          </div>
        );
      }

      case 'datePicker': {
        return (
          <div className="grid w-full gap-1.5 p-1 text-left">
            {props.label && (
              <label className={`text-xs font-semibold leading-none ${getThemeClass('textMuted')} select-none`}>
                {props.label}
              </label>
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={mode === 'design'}
              onClick={() => {
                if (mode === 'play') {
                  toastImpl.success(`Calendar active date: ${props.selectedDate || '2026-05-20'}`);
                }
              }}
              className="w-full text-xs justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-70" />
              <span>{props.selectedDate || '2026-05-20'}</span>
            </Button>
          </div>
        );
      }

      case 'direction': {
        const isRtl = props.dir === 'rtl';
        return (
          <div className="py-1 text-left">
            <div className="flex items-center space-x-2 text-xs border border-input rounded-md px-2.5 py-1.5 max-w-xs bg-muted/10 leading-none h-9 justify-between">
              <span className="text-muted-foreground font-medium">Text Layout alignment:</span>
              <Badge variant="secondary" className="font-mono text-[9px] uppercase tracking-wider px-1">
                {isRtl ? 'RTL ⟵' : 'LTR ⟶'}
              </Badge>
            </div>
          </div>
        );
      }

      case 'alertDialog': {
        return (
          <div className="py-1 text-left">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="w-full text-xs">
                  {props.title || 'Launch Alert Gate'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="w-80 max-w-sm p-5">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-sm font-bold">{props.title || 'Are you absolutely sure?'}</AlertDialogTitle>
                  <AlertDialogDescription className="text-xs leading-normal leading-relaxed text-muted-foreground">
                    {props.description || 'This is highly destructive and cannot be unsaved.'}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-4 gap-1 flex sm:justify-end">
                  <AlertDialogCancel variant="outline" size="sm" className="text-xs h-8 px-3 rounded">{props.cancelLabel || 'Cancel'}</AlertDialogCancel>
                  <AlertDialogAction
                    className="text-xs h-8 px-3 rounded bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={() => {
                      if (mode === 'play') toastImpl.error('Action executed successfully! Content purged.');
                    }}
                  >
                    {props.confirmLabel || 'Proceed'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        );
      }

      case 'dataTable': {
        const listHeaders = (props.headers || 'Key, Value').split(',').map((h: string) => h.trim());
        const listRows = (props.rows || '').split('|').map((r: string) => r.split(',').map((c: string) => c.trim()));
        return (
          <div className="w-full py-1 text-left">
            <div className="rounded-lg border border-input overflow-hidden bg-background shadow-xs">
              {props.title && (
                <div className="bg-muted/15 px-3.5 py-2.5 border-b border-input">
                  <span className="font-bold text-[11px] tracking-tight uppercase text-muted-foreground">{props.title}</span>
                </div>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-input bg-muted/30 font-medium text-muted-foreground h-8">
                      {listHeaders.map((head, idx) => (
                        <th key={idx} className="px-3.5 text-[10px] font-bold tracking-wider uppercase">{head}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {listRows.map((row, rowIdx) => (
                      <tr key={rowIdx} className="border-b border-input last:border-0 hover:bg-muted/5 h-8">
                        {row.map((cell, cellIdx) => (
                          <td key={cellIdx} className="px-3.5 text-foreground/80 font-medium text-[11px] truncate max-w-[200px]">{cell || '-'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      }

      case 'drawer': {
        return (
          <div className="py-1 text-left">
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="outline" size="sm" className="w-full text-xs">
                  Menu Panel Bottom Drawer
                </Button>
              </DrawerTrigger>
              <DrawerContent className="p-4 rounded-t-xl max-w-sm mx-auto">
                <DrawerHeader className="p-1">
                  <DrawerTitle className="text-sm font-bold text-foreground">
                    {props.title || 'Quick Actions Bar'}
                  </DrawerTitle>
                  <DrawerDescription className="text-xs text-muted-foreground">
                    {props.description || 'Configure layout settings, restart services, or export code bundle.'}
                  </DrawerDescription>
                </DrawerHeader>
                <div className="py-4 space-y-2">
                  <div className="p-3 border rounded border-border flex justify-between items-center text-xs">
                    <span>Reboot Server Replicas</span>
                    <Button size="xs" onClick={() => { if (mode === 'play') toastImpl.success('Server reboot sequences initiated!'); }}>Trigger</Button>
                  </div>
                </div>
                <DrawerFooter className="p-1 gap-1 flex justify-end">
                  <DrawerClose asChild>
                    <button className="inline-flex items-center justify-center rounded-md border border-input bg-transparent hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-100 px-3.5 py-1 text-xs font-semibold h-8 select-none cursor-pointer">Close Panel</button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        );
      }

      case 'command': {
        const groups = (props.groups || 'Suggestions, Settings').split(',').map((g: string) => g.trim());
        const items = (props.items || 'Search nodes, Set color theme, Invite colleagues, Clear active layout')
          .split(',')
          .map((i: string) => i.trim());
        return (
          <div className="w-full text-left py-1">
            <div className="rounded-lg border border-input shadow-sm bg-background overflow-hidden p-1 max-w-xs">
              <Command className="rounded-lg">
                <CommandInput placeholder={props.placeholder || 'Type command search...'} className="h-8 text-xs border-0 focus-visible:ring-0" />
                <CommandList className="max-h-[140px] overflow-y-auto">
                  <CommandEmpty className="py-2 text-center text-xs">No shortcuts located.</CommandEmpty>
                  {groups.map((group, groupIdx) => (
                    <CommandGroup key={groupIdx} heading={group} className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase px-1.5 py-1">
                      {items.slice(groupIdx * 2, (groupIdx + 1) * 2).map((item, itemIdx) => (
                        <CommandItem
                          key={itemIdx}
                          onSelect={() => {
                            if (mode === 'play') toastImpl.info(`Fired command shortcut: ${item}`);
                          }}
                          className="flex items-center text-xs rounded p-1.5 hover:bg-muted font-medium cursor-pointer"
                        >
                          <span>{item}</span>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  ))}
                </CommandList>
              </Command>
            </div>
          </div>
        );
      }

      case 'contextMenu': {
        const listItems = (props.items || 'Back, Reload widget, Export designs, Clear container nodes')
          .split(',')
          .map((i: string) => i.trim());
        return (
          <div className="py-1 text-left w-full h-full">
            <ContextMenu>
              <ContextMenuTrigger className="flex h-10 w-full items-center justify-center rounded-md border border-dashed border-input bg-muted/5 text-xs text-muted-foreground select-none">
                {props.trigger || 'Right-click coordinates area'}
              </ContextMenuTrigger>
              <ContextMenuContent className="w-44 p-1">
                {listItems.map((item, idx) => (
                  <ContextMenuItem
                    key={idx}
                    onClick={() => {
                      if (mode === 'play') toastImpl.info(`Invoked action from context-menu: ${item}`);
                    }}
                    className="text-xs p-1.5 rounded hover:bg-muted cursor-pointer"
                  >
                    {item}
                  </ContextMenuItem>
                ))}
              </ContextMenuContent>
            </ContextMenu>
          </div>
        );
      }

      case 'dropdownMenu': {
        const listItems = (props.items || 'Profile preferences, Active billing, Generate JSON, Terminate session')
          .split(',')
          .map((i: string) => i.trim());
        return (
          <div className="py-1 text-left">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="w-full text-xs justify-between gap-2">
                  <span>{props.trigger || 'Dropdown Actions'}</span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 p-1">
                {listItems.map((item, idx) => {
                  const isDestructive = item.toLowerCase().includes('terminate') || item.toLowerCase().includes('delete');
                  return (
                    <DropdownMenuItem
                      key={idx}
                      onClick={() => {
                        if (mode === 'play') {
                          if (isDestructive) toastImpl.error(`Triggered warnings for: ${item}`);
                          else toastImpl.success(`Simulated dropdown clicked: ${item}`);
                        }
                      }}
                      className={`text-xs p-1.5 rounded cursor-pointer ${isDestructive ? 'text-destructive focus:bg-destructive/10' : 'hover:bg-muted'}`}
                    >
                      {item}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      }

      case 'menubar': {
        const menus = (props.menus || 'File, Edit, Selection, View, Help').split(',').map((m: string) => m.trim());
        return (
          <div className="py-1 w-full text-left">
            <Menubar className="border border-input rounded-md max-w-full justify-start h-9 p-1">
              {menus.map((menu, idx) => (
                <MenubarMenu key={idx}>
                  <MenubarTrigger
                    onClick={() => {
                      if (mode === 'play') toastImpl.info(`Menubar expansion active: ${menu}`);
                    }}
                    className="text-[11px] font-semibold px-2 cursor-pointer rounded hover:bg-muted"
                  >
                    {menu}
                  </MenubarTrigger>
                </MenubarMenu>
              ))}
            </Menubar>
          </div>
        );
      }

      case 'navigationMenu': {
        const trigger = props.trigger || 'Products';
        const items = (props.items || 'AI Copilot, VPC secure, Global Sync').split(',').map((it: string) => it.trim());
        return (
          <div className="py-1 text-left w-full">
            <NavigationMenu className="border border-input/60 rounded px-1 max-w-full">
              <NavigationMenuList className="flex items-center h-8">
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    onClick={() => {
                      if (mode === 'play') toastImpl.info(`Opened navigation triggers panel for: ${trigger}`);
                    }}
                    className="text-xs px-2 cursor-pointer h-7 rounded hover:bg-muted"
                  >
                    {trigger}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="p-2 border rounded bg-background shadow-md">
                    <ul className="grid w-48 gap-1">
                      {items.map((item, idx) => (
                        <li key={idx}>
                          <NavigationMenuLink asChild>
                            <a
                              href="#"
                              onClick={(e) => { e.preventDefault(); if (mode === 'play') toastImpl.success(`Navigating to ${item}`); }}
                              className="block select-none rounded p-2 text-xs leading-none no-underline outline-none transition-colors hover:bg-muted hover:text-accent-foreground"
                            >
                              <div className="font-medium text-foreground">{item}</div>
                              <p className="line-clamp-2 text-[10px] leading-snug text-muted-foreground mt-0.5">Explore standard specifications.</p>
                            </a>
                          </NavigationMenuLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        );
      }

      case 'pagination': {
        const current = props.currentPage ?? 3;
        const total = props.totalPages ?? 10;
        return (
          <div className="py-1 w-full text-center">
            <Pagination>
              <PaginationContent className="flex items-center gap-1">
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => { e.preventDefault(); if (mode === 'play' && current > 1) toastImpl.info(`Going to Page ${current - 1}`); }}
                    className="h-8 text-xs cursor-pointer"
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="text-xs font-semibold px-2">Page {current} of {total}</span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => { e.preventDefault(); if (mode === 'play' && current < total) toastImpl.info(`Going to Page ${current + 1}`); }}
                    className="h-8 text-xs cursor-pointer"
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        );
      }

      case 'hoverCard': {
        return (
          <div className="py-1 text-left">
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button variant="link" className="px-0 text-xs font-semibold hover:underline">
                  {props.triggerText || '@radix_ui_framework'}
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-64 p-3.5">
                <div className="flex justify-between space-x-2 text-left">
                  <div className="space-y-1.5">
                    <h4 className="text-xs font-bold">{props.title || 'Radix Primitives'}</h4>
                    <p className="text-[10.5px] text-muted-foreground leading-normal font-medium leading-relaxed">
                      {props.description || 'An open-source clean implementation of accessible React elements built for everyone.'}
                    </p>
                    <div className="flex items-center pt-1">
                      <span className="text-[9px] text-muted-foreground font-mono">
                        {props.joined || 'Joined December 2021'}
                      </span>
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        );
      }

      case 'resizable': {
        return (
          <div className="py-1 w-full h-full min-h-[90px] border border-input rounded-lg overflow-hidden bg-background">
            <ResizablePanelGroup direction="horizontal" className="h-full w-full">
              <ResizablePanel defaultSize={40} className="p-3 bg-muted/10">
                <span className="text-[10px] font-semibold text-muted-foreground leading-tight truncate block">
                  {props.leftLabel || 'Primary Sidebar Sidebar Navigation'}
                </span>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={60} className="p-3 bg-background">
                <span className="text-[10px] font-semibold text-foreground truncate block">
                  {props.rightLabel || 'Core Visual Terminal View'}
                </span>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        );
      }

      case 'aspectRatio': {
        const ratioText = props.ratio || '16/9';
        const ratioMap: Record<string, number> = { '16/9': 16 / 9, '4/3': 4 / 3, '1/1': 1 };
        const ratioVal = ratioMap[ratioText] || 16/9;
        return (
          <div className="py-1 w-full text-left">
            <div className="border border-input overflow-hidden rounded-lg bg-muted/20">
              <AspectRatio ratio={ratioVal}>
                <img
                  src={props.imageSrc || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600'}
                  alt="Aspect Preview image"
                  referrerPolicy="no-referrer"
                  className="rounded-md object-cover w-full h-full opacity-90"
                />
              </AspectRatio>
            </div>
          </div>
        );
      }

      case 'carousel': {
        const slides = (props.slides || 'First Slide, Second Slide, Third Slide').split(',').map((s: string) => s.trim());
        return (
          <div className="py-1 w-full flex items-center justify-center">
            <Carousel className="w-full max-w-[210px]">
              <CarouselContent>
                {slides.map((slide, index) => (
                  <CarouselItem key={index} className="flex flex-col items-center justify-center p-4 bg-muted/15 rounded-lg border border-input text-center h-20">
                    <span className="text-xs font-bold text-foreground leading-tight">{slide}</span>
                    <span className="text-[9px] text-muted-foreground mt-1">Slide {index + 1} of {slides.length}</span>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex gap-1.5 justify-end mt-1.5 pr-1">
                <CarouselPrevious className="relative h-6 w-6 rounded-md left-0 translate-y-0" />
                <CarouselNext className="relative h-6 w-6 rounded-md right-0 translate-y-0" />
              </div>
            </Carousel>
          </div>
        );
      }

      case 'chart': {
        const dataset = (props.dataPoints || 'Mon, 40 | Tue, 60 | Wed, 45 | Thu, 80 | Fri, 55 | Sat, 90')
          .split('|')
          .map((pt: string) => {
            const parts = pt.split(',');
            return { name: (parts[0] || '').trim(), value: Number(parts[1] || '0') };
          });
        return (
          <div className="w-full py-1 text-left">
            <div className="rounded-lg border border-input bg-background/50 shadow-xs p-3">
              {props.title && <h4 className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground mb-2">{props.title}</h4>}
              <div className="flex items-end justify-between h-20 gap-1 pt-2 border-b border-input">
                {dataset.map((pt, idx) => {
                  const maxVal = Math.max(...dataset.map(d => d.value), 1);
                  const pctHeight = (pt.value / maxVal) * 100;
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group/bar">
                      <div
                        style={{ height: `${pctHeight}%` }}
                        className={`w-full rounded-t-sm transition-all duration-300 ${props.type === 'area' ? 'bg-primary/20 hover:bg-primary/30 border-t-2 border-primary' : props.type === 'line' ? 'h-0.5 w-full bg-primary relative before:absolute before:size-1.5 before:rounded-full before:bg-primary before:-top-[2px] before:left-1/2' : 'bg-primary/80 hover:bg-primary'}`}
                      />
                      <span className="text-[9px] text-muted-foreground text-center font-mono mt-1 truncate max-w-full">{pt.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      }

      case 'collapsible': {
        return (
          <div className="py-1 w-full text-left">
            <Collapsible className="w-full border border-input rounded-md p-2">
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-foreground leading-tight">{props.title || 'View environment params'}</span>
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <div className="rounded bg-muted/80 p-2 font-mono text-[10px] leading-relaxed text-muted-foreground">
                  {(props.content || 'DATABASE_REPLICAS=3 | VPC_SECURE_TUNNEL=true').split('|').map((line: string, idx: number) => (
                    <div key={idx}>{line.trim()}</div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        );
      }

      case 'scrollArea': {
        const lines = (props.content || 'Initializing...').split('|');
        return (
          <div className="py-1 w-full text-left h-24">
            <ScrollArea className="h-full border border-input rounded-lg p-2.5 bg-muted/5 font-mono text-[10px]">
              <div className="space-y-1.5">
                {lines.map((line: string, idx: number) => (
                  <div key={idx} className="truncate select-none text-slate-500 hover:text-foreground">
                    ✦ {line.trim()}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        );
      }

      case 'sidebar': {
        const items = (props.items || '📁 Files Explorer, 🛡️ Keys, 💬 Help').split(',').map((it: string) => it.trim());
        return (
          <div className="py-1 w-full h-full min-h-[160px] border border-input rounded-lg bg-background overflow-hidden text-left shadow-sm">
            <aside className="w-full h-full flex flex-col bg-muted/20 border-r border-input p-2.5">
              <h4 className="font-bold text-[10.5px] uppercase tracking-wider text-muted-foreground border-b border-input/50 pb-1.5 mb-2">
                {props.title || 'Control Center'}
              </h4>
              <nav className="flex-1 space-y-1">
                {items.map((it, idx) => (
                  <div
                    key={idx}
                    onClick={() => { if (mode === 'play') toastImpl.info(`Clicked sidebar tab: ${it}`); }}
                    className="flex h-7.5 items-center px-1.5 py-1 text-xs font-semibold rounded text-foreground/80 hover:bg-muted select-none cursor-pointer leading-none transition-all"
                  >
                    <span>{it}</span>
                  </div>
                ))}
              </nav>
            </aside>
          </div>
        );
      }

      case 'sonner': {
        return (
          <div className="py-1 text-left">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-semibold"
              onClick={() => {
                if (mode === 'play') {
                  toastImpl.success(props.title || 'Action completed successfully!', {
                    description: props.description || 'All configurations set on local workspace.',
                  });
                }
              }}
            >
              {props.label || 'Trigger Toast Alert'}
            </Button>
          </div>
        );
      }

      case 'toast': {
        return (
          <div className="py-1 text-left">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-semibold"
              onClick={() => {
                if (mode === 'play') {
                  toastImpl.warning(props.title || 'Action warning alert!', {
                    description: props.description || 'Ensure all parameters compile successfully.',
                  });
                }
              }}
            >
              {props.label || 'Trigger Warning Toast'}
            </Button>
          </div>
        );
      }

      case 'gridShell': {
        const colMap: Record<string, string> = {
          '1': 'grid-cols-1',
          '2': 'grid-cols-2',
          '3': 'grid-cols-3',
          '4': 'grid-cols-4',
        };
        const gridColClass = colMap[props.columns] || 'grid-cols-3';

        const gapMap: Record<string, string> = { '2': 'gap-2', '4': 'gap-4', '6': 'gap-6', '8': 'gap-8' };
        const gapClass = gapMap[props.gap] || 'gap-4';

        const padMap: Record<string, string> = { '0': 'p-0', '2': 'p-2', '4': 'p-4', '6': 'p-6' };
        const paddingClass = padMap[props.padding] || 'p-0';

        return (
          <div className={`grid ${gridColClass} ${gapClass} ${paddingClass} w-full h-full min-h-[50px] ${props.borderStyle || ''}`}>
            {children || (
              <div className="col-span-full flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 p-8 rounded text-center text-xs text-slate-400 w-full">
                <span>Grid shell: Drag items here</span>
              </div>
            )}
          </div>
        );
      }

      default:
        return <div>Unhandled widget: {node.type}</div>;
    }
  };

  // Prevent absolute node layout wrapping if inside container
  const isNested = !!node.parentId;

  // Accumulate ancestor path for granular parent container selection
  const ancestors: CanvasNode[] = [];
  if (allNodes) {
    let currentParentId = node.parentId;
    while (currentParentId) {
      const p = allNodes.find((n) => n.id === currentParentId);
      if (p) {
        ancestors.unshift(p);
        currentParentId = p.parentId;
      } else {
        break;
      }
    }
  }

  // Render element wrapper
  return (
    <div
      onMouseDown={(e) => {
        if (mode === 'design') {
          e.stopPropagation();
          onSelect(e);
        }
      }}
      onClick={(e) => {
        if (mode === 'design') {
          e.stopPropagation();
        }
      }}
      className={`relative select-none ${
        mode === 'design' 
          ? `group/node transition-shadow ${
              isSelected 
                ? 'ring-1.5 ring-zinc-800 dark:ring-white shadow-xs ring-offset-2 dark:ring-offset-[#09090b]' 
                : 'hover:ring-1 hover:ring-zinc-300 dark:hover:ring-zinc-800'
            }` 
          : ''
      } ${
        isNested ? 'w-full h-auto' : ''
      }`}
      style={isNested ? undefined : {
        position: 'absolute',
        left: `${node.x}px`,
        top: `${node.y}px`,
        width: node.width ? `${node.width}px` : 'auto',
        height: node.height ? `${node.height}px` : 'auto',
        zIndex: isSelected ? 10 : 1,
      }}
    >
      {/* Design-only control helpers */}
      {mode === 'design' && isSelected && (
        <div className="absolute -top-7 left-0 right-0 h-6 bg-zinc-950 text-white dark:bg-white dark:text-black rounded-xs flex items-center justify-between px-1.5 shadow-xs z-[12] text-[10px] uppercase font-bold animate-in slide-in-from-bottom duration-150 pointer-events-auto">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-none pr-2 max-w-[70%] text-[9px] font-mono lowercase">
            {ancestors.map((anc) => (
              <React.Fragment key={anc.id}>
                <button
                  type="button"
                  title={`Select parent container: ${anc.type}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectNodeIds?.([anc.id]);
                  }}
                  className="hover:underline opacity-65 hover:opacity-100 cursor-pointer text-current border-0 bg-transparent px-0.5 tracking-wide text-[9px] uppercase font-bold"
                >
                  {anc.type}
                </button>
                <span className="opacity-40">/</span>
              </React.Fragment>
            ))}
            <span className="truncate tracking-wide text-blue-500 dark:text-blue-400 font-bold uppercase">{node.type}</span>
          </div>
          <div className="flex items-center gap-1">
            {isNested && (
              <>
                <button
                  type="button"
                  title="Move element up in listing order"
                  onClick={(e) => { e.stopPropagation(); onMoveUp?.(node.id); }}
                  className="p-0.5 hover:bg-zinc-850 dark:hover:bg-zinc-100 rounded-xs active:scale-95 cursor-pointer border-0 bg-transparent text-current"
                >
                  <MoveUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  title="Move element down in listing order"
                  onClick={(e) => { e.stopPropagation(); onMoveDown?.(node.id); }}
                  className="p-0.5 hover:bg-zinc-850 dark:hover:bg-zinc-100 rounded-xs active:scale-95 cursor-pointer border-0 bg-transparent text-current"
                >
                  <MoveDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="Detach element from parent"
                  onClick={(e) => { e.stopPropagation(); onDetach?.(node.id); }}
                  className="p-0.5 hover:bg-zinc-850 dark:hover:bg-zinc-100 rounded-xs text-yellow-550 dark:text-yellow-600 active:scale-95 cursor-pointer border-0 bg-transparent"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            <button
              type="button"
              title="Duplicate element"
              onClick={(e) => { e.stopPropagation(); onDuplicate?.(node.id); }}
              className="p-0.5 hover:bg-zinc-850 dark:hover:bg-zinc-100 rounded-xs active:scale-95 cursor-pointer border-0 bg-transparent text-current"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              type="button"
              title="Delete element"
              onClick={(e) => { e.stopPropagation(); onDelete?.(node.id); }}
              className="p-0.5 hover:bg-red-500 hover:text-white rounded-xs active:scale-95 cursor-pointer border-0 bg-transparent text-[#ff5f56]"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Actual Content Render bounds */}
      <div className={`w-full h-full relative ${mode === 'design' ? 'pointer-events-none' : ''} ${getCustomStyleOverrides()}`}>
        {renderContent()}
      </div>

      {/* Resize indicator visualization helper overlay */}
      {mode === 'design' && isSelected && !isNested && (
        <div
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onResizeStart?.(e);
          }}
          className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-zinc-950 dark:bg-white border border-[#fafafa] dark:border-[#09090b] rounded-full cursor-se-resize z-[30] shadow-md flex items-center justify-center hover:scale-125 active:scale-95 transition-transform"
        />
      )}
    </div>
  );
};
