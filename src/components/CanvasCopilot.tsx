/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Lightbulb, 
  Trash2, 
  MessageSquare, 
  ChevronDown, 
  ChevronUp, 
  History, 
  Undo,
  Bot,
  Minimize2,
  Maximize2,
  GripHorizontal
} from 'lucide-react';
import { CanvasNode, Viewport, ThemeSettings } from '../types';

interface CanvasCopilotProps {
  nodes: CanvasNode[];
  viewport: Viewport;
  onAddGeneratedNodes: (nodes: CanvasNode[]) => void;
  onReplaceNodes?: (nodes: CanvasNode[]) => void;
  disabled?: boolean;
  theme?: ThemeSettings;
  onUpdateTheme?: (theme: Partial<ThemeSettings>) => void;
  selectedNodeIds?: string[];
}

interface ThreadMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const SUGGESTIONS = [
  {
    label: 'User Card',
    prompt: 'Add a clean user profile card with user avatar, name, and an edit profile button',
  },
  {
    label: 'Sales metrics',
    prompt: 'Generate a 3-column KPI sales metrics row containing Revenue, Users, and Conversion rates',
  },
  {
    label: 'Feedback Form',
    prompt: 'Add a card-wrapped feedback form with email input, satisfaction slider, and submit button',
  },
  {
    label: 'Table display',
    prompt: 'Generate a recent activity table with unique visitors, metrics, and traffic columns',
  }
];

const LOADING_STEPS = [
  'Analyzing layout design requirements...',
  'Interpreting existing wireframe state...',
  'Synthesizing element transformations...',
  'Formulating structural coordinate offsets...',
  'Resolving element parenthood mappings...',
  'Compiling responsive alignment grid...'
];

