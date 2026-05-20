/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ComponentType =
  // Basic Elements
  | 'button'
  | 'input'
  | 'textarea'
  | 'badge'
  | 'switch'
  | 'slider'
  | 'checkbox'
  | 'radioGroup'
  | 'label'
  | 'select'
  | 'avatar'
  | 'progress'
  | 'skeleton'
  | 'separator'
  // Blocks
  | 'card'
  | 'alert'
  | 'calendar'
  | 'table'
  | 'accordion'
  | 'tabs'
  | 'dialog'
  | 'sheet'
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
