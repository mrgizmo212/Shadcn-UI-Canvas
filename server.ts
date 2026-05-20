/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Ensure Gemini Client is initialized safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required but missing.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // AI Layout Copilot Endpoint
  app.post('/api/copilot', async (req, res) => {
    try {
      const { prompt, existingNodes, history, theme, copilotBounds, selectedNodeIds } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json({ error: 'Prompt is required and must be a string.' });
        return;
      }

      const client = getGeminiClient();

      const systemInstruction = `You are an expert user interface layout engine and designer.
Your goal is to parse user layout requests, analyze the current canvas state, and construct a valid JSON structure representing the resulting state of visual component nodes and theme properties.
You have absolute control over EVERYTHING on the canvas! This includes placing nodes, nesting objects, editing custom properties (e.g., placeholder, label, type, alignment, spacing, table rows, button labels), AND updating the global canvas theme (dark vs light mode, primary color palette, and rounding corner radius).

Exquisite Styling & Color Overrides on ANY Component (In addition to standard properties):
Each node's 'properties' object can accept the following optional styling overrides to customize colors and appearance:
- 'bgColor': Custom background color/style preset. Values: 'white', 'zinc' (cool gray frame), 'slate' (slate gray), 'neutral' (warm neutral), 'stone' (warm stone), 'red' (warning glow), 'green' (success emerald glow), 'blue' (information blue), 'yellow' (amber alert), 'purple' (cosmic purple), 'orange' (orange glow), 'teal' (mint teal), 'zincActive' (solid reverse color), 'indigoActive' (vibrant absolute solid), or standard tailwind bg overrides like 'bg-sky-500 hover:bg-sky-600', 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white', etc.
- 'textColor': Custom forefront text/typography color preset. Values: 'dark' (high contrast titles), 'zinc' (subtle gray indicators), 'red' (warning typography), 'green' (success green text), 'blue' (blue info text), 'yellow' (warm amber), 'purple' (royal purple), 'orange' (mandarin orange text), 'pink' (vibrant magenta text), 'teal' (mint text), 'white' (forces pure white), or standard tailwind text style overrides like 'text-indigo-400 font-extrabold tracking-wide font-mono'.
- 'customClass': Arbitrary Tailwind Utility Classes. This grants you UNLIMITED Power to iterate, design, structure, position, shadow, animate, rotate, or stylize elements. Examples: 'shadow-lg hover:scale-105 transition-all duration-300 border-2 border-dashed border-sky-400 p-6', 'w-full flex-row-reverse animate-pulse', etc.

Supported ComponentTypes:
- 'button': standard button (props: label, variant: 'default'|'secondary'|'outline'|'destructive', size: 'sm'|'default'|'lg', disabled: boolean)
- 'input': text text input (props: label, placeholder, value, type: 'text'|'email'|'password')
- 'textarea': larger multiline field (props: label, placeholder, value)
- 'badge': highlight badge (props: label, variant: 'default'|'secondary'|'outline'|'destructive')
- 'switch': boolean toggle (props: label, checked: boolean)
- 'slider': slide ranges (props: label, value: number, min: number, max: number)
- 'checkbox': tick box item (props: label, checked: boolean)
- 'radioGroup': single select items (props: label, options: comma separated list like 'Option A, Option B', selected: string)
- 'select': choose options dropdown (props: label, options: comma separated list, selected: string)
- 'avatar': round portrait (props: src, fallback: initials like 'JD', size: 'sm'|'md'|'lg')
- 'progress': state bars (props: label, value: number out of 100)
- 'skeleton': mockup loader blocks (props: type: 'circle'|'line'|'card')
- 'separator': layout splitter line (props: orientation: 'horizontal'|'vertical')
- 'label': text caption styling (props: text)
- 'alert': error/success bar (props: title, description, variant: 'default'|'destructive')
- 'card': box container (props: title, description, footerText, showFooter: boolean) - extremely good as parent of other nodes!
- 'calendar': day schedulers (props: selectedDate like '2026-05-20')
- 'table': matrix listing (props: title, headers: comma separated like 'Metric, Value', rows: comma separated lists with cells separated by comma, columns are split, rows piped with '|' like 'Active Users, 12k | Bounce, 40%' )
- 'accordion': expander content (props: title, content, isExpanded: boolean)
- 'tabs': navigation panels (props: headers: comma separated, selectedTab, content)
- 'dialog': modal boxes (props: title, description, confirmLabel, cancelLabel, isOpen: boolean)
- 'sheet': slide drawers (props: title, description, side: 'left'|'right', isOpen: boolean)
- 'flexRow': horizontal element flow (props: gap: '2'|'4'|'6', align: 'start'|'center'|'end'|'stretch', justify: 'start'|'center'|'end'|'between'|'around', padding: '0'|'2'|'4'|'6')
- 'flexCol': top-to-bottom element flow (props: gap: '2'|'4'|'6', align: 'start'|'center'|'end'|'stretch', padding: '0'|'2'|'4'|'6')
- 'gridShell': bento matrix (props: columns: '1'|'2'|'3'|'4', gap: '2'|'4'|'6', padding: '0'|'2'|'4'|'6')

Supported Operations and Action Modes:
1. Design Iterations / Updates / Edits (Return "action": "replace"):
   If the user requests to make changes to, modify, expand, style, or delete what is CURRENTLY on the canvas, modify his [CURRENT CANVAS NODES] collection directly. Return the complete updated array. Keep existing ids stable for components that were not modified. If the user says delete, omit those elements from the nodes list.
2. Creation from scratch (Return "action": "add"):
   If the user asks to "add" or "build" a new isolated block or container, and doesn't ask to change the current layout, formulate a brand new node tree with coordinates starting near x: 0, y: 0.

Theme Configuration:
- 'baseColor' can be 'zinc', 'slate', 'neutral', or 'stone'.
- 'radius' can be 'none', 'sm', 'md', 'lg', or 'full'.
- 'darkMode' can be true or false.
If the user asks for styling adjustments like "use warm stone styling", "set border rounded to none", "switch to dark mode", etc., construct the updated "theme" object in the output JSON matching these attributes.

Coordinates Rules:
- If parentId is set to a container, coordinates are relative to the container.
- Match layout widths with standard dimensions: Cards are ~400 width, nested inputs ~260, buttons ~120.

Strictly output raw JSON satisfying the required object schema.`;

      // Build discussion thread contents
      const contents: any[] = [];
      if (history && Array.isArray(history) && history.length > 0) {
        // Map history to proper Gemini contents structure
        for (const msg of history) {
          contents.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.parts?.[0]?.text || msg.content || '' }]
          });
        }
      }

      const serializedNodes = JSON.stringify(existingNodes || []);
      const serializedTheme = JSON.stringify(theme || { baseColor: 'zinc', darkMode: true, radius: 'md' });

      // Build explicit selection target context to pinpoint edits
      let selectedContextSection = '';
      if (selectedNodeIds && Array.isArray(selectedNodeIds) && selectedNodeIds.length > 0) {
        const selectedNodes = (existingNodes || []).filter((n: any) => selectedNodeIds.includes(n.id));
        if (selectedNodes.length > 0) {
          selectedContextSection = `\n[EXPLICIT SELECTED CONTEXT FOR PRESENT ACTION]
The user is focusing or selecting the following active component(s) on the canvas to specify targeted edits, redesigns, style changes, delete requests, or color modification details. Please focus your edits or operations on these specific components:
${JSON.stringify(selectedNodes, null, 2)}\n`;
        }
      }

      // Build overlay evasion boundary coordinates
      let boundsSection = '';
      if (copilotBounds) {
        boundsSection = `\n[COPILOT OVERLAY CANVAS COORDINATES BOUNDARY]
The floating Copilot dialogue bar is hovering over these canvas coordinate limits:
Min X: ${copilotBounds.minX}, Max X: ${copilotBounds.maxX}
Min Y: ${copilotBounds.minY}, Max Y: ${copilotBounds.maxY}
To avoid generating nodes directly beneath / behind / overlapping with this floating bar, do NOT place any newly added components within these coordinate boundaries. Shift new components comfortably below Y: ${copilotBounds.maxY} or to the left/right of X.\n`;
      }

      const finalMessage = `[CURRENT CANVAS NODES]
${serializedNodes}

[CURRENT CANVAS THEME]
${serializedTheme}
${selectedContextSection}${boundsSection}
[LATEST USER REQUEST]
${prompt}`;

      // Push final latest prompt
      contents.push({
        role: 'user',
        parts: [{ text: finalMessage }]
      });

      const response = await client.models.generateContent({
        model: 'gemini-3.5-flash',
        contents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              nodes: {
                type: Type.ARRAY,
                description: 'The resulting list of canvas layout nodes.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    type: { type: Type.STRING },
                    x: { type: Type.INTEGER },
                    y: { type: Type.INTEGER },
                    width: { type: Type.INTEGER },
                    height: { type: Type.INTEGER },
                    parentId: { type: Type.STRING },
                    properties: { type: Type.OBJECT },
                  },
                  required: ['id', 'type', 'x', 'y', 'properties'],
                },
              },
              action: {
                type: Type.STRING,
                description: 'Either "replace" (to replace existing canvas nodes due to edits/extensions) or "add" (to append fresh items).'
              },
              theme: {
                type: Type.OBJECT,
                description: 'Optional update to current canvas theme configuration block matching visual styles requested.',
                properties: {
                  baseColor: { type: Type.STRING, description: 'Zinc, Slate, Neutral, or Stone palette color base.' },
                  darkMode: { type: Type.BOOLEAN, description: 'Dark mode canvas setting.' },
                  radius: { type: Type.STRING, description: 'Corner rounding preset: none, sm, md, lg, or full.' }
                }
              },
              assistantMessage: {
                type: Type.STRING,
                description: 'A brief, 1-sentence design-oriented explanation summarizing the changes made on the canvas.'
              }
            },
            required: ['nodes', 'action', 'assistantMessage']
          },
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);

      res.json({
        nodes: parsed.nodes || [],
        action: parsed.action || 'replace',
        theme: parsed.theme || null,
        assistantMessage: parsed.assistantMessage || 'Canvas updated successfully.'
      });
    } catch (error: any) {
      console.error('Copilot generator failed:', error);
      res.status(500).json({ error: error.message || 'An error occurred during generative canvas synthesis.' });
    }
  });

  // Hot module reloading vs Static Production asset delivery
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Explicitly serve index.html transformed by Vite in development mode
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer();