export const CanvasCopilot: React.FC<CanvasCopilotProps> = ({
  nodes,
  viewport,
  onAddGeneratedNodes,
  onReplaceNodes,
  disabled = false,
  theme,
  onUpdateTheme,
  selectedNodeIds = [],
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  
  // Design thread simulation and states
  const [thread, setThread] = useState<ThreadMessage[]>([]);
  const [isThreadExpanded, setIsThreadExpanded] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Widget dragging & minimized states
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number } | null>(null);
  const isDraggingRef = useRef<boolean>(false);

  // Mouse drag implementation
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only left-click
    const target = e.target as HTMLElement;
    // Prevent dragging when interacting with interactive inputs, buttons, select menus, scrollable lists, or textareas
    if (
      target.closest('button') || 
      target.closest('input') || 
      target.closest('form') || 
      target.closest('select') || 
      target.closest('.scrollbar') || 
      target.closest('textarea') ||
      target.closest('[role="button"]')
    ) {
      return;
    }
    
    isDraggingRef.current = false;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position.x,
      posY: position.y
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      isDraggingRef.current = true;
    }

    // Dynamic clamping constraint limits (keep the header and minimize controls fully reachable inside the viewport)
    const minX = -window.innerWidth / 2 + 120;
    const maxX = window.innerWidth / 2 - 120;
    const minY = -window.innerHeight + 140; // bottom-24 offset, minY goes up to top of screen
    const maxY = 64; // can drag down slightly to the bottom edge

    const clampedX = Math.max(minX, Math.min(maxX, dragStartRef.current.posX + dx));
    const clampedY = Math.max(minY, Math.min(maxY, dragStartRef.current.posY + dy));

    setPosition({ x: clampedX, y: clampedY });
  };

  const handleMouseUp = () => {
    dragStartRef.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Touch drag implementation for mobiles
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('button') || 
      target.closest('input') || 
      target.closest('form') ||
      target.closest('select') || 
      target.closest('.scrollbar') || 
      target.closest('textarea') ||
      target.closest('[role="button"]')
    ) {
      return;
    }
    
    isDraggingRef.current = false;
    const touch = e.touches[0];
    dragStartRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      posX: position.x,
      posY: position.y
    };

    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!dragStartRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragStartRef.current.startX;
    const dy = touch.clientY - dragStartRef.current.startY;
    
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      isDraggingRef.current = true;
    }

    const minX = -window.innerWidth / 2 + 120;
    const maxX = window.innerWidth / 2 - 120;
    const minY = -window.innerHeight + 140;
    const maxY = 64;

    const clampedX = Math.max(minX, Math.min(maxX, dragStartRef.current.posX + dx));
    const clampedY = Math.max(minY, Math.min(maxY, dragStartRef.current.posY + dy));

    setPosition({ x: clampedX, y: clampedY });
    e.preventDefault();
  };

  const handleTouchEnd = () => {
    dragStartRef.current = null;
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };

  // Cleanup events
  useEffect(() => {
    // Start at exactly the default center bottom coordinate position
    setPosition({ x: 0, y: 0 });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  // Cycle loading status text
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGenerating) {
      timer = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 1500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(timer);
  }, [isGenerating]);

  // Scroll to bottom of message thread list on new replies
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [thread, isGenerating]);

  // Self-clearing temporary success banner
  useEffect(() => {
    if (successCount !== null) {
      const timer = setTimeout(() => {
        setSuccessCount(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successCount]);

  const handleClearThread = () => {
    setThread([]);
    setErrorStatus(null);
    setSuccessCount(null);
  };

  const handleGenerate = async (finalPrompt: string) => {
    if (!finalPrompt.trim() || isGenerating) return;

    // Build the user message entry
    const userMsgId = String(Date.now());
    const newUserMsg: ThreadMessage = {
      id: userMsgId,
      role: 'user',
      content: finalPrompt.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Update frontend thread state immediately
    const updatedThread = [...thread, newUserMsg];
    setThread(updatedThread);
    setPrompt('');
    setIsGenerating(true);
    setErrorStatus(null);
    setSuccessCount(null);
    setIsThreadExpanded(true);

    try {
      // Calculate active Copilot panel bounds in canvas coordinates to avoid overlaps
      const copilotW = 580;
      const copilotH = isThreadExpanded ? (thread.length > 0 ? 385 : 265) : 120;
      const screenLeft = (window.innerWidth / 2) - (copilotW / 2);
      const screenTop = 16;

      const leftCanvasX = Math.round((screenLeft + position.x - viewport.x) / viewport.zoom);
      const rightCanvasX = Math.round((screenLeft + position.x + copilotW - viewport.x) / viewport.zoom);
      const topCanvasY = Math.round((screenTop + position.y - viewport.y) / viewport.zoom);
      const bottomCanvasY = Math.round((screenTop + position.y + copilotH - viewport.y) / viewport.zoom);

      const copilotBounds = {
        minX: leftCanvasX,
        maxX: rightCanvasX,
        minY: topCanvasY,
        maxY: bottomCanvasY
      };

      // Pass prompt, current canvas elements, the conversational history, selected context, and visual bounds to the model
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: finalPrompt.trim(),
          existingNodes: nodes,
          theme: theme,
          copilotBounds,
          selectedNodeIds,
          history: updatedThread.map((msg) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }]
          })),
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'The Gemini design engine encountered a parsing failure.');
      }

      const data = await response.json();
      if (!data.nodes || !Array.isArray(data.nodes)) {
        throw new Error('No valid layout component list returned by the model.');
      }

      // Handle custom theme update requested by the AI
      if (data.theme && onUpdateTheme) {
        onUpdateTheme(data.theme);
      }

      const assistantReplyText = data.assistantMessage || 'Canvas layout calculated and aligned.';
      const assistantMsg: ThreadMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: assistantReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      
      setThread((prev) => [...prev, assistantMsg]);

      // Calculate placement helper mapping
      const actionType = data.action || 'replace';
      
      if (actionType === 'replace' && onReplaceNodes) {
        // Direct canvas modification: swap the canvas nodes entirely to achieve edits/resizes/deletes!
        onReplaceNodes(data.nodes);
        setSuccessCount(data.nodes.length);
      } else {
        // Appending new layouts: calculate center viewport snapping
        const canvasViewW = window.innerWidth;
        const canvasViewH = window.innerHeight;

        const generatedNodes: CanvasNode[] = data.nodes;
        if (generatedNodes.length > 0) {
          const xCoords = generatedNodes.map((n) => n.x);
          const yCoords = generatedNodes.map((n) => n.y);
          const minX = Math.min(...xCoords);
          const minY = Math.min(...yCoords);

          const maxX = Math.max(...generatedNodes.map((n) => n.x + (n.width || 200)));
          const maxY = Math.max(...generatedNodes.map((n) => n.y + (n.height || 80)));
          
          const widthSpan = maxX - minX;
          const heightSpan = maxY - minY;

          const centerCanvasX = Math.round(((canvasViewW / 2 - viewport.x) / viewport.zoom - widthSpan / 2) / 12) * 12;
          const centerCanvasY = Math.round(((canvasViewH / 2 - viewport.y) / viewport.zoom - heightSpan / 2) / 12) * 12;

          const shiftedNodes: CanvasNode[] = generatedNodes.map((n) => {
            const finalX = centerCanvasX + (n.x - minX);
            const finalY = centerCanvasY + (n.y - minY);
            return {
              ...n,
              x: Math.round(finalX / 12) * 12,
              y: Math.round(finalY / 12) * 12,
              properties: n.properties || {},
            };
          });

          onAddGeneratedNodes(shiftedNodes);
          setSuccessCount(shiftedNodes.length);
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorStatus(err.message || 'Trouble organizing layout. Please try a simpler description.');
      // Add error feedback directly into chat thread to be highly scannable
      setThread((prev) => [
        ...prev,
        {
          id: String(Date.now() + 1),
          role: 'assistant',
          content: `⚠️ Error: ${err.message || 'Trouble organizing canvas coordinates.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isMinimized) {
    return (
      <div 
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
        className="pointer-events-auto cursor-grab active:cursor-grabbing select-none"
      >
        <div 
          onClick={() => {
            if (!isDraggingRef.current) {
              setIsMinimized(false);
            }
          }}
          className="bg-zinc-950/95 dark:bg-white/95 border border-zinc-800 dark:border-zinc-200 text-white dark:text-zinc-950 rounded-full shadow-lg p-2.5 px-4.5 backdrop-blur-md flex items-center gap-3 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
        >
          <div className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <div className="text-[11px] font-extrabold tracking-tight flex items-center gap-1.5">
              <span>AI Copilot</span>
              {thread.length > 0 && (
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 dark:bg-zinc-150 dark:text-zinc-800 shrink-0 font-bold">
                  {thread.length}
                </span>
              )}
            </div>
            <span className="text-[8px] opacity-75 font-semibold mt-0.5">Click to restore panel</span>
          </div>
          <div className="w-px h-4 bg-zinc-800 dark:bg-zinc-250" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(false);
            }}
            className="p-1 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors cursor-pointer flex items-center justify-center shrink-0"
            title="Restore dialog"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
      className="w-full max-w-[580px] z-45 flex flex-col gap-2 pointer-events-auto select-text"
    >
      {/* Primary Copilot Layout Module */}
      <div className="bg-white/95 dark:bg-zinc-950/95 border border-zinc-200 dark:border-zinc-800/90 rounded-xl shadow-xl p-3 backdrop-blur-md relative overflow-hidden transition-all flex flex-col">
        
        {/* Subtle background gradient glow */}
        <div className="absolute -inset-10 bg-gradient-to-tr from-sky-400/5 via-violet-500/5 to-transparent blur-2xl pointer-events-none" />

        {/* Top Header Panel (Doubles as Drag Handle with Grip Icon) */}
        <div 
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className="flex items-center justify-between pb-2 border-b border-zinc-150 dark:border-zinc-900/60 relative z-10 select-none cursor-grab active:cursor-grabbing"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-500 text-white flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            
            {/* Grip Handle hint representation */}
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <h4 className="text-[11px] font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 leading-none">
                  AI Canvas Copilot
                </h4>
                <span className="text-[8.5px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 font-mono">
                  Gemini-Powered
                </span>
                <GripHorizontal className="w-3 h-3 text-zinc-350 ml-0.5 shrink-0" />
              </div>
              <p className="text-[9px] text-zinc-400 font-semibold select-none mt-0.5">Continuous Design Dialogue • Drag to reposition</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {thread.length > 0 && (
              <button 
                type="button"
                onClick={handleClearThread}
                title="Reset conversation thread"
                className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
                id="reset-thread-button"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              title="Minimize to floating pill"
              className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-450 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              id="minimize-panel-button"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => setIsThreadExpanded(!isThreadExpanded)}
              title={isThreadExpanded ? "Minimize messages" : "Show messages"}
              className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-450 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              id="toggle-thread-button"
            >
              {isThreadExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Iterative Thread Dialogue List */}
        {isThreadExpanded && (thread.length > 0 || isGenerating) && (
          <div 
            onWheel={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            className="max-h-[280px] overflow-y-auto py-2.5 px-1 space-y-2.5 flex flex-col border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/25 rounded-lg my-2 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent scrollbar"
          >
            {thread.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex gap-2 max-w-[90%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
              >
                {/* Avatar icon */}
                <div className={`w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center shrink-0 select-none ${
                  msg.role === 'user' 
                    ? 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' 
                    : 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500'
                }`}>
                  {msg.role === 'user' ? 'U' : <Bot className="w-3 h-3" />}
                </div>

                {/* Content Bubble */}
                <div className={`rounded-lg p-2 text-[11px] leading-relaxed shadow-2xs ${
                  msg.role === 'user'
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-950 font-medium rounded-tr-none'
                    : 'bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-150 dark:border-zinc-850 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span className="text-[8px] opacity-60 float-right mt-1 font-mono tracking-tight">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {/* Simulated generation loading state inside thread list */}
            {isGenerating && (
              <div className="flex gap-2 max-w-[85%] self-start items-start">
                <div className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-500 flex items-center justify-center shrink-0 animate-pulse select-none">
                  <Bot className="w-3 h-3" />
                </div>
                <div className="bg-white dark:bg-zinc-900 rounded-lg rounded-tl-none border border-indigo-100 dark:border-indigo-950 p-2 text-[11px] text-zinc-450 dark:text-zinc-450 italic flex flex-col gap-1.5 shadow-2xs w-full animate-pulse">
                  <span className="font-semibold text-[10px] text-indigo-500 leading-none">Gemini Copilot Draft...</span>
                  <p>❝ {LOADING_STEPS[loadingStep]} ❞</p>
                  <div className="h-1 bg-zinc-100 dark:bg-zinc-850 rounded-full overflow-hidden w-full mt-1">
                    <div className="h-full bg-indigo-500 animate-loading-bar-sweep rounded-full w-2/3" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input prompt bar controls */}
        <div className="flex gap-1.5 mt-2 relative z-10 items-center">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerate(prompt);
            }}
            className="flex-grow flex items-center relative gap-1.5"
          >
            <input
              type="text"
              disabled={isGenerating || disabled}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., 'Change the user card title to Sarah' or 'add an active badge'..."
              className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800 rounded-lg p-2 px-3 text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500/50 dark:focus:ring-white/20 !text-black dark:!text-white disabled:opacity-55 font-medium placeholder:text-zinc-400"
              id="copilot-thread-prompt-input"
            />

            <button
              type="submit"
              disabled={isGenerating || !prompt.trim() || disabled}
              className="h-8 px-3.5 shrink-0 rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-bold hover:bg-zinc-850 dark:hover:bg-zinc-100/95 disabled:opacity-30 disabled:hover:bg-zinc-950 dark:disabled:hover:bg-white transition-all flex items-center gap-1.5 cursor-pointer active:scale-97 border-0"
              id="submit-copilot-input-button"
            >
              <Send className="w-3 h-3" />
              <span>Send</span>
            </button>
          </form>
        </div>

        {/* Selected components as Context Display */}
        {(() => {
          const selectedNodes = nodes.filter(n => selectedNodeIds?.includes(n.id));
          if (selectedNodes.length === 0) return null;
          return (
            <div className="mt-2.5 flex items-center justify-between bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/55 dark:border-indigo-900/35 rounded-lg p-2 text-[10px] text-zinc-700 dark:text-zinc-350 select-none animate-in fade-in slide-in-from-top-1 z-10 relative">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <span className="text-xs">🎯</span>
                <span className="font-extrabold text-indigo-600 dark:text-indigo-400 shrink-0">Selected context:</span>
                <span className="font-bold bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded text-[9.5px] font-mono leading-none truncate max-w-[280px]">
                  {selectedNodes[0].type.toUpperCase()} node "{selectedNodes[0].properties.title || selectedNodes[0].properties.label || selectedNodes[0].id}"
                </span>
                {selectedNodes.length > 1 && (
                  <span className="text-[9px] text-indigo-500/85 font-mono font-bold shrink-0">
                    (+{selectedNodes.length - 1} more)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[8.5px] font-bold text-indigo-500/75 uppercase select-none mr-1">Tied to Copilot</span>
              </div>
            </div>
          );
        })()}

        {/* Multi-Prompt Suggestions Block */}
        {thread.length === 0 && !isGenerating && (
          <div className="mt-2.5 pt-2 border-t border-zinc-150 dark:border-zinc-900 flex flex-col gap-1.5 relative z-10">
            <div className="flex items-center gap-1 text-[9px] text-zinc-400 font-bold uppercase tracking-wider select-none mb-0.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
              <span>Ask copilot to build layouts and components:</span>
            </div>
            
            <div className="grid grid-cols-2 gap-1.5">
              {SUGGESTIONS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    handleGenerate(item.prompt);
                  }}
                  className="p-1 px-2 text-left rounded-lg text-[10px] font-semibold border border-zinc-200/60 hover:border-zinc-300 dark:border-zinc-900 dark:hover:border-zinc-800 bg-zinc-50/40 hover:bg-zinc-50 dark:bg-zinc-950/20 dark:hover:bg-zinc-950/40 cursor-pointer text-zinc-650 dark:text-zinc-350 active:scale-98 transition-all tracking-tight"
                >
                  <span className="text-indigo-500 block text-[9px] font-bold mb-0.5">✦ {item.label}</span>
                  <span className="text-[9px] opacity-75 line-clamp-1 font-medium">{item.prompt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Temporary Feedback alerts */}
        {errorStatus && (
          <div className="mt-2.5 p-2 bg-rose-50 dark:bg-rose-950/15 border border-rose-150/40 dark:border-rose-900/30 rounded-lg text-[10px] text-rose-650 dark:text-rose-450 flex items-start gap-1.5 z-10 relative">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500 mt-0.5" />
            <div className="leading-normal font-semibold">
              Can't compile prompt: {errorStatus}
            </div>
          </div>
        )}

        {successCount !== null && (
          <div className="mt-2.5 p-1.5 px-2 bg-emerald-50 dark:bg-emerald-950/15 border border-emerald-150/40 dark:border-emerald-900/35 rounded-lg text-[9px] text-emerald-650 dark:text-emerald-400 flex items-center gap-1.5 z-10 relative select-none animate-fade-in font-medium">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>
              Canvas updated successfully. Thread is now synchronized.
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
