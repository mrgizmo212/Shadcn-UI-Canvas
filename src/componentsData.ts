/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ToolItem, CanvasNode } from './types';

export const TOOL_ITEMS: ToolItem[] = [
  // ELEMENTS
  {
    type: 'button',
    name: 'Button',
    category: 'Elements',
    description: 'Trigger actions with custom style variants.',
    defaultProperties: {
      label: 'Click Me',
      variant: 'default', // 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive'
      size: 'default', // 'sm' | 'default' | 'lg'
      disabled: false,
    },
    defaultWidth: 120,
    defaultHeight: 40,
  },
  {
    type: 'input',
    name: 'Input',
    category: 'Elements',
    description: 'A single-line input field.',
    defaultProperties: {
      label: 'Email',
      placeholder: 'user@example.com',
      value: '',
      type: 'email',
    },
    defaultWidth: 260,
    defaultHeight: 70,
  },
  {
    type: 'textarea',
    name: 'Textarea',
    category: 'Elements',
    description: 'A multi-line text area block.',
    defaultProperties: {
      label: 'Detailed Feedback',
      placeholder: 'Type your message here...',
      value: '',
    },
    defaultWidth: 260,
    defaultHeight: 110,
  },
  {
    type: 'badge',
    name: 'Badge',
    category: 'Elements',
    description: 'Small status count or pill indicator.',
    defaultProperties: {
      label: 'New Update',
      variant: 'default', // 'default' | 'secondary' | 'outline' | 'destructive'
    },
    defaultWidth: 100,
    defaultHeight: 24,
  },
  {
    type: 'switch',
    name: 'Switch',
    category: 'Elements',
    description: 'An interactive toggle control.',
    defaultProperties: {
      label: 'Enable Autofill',
      checked: true,
    },
    defaultWidth: 200,
    defaultHeight: 32,
  },
  {
    type: 'slider',
    name: 'Slider',
    category: 'Elements',
    description: 'Adjust quantitative values.',
    defaultProperties: {
      label: 'Opacity Percentage',
      value: 75,
      min: 0,
      max: 100,
    },
    defaultWidth: 240,
    defaultHeight: 48,
  },
  {
    type: 'checkbox',
    name: 'Checkbox',
    category: 'Elements',
    description: 'Checkbox for form listings.',
    defaultProperties: {
      label: 'Accept terms and privacy policy',
      checked: false,
    },
    defaultWidth: 260,
    defaultHeight: 24,
  },
  {
    type: 'radioGroup',
    name: 'Radio Group',
    category: 'Elements',
    description: 'Set of exclusive selection options.',
    defaultProperties: {
      label: 'Choose plan tier:',
      options: 'Starter, Professional, Enterprise',
      selected: 'Professional',
    },
    defaultWidth: 220,
    defaultHeight: 100,
  },
  {
    type: 'select',
    name: 'Select',
    category: 'Elements',
    description: 'Expandable option dropdown dropdown.',
    defaultProperties: {
      label: 'Theme Selection',
      options: 'System Default, Dark Mode, Light Mode',
      selected: 'Dark Mode',
    },
    defaultWidth: 200,
    defaultHeight: 68,
  },
  {
    type: 'avatar',
    name: 'Avatar',
    category: 'Elements',
    description: 'Circular profile avatar portrait.',
    defaultProperties: {
      src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      fallback: 'CN',
      size: 'md', // 'sm' | 'md' | 'lg'
    },
    defaultWidth: 50,
    defaultHeight: 50,
  },
  {
    type: 'progress',
    name: 'Progress',
    category: 'Elements',
    description: 'Horizontal percentage meter.',
    defaultProperties: {
      label: 'Import Progress',
      value: 60,
    },
    defaultWidth: 240,
    defaultHeight: 44,
  },
  {
    type: 'skeleton',
    name: 'Skeleton',
    category: 'Elements',
    description: 'Placeholder mockup block.',
    defaultProperties: {
      type: 'card', // 'circle' | 'line' | 'card'
    },
    defaultWidth: 200,
    defaultHeight: 80,
  },
  {
    type: 'separator',
    name: 'Separator',
    category: 'Elements',
    description: 'Divider or spacing separator line.',
    defaultProperties: {
      orientation: 'horizontal', // 'horizontal' | 'vertical'
    },
    defaultWidth: 200,
    defaultHeight: 8,
  },
  {
    type: 'label',
    name: 'Label',
    category: 'Elements',
    description: 'Styled typographic description header.',
    defaultProperties: {
      text: 'Section Divider Caption',
    },
    defaultWidth: 160,
    defaultHeight: 24,
  },

  // OVERLAYS (SIMULATED PORTALS)
  {
    type: 'alert',
    name: 'Alert',
    category: 'Overlays',
    description: 'Call out important messages or errors.',
    defaultProperties: {
      title: 'Attention Required',
      description: 'Your API key is missing. Please add it to process requests.',
      variant: 'default', // 'default' | 'destructive'
    },
    defaultWidth: 320,
    defaultHeight: 80,
  },
  {
    type: 'card',
    name: 'Card Container',
    category: 'Overlays',
    description: 'Multi-element card structure supporting nested nodes.',
    defaultProperties: {
      title: 'Sales Overview',
      description: 'Check reports and overall business analytics.',
      footerText: 'Updated 2 minutes ago',
      showFooter: true,
    },
    defaultWidth: 380,
    defaultHeight: 220,
  },
  {
    type: 'calendar',
    name: 'Calendar',
    category: 'Overlays',
    description: 'Prebuilt interactive scheduling calendar.',
    defaultProperties: {
      selectedDate: '2026-05-20',
    },
    defaultWidth: 280,
    defaultHeight: 290,
  },
  {
    type: 'table',
    name: 'Table',
    category: 'Overlays',
    description: 'Dynamic data tables mockup.',
    defaultProperties: {
      title: 'Recent Activity',
      headers: 'Metric, Value, Trend',
      rows: 'Unique Visitors, 12.4k, +15% | Conversions, 842, +5.2% | Bounce Rate, 41.2%, -2.8%',
    },
    defaultWidth: 420,
    defaultHeight: 200,
  },
  {
    type: 'accordion',
    name: 'Accordion',
    category: 'Overlays',
    description: 'Vertically stacked collapsible headers.',
    defaultProperties: {
      title: 'How do I add components inside containers?',
      content: 'Simply select any item on the canvas and click "Nest Into Parent" or drag them inside layout containers like flex columns, grid, or card slots.',
      isExpanded: false,
    },
    defaultWidth: 320,
    defaultHeight: 90,
  },
  {
    type: 'tabs',
    name: 'Tabs',
    category: 'Overlays',
    description: 'Toggleable navigation views.',
    defaultProperties: {
      headers: 'Account, Analytics, Options',
      selectedTab: 'Account',
      content: 'Change the credentials and connection details of your main sandbox account here.',
    },
    defaultWidth: 320,
    defaultHeight: 160,
  },
  {
    type: 'dialog',
    name: 'Dialog modal',
    category: 'Overlays',
    description: 'Rich dialog window popup simulation.',
    defaultProperties: {
      title: 'Confirm Sandbox Wipe',
      description: 'This is the simulated dialog state content. It overlays workspace controls to simulate modal gates.',
      confirmLabel: 'Proceed',
      cancelLabel: 'Go Back',
      isOpen: false,
    },
    defaultWidth: 360,
    defaultHeight: 180,
  },
  {
    type: 'sheet',
    name: 'Sheet overlay',
    category: 'Overlays',
    description: 'A slide-out drawer sidebar modal compilation.',
    defaultProperties: {
      title: 'Edit Sandbox Theme',
      description: 'Adjust overall colors and layouts in this simulated panel setup.',
      side: 'right', // 'right' | 'left'
      isOpen: false,
    },
    defaultWidth: 280,
    defaultHeight: 200,
  },

  // LAYOUT SHELLS
  {
    type: 'flexCol',
    name: 'Flex Column (Col)',
    category: 'Layout Shells',
    description: 'A shell of elements arranged top-down.',
    defaultProperties: {
      gap: '4',
      align: 'stretch', // 'start' | 'center' | 'end' | 'stretch'
      padding: '4', // '0' | '2' | '4' | '6'
    },
    defaultWidth: 360,
    defaultHeight: 180,
  },
  {
    type: 'flexRow',
    name: 'Flex Row',
    category: 'Layout Shells',
    description: 'A structural row of items side-by-side.',
    defaultProperties: {
      gap: '4',
      align: 'center', // 'start' | 'center' | 'end' | 'stretch'
      justify: 'between', // 'start' | 'center' | 'end' | 'between' | 'around'
      padding: '4',
    },
    defaultWidth: 380,
    defaultHeight: 90,
  },
  {
    type: 'gridShell',
    name: 'Grid Layout',
    category: 'Layout Shells',
    description: 'Responsive multi-column grid matrix.',
    defaultProperties: {
      columns: '3', // '1' | '2' | '3' | '4'
      gap: '4',
      padding: '4',
    },
    defaultWidth: 500,
    defaultHeight: 220,
  },
];

