/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ComponentType =
  // Basic Elements & Forms
  | 'button'
  | 'buttonGroup'
  | 'input'
  | 'inputGroup'
  | 'inputOtp'
  | 'textarea'
  | 'badge'
  | 'switch'
  | 'slider'
  | 'checkbox'
  | 'radioGroup'
  | 'label'
  | 'select'
  | 'nativeSelect'
  | 'combobox'
  | 'avatar'
  | 'progress'
  | 'skeleton'
  | 'separator'
  | 'breadcrumb'
  | 'popover'
  | 'tooltip'
  | 'toggle'
  | 'toggleGroup'
  | 'kbd'
  | 'spinner'
  // Blocks & Complex Structure
  | 'card'
  | 'alert'
  | 'alertDialog'
  | 'calendar'
  | 'table'
  | 'dataTable'
  | 'accordion'
  | 'tabs'
  | 'dialog'
  | 'sheet'
  | 'drawer'
  | 'command'
  | 'contextMenu'
  | 'dropdownMenu'
  | 'menubar'
  | 'navigationMenu'
  | 'pagination'
  | 'hoverCard'
  | 'resizable'
  | 'scale' // Aspect Ratio
  | 'aspectRatio'
  | 'carousel'
  | 'chart'
  | 'collapsible'
  | 'scrollArea'
  | 'sidebar'
  | 'sonner'
  | 'toast'
  | 'emptyState'
  | 'fieldContainer'
  | 'listItem'
  | 'typography'
  | 'datePicker'
  | 'direction'
  // Layout Shells (Nesting Containers)
  | 'flexRow'
  | 'flexCol'
  | 'gridShell';

export interface CanvasNode {
  id: string;
  type: ComponentType;
  x: number;
  y: number;
  width?: number;
  height?: number;
  parentId?: string; // If nested in a shell/card
  properties: Record<string, any>;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export type BaseColor = 'zinc' | 'slate' | 'neutral' | 'stone';
export type RadiusOption = 'none' | 'sm' | 'md' | 'lg' | 'full';

export interface ThemeSettings {
  baseColor: BaseColor;
  darkMode: boolean;
  radius: RadiusOption;
}

export interface ToolItem {
  type: ComponentType;
  name: string;
  category: 'Elements' | 'Overlays' | 'Layout Shells';
  description: string;
  defaultProperties: Record<string, any>;
  defaultWidth?: number;
  defaultHeight?: number;
}