// PRE-DEFINED INTEGRATIVE TEMPLATES
export interface LayoutTemplate {
  name: string;
  description: string;
  category: string;
  nodes: CanvasNode[];
}

export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  {
    name: 'SaaS Dashboard Admin',
    description: 'A modern SaaS administrative hub overview containing responsive headers, statistical cards, data metrics, and activity monitors.',
    category: 'Dashboard',
    nodes: [
      {
        id: 'dash-header-row',
        type: 'flexRow',
        x: 50,
        y: 40,
        width: 1000,
        height: 80,
        properties: {
          gap: '4',
          align: 'center',
          justify: 'between',
          padding: '4',
          borderStyle: 'border-b bg-muted/20',
        },
      },
      {
        id: 'dash-header-label',
        type: 'label',
        x: 10,
        y: 10,
        parentId: 'dash-header-row',
        properties: {
          text: '📊 Project Nebula Sandbox Dashboard',
        },
      },
      {
        id: 'dash-header-badge',
        type: 'badge',
        x: 20,
        y: 10,
        parentId: 'dash-header-row',
        properties: {
          label: 'Deploy: Active',
          variant: 'default',
        },
      },
      {
        id: 'dash-header-avatar',
        type: 'avatar',
        x: 30,
        y: 10,
        parentId: 'dash-header-row',
        properties: {
          src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
          fallback: 'JD',
          size: 'sm',
        },
      },
      // Cards container row
      {
        id: 'stats-grid',
        type: 'gridShell',
        x: 50,
        y: 140,
        width: 1000,
        height: 190,
        properties: {
          columns: '3',
          gap: '4',
          padding: '0',
        },
      },
      {
        id: 'card-1',
        type: 'card',
        x: 10,
        y: 10,
        parentId: 'stats-grid',
        properties: {
          title: '📈 $45,231.89',
          description: 'Total Revenue (+20.1% YoY checkin)',
          footerText: '+12.5% from last fiscal quarter',
          showFooter: true,
        },
      },
      {
        id: 'card-2',
        type: 'card',
        x: 20,
        y: 10,
        parentId: 'stats-grid',
        properties: {
          title: '👥 +12,234 users',
          description: 'Active subscriptions inside environment',
          footerText: '+450 new registrations today',
          showFooter: true,
        },
      },
      {
        id: 'card-3',
        type: 'card',
        x: 30,
        y: 10,
        parentId: 'stats-grid',
        properties: {
          title: '🔥 99.98% SLA',
          description: 'Infrastructure uptime status',
          footerText: 'Server cluster remains normal',
          showFooter: true,
        },
      },
      // Analytics Row
      {
        id: 'analytics-split',
        type: 'gridShell',
        x: 50,
        y: 350,
        width: 1000,
        height: 350,
        properties: {
          columns: '2',
          gap: '6',
          padding: '0',
        },
      },
      {
        id: 'data-table',
        type: 'table',
        x: 10,
        y: 10,
        parentId: 'analytics-split',
        properties: {
          title: 'Subscribed Clients',
          headers: 'Company, Plan, Spent, Status',
          rows: 'Microsoft Corp, Enterprise, $12,500.00, Active | Stripe Inc, Professional, $2,400.00, Active | ACME Inc, Basic, $450.00, Suspended | Vercel Corp, Enterprise, $8,900.00, Active',
        },
      },
      {
        id: 'side-tabs',
        type: 'tabs',
        x: 20,
        y: 10,
        parentId: 'analytics-split',
        properties: {
          headers: 'Deployment logs, Integration steps, Cluster state',
          selectedTab: 'Deployment logs',
          content: 'Building bundle success ... transpiled CJS entry point. Port 3000 actively listening. No unhandled exceptions caught.',
        },
      },
    ],
  },
  {
    name: 'SaaS Form & Account Setup',
    description: 'An elegant containerized user registration flow featuring input parameters, selections, toggles, and functional actions nested nicely.',
    category: 'Forms',
    nodes: [
      {
        id: 'form-wrapper',
        type: 'card',
        x: 300,
        y: 60,
        width: 440,
        height: 520,
        properties: {
          title: 'Configure Space Node',
          description: 'Deploy a new server node to your micro-cluster.',
          footerText: 'Form is validated locally',
          showFooter: false,
        },
      },
      {
        id: 'form-flex',
        type: 'flexCol',
        x: 10,
        y: 10,
        parentId: 'form-wrapper',
        properties: {
          gap: '4',
          align: 'stretch',
          padding: '2',
        },
      },
      {
        id: 'input-node-name',
        type: 'input',
        x: 10,
        y: 10,
        parentId: 'form-flex',
        properties: {
          label: 'Node Identifier',
          placeholder: 'e.g. us-east-replica-01',
          value: 'omega-cluster-node',
        },
      },
      {
        id: 'select-region',
        type: 'select',
        x: 10,
        y: 20,
        parentId: 'form-flex',
        properties: {
          label: 'Execution Zone',
          options: 'us-east1 (Iowa), us-central2 (Oregon), europe-west3 (Frankfurt)',
          selected: 'us-east1 (Iowa)',
        },
      },
      {
        id: 'slider-ram',
        type: 'slider',
        x: 10,
        y: 30,
        parentId: 'form-flex',
        properties: {
          label: 'Provisioned Memory (GB RAM)',
          value: 16,
          min: 4,
          max: 64,
        },
      },
      {
        id: 'switch-auth',
        type: 'switch',
        x: 10,
        y: 40,
        parentId: 'form-flex',
        properties: {
          label: 'Enforce Encrypted VPC tunnel',
          checked: true,
        },
      },
      {
        id: 'btn-submit',
        type: 'button',
        x: 10,
        y: 50,
        parentId: 'form-flex',
        properties: {
          label: 'Provision Active Sandbox Instance',
          variant: 'default',
          size: 'default',
        },
      },
    ],
  },
  {
    name: 'Pricing Tier Showcase',
    description: 'A 3-column pricing matrix showing tiered pricing plans modeled strictly on modern premium corporate offerings with varying feature checklist packages.',
    category: 'Blocks',
    nodes: [
      {
        id: 'pricing-grid',
        type: 'gridShell',
        x: 100,
        y: 80,
        width: 880,
        height: 480,
        properties: {
          columns: '3',
          gap: '6',
          padding: '0',
        },
      },
      // Tier 1: Free
      {
        id: 'tier-free',
        type: 'card',
        x: 10,
        y: 10,
        parentId: 'pricing-grid',
        properties: {
          title: 'Starter — $0',
          description: 'Perfect for individual builders trying out the workspace parameters.',
          footerText: 'No credit card input needed',
          showFooter: true,
        },
      },
      {
        id: 'tier-free-flex',
        type: 'flexCol',
        x: 10,
        y: 10,
        parentId: 'tier-free',
        properties: {
          gap: '3',
          align: 'stretch',
          padding: '2',
        },
      },
      {
        id: 'tier-free-badge',
        type: 'badge',
        x: 10,
        y: 10,
        parentId: 'tier-free-flex',
        properties: {
          label: 'Starter tier benefits',
          variant: 'outline',
        },
      },
      {
        id: 'tier-free-item1',
        type: 'checkbox',
        x: 10,
        y: 20,
        parentId: 'tier-free-flex',
        properties: {
          label: '1 active workspace cluster',
          checked: true,
        },
      },
      {
        id: 'tier-free-item2',
        type: 'checkbox',
        x: 10,
        y: 30,
        parentId: 'tier-free-flex',
        properties: {
          label: 'Standard SLA network metrics',
          checked: true,
        },
      },
      {
        id: 'tier-free-button',
        type: 'button',
        x: 10,
        y: 40,
        parentId: 'tier-free-flex',
        properties: {
          label: 'Get started for free',
          variant: 'outline',
        },
      },

      // Tier 2: Pro (Premium featured)
      {
        id: 'tier-pro',
        type: 'card',
        x: 20,
        y: 10,
        parentId: 'pricing-grid',
        properties: {
          title: 'Pro — $49/mo',
          description: 'For micro-agencies and companies seeking priority execution queues.',
          footerText: 'Billed monthly unless configured',
          showFooter: true,
        },
      },
      {
        id: 'tier-pro-flex',
        type: 'flexCol',
        x: 10,
        y: 10,
        parentId: 'tier-pro',
        properties: {
          gap: '3',
          align: 'stretch',
          padding: '2',
        },
      },
      {
        id: 'tier-pro-badge',
        type: 'badge',
        x: 10,
        y: 10,
        parentId: 'tier-pro-flex',
        properties: {
          label: 'Popular choice ★',
          variant: 'default',
        },
      },
      {
        id: 'tier-pro-item1',
        type: 'checkbox',
        x: 10,
        y: 20,
        parentId: 'tier-pro-flex',
        properties: {
          label: 'Limitless scaling buffers',
          checked: true,
        },
      },
      {
        id: 'tier-pro-item2',
        type: 'checkbox',
        x: 10,
        y: 30,
        parentId: 'tier-pro-flex',
        properties: {
          label: 'Advanced analytical grids',
          checked: true,
        },
      },
      {
        id: 'tier-pro-button',
        type: 'button',
        x: 10,
        y: 40,
        parentId: 'tier-pro-flex',
        properties: {
          label: 'Purchase Professional Licences',
          variant: 'default',
        },
      },

      // Tier 3: Enterprise
      {
        id: 'tier-corp',
        type: 'card',
        x: 30,
        y: 10,
        parentId: 'pricing-grid',
        properties: {
          title: 'Corporate — Custom',
          description: 'A custom, fully dedicated environment containing isolated database arrays.',
          footerText: 'Contact sales representatives',
          showFooter: true,
        },
      },
      {
        id: 'tier-corp-flex',
        type: 'flexCol',
        x: 10,
        y: 10,
        parentId: 'tier-corp',
        properties: {
          gap: '3',
          align: 'stretch',
          padding: '2',
        },
      },
      {
        id: 'tier-corp-badge',
        type: 'badge',
        x: 10,
        y: 10,
        parentId: 'tier-corp-flex',
        properties: {
          label: 'Strict regulatory audits',
          variant: 'secondary',
        },
      },
      {
        id: 'tier-corp-item1',
        type: 'checkbox',
        x: 10,
        y: 20,
        parentId: 'tier-corp-flex',
        properties: {
          label: '99.999% custom SLA matrix',
          checked: true,
        },
      },
      {
        id: 'tier-corp-item2',
        type: 'checkbox',
        x: 10,
        y: 30,
        parentId: 'tier-corp-flex',
        properties: {
          label: 'On-prem node provisioning integration',
          checked: true,
        },
      },
      {
        id: 'tier-corp-button',
        type: 'button',
        x: 10,
        y: 40,
        parentId: 'tier-corp-flex',
        properties: {
          label: 'Initiate Consultation',
          variant: 'outline',
        },
      },
    ],
  },
];
