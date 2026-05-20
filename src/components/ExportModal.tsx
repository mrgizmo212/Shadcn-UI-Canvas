/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Check, Copy, Download, Upload, X } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  compiledCode: string;
  onImportJSON: (jsonStr: string) => boolean;
  currentHierarchyJSON: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  compiledCode,
  onImportJSON,
  currentHierarchyJSON,
}) => {
  const [activeTab, setActiveTab] = useState<'jsx' | 'json' | 'import'>('jsx');
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [importText, setImportText] = useState<string>('');
  const [importError, setImportError] = useState<string>('');
  const [importSuccess, setImportSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  // Copy-to-clipboard handler
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const executeImport = () => {
    setImportError('');
    setImportSuccess(false);
    const success = onImportJSON(importText);
    if (success) {
      setImportSuccess(true);
      setTimeout(() => {
        setImportSuccess(false);
        onClose();
      }, 1500);
    } else {
      setImportError('Invalid layout schema! Please make sure it is a valid JSON array exported from this application.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header toolbar */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 p-4 shrink-0 bg-slate-50/50 dark:bg-slate-950/20">
          <div className="space-y-1 text-left">
            <h3 className="text-base font-bold text-slate-950 dark:text-white leading-none">Export Sandbox Assets</h3>
            <p className="text-xs text-slate-500 font-medium">Capture production-ready code or download workspace templates.</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab triggers */}
        <div className="flex border-b border-slate-150 dark:border-slate-900 shrink-0 bg-slate-100/30 dark:bg-slate-950/40 px-2 pt-1 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('jsx')}
            className={`px-4 py-2.5 text-xs font-semibold select-none border-b-2 transition-all cursor-pointer ${
              activeTab === 'jsx'
                ? 'border-blue-600 text-blue-600 dark:border-white dark:text-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-850'
            }`}
          >
            React TSX Components / Tailwind
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`px-4 py-2.5 text-xs font-semibold select-none border-b-2 transition-all cursor-pointer ${
              activeTab === 'json'
                ? 'border-blue-600 text-blue-600 dark:border-white dark:text-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-850'
            }`}
          >
            Export JSON Schema
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('import')}
            className={`px-4 py-2.5 text-xs font-semibold select-none border-b-2 transition-all cursor-pointer ${
              activeTab === 'import'
                ? 'border-blue-600 text-blue-600 dark:border-white dark:text-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-850'
            }`}
          >
            📁 Import Sandbox JSON
          </button>
        </div>

        {/* Tab contents */}
        <div className="flex-grow overflow-auto p-5 min-h-0 bg-white dark:bg-slate-950">
          {activeTab === 'jsx' && (
            <div className="flex flex-col h-full gap-3 text-left">
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-2 text-xs rounded-lg text-slate-600 dark:text-slate-400 font-medium">
                <span>Tailwind 4 / Lucide icons conformant module structure.</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(compiledCode)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-[11px] font-bold text-slate-700 dark:text-slate-350 hover:bg-slate-50 cursor-pointer active:scale-95 transition-all"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied' : 'Copy module code'}</span>
                  </button>
                  <button
                    onClick={() => handleDownload(compiledCode, 'ShadcnCanvasLayout.tsx')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-[11px] font-bold hover:bg-slate-800 cursor-pointer active:scale-95 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download file</span>
                  </button>
                </div>
              </div>

              <div className="flex-grow overflow-auto border border-slate-200 dark:border-slate-850 rounded-lg bg-slate-50 dark:bg-slate-900/40 p-4 font-mono text-xs text-slate-800 dark:text-slate-300 max-h-[46vh]">
                <pre className="whitespace-pre overflow-x-auto leading-relaxed">{compiledCode}</pre>
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="flex flex-col h-full gap-3 text-left">
              <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-2 text-xs rounded-lg text-slate-600 dark:text-slate-400 font-medium">
                <span>Save this JSON layout profile. Re-import it later to continue editing any workspace canvas session.</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(currentHierarchyJSON)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-[11px] font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-50 cursor-pointer active:scale-95 transition-all"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied schema' : 'Copy JSON schema'}</span>
                  </button>
                  <button
                    onClick={() => handleDownload(currentHierarchyJSON, 'shadcn-canvas-export.json')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-[11px] font-bold hover:bg-slate-800 cursor-pointer active:scale-95 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download schema</span>
                  </button>
                </div>
              </div>

              <div className="flex-grow overflow-auto border border-slate-200 dark:border-slate-850 rounded-lg bg-slate-50 dark:bg-slate-900/40 p-4 font-mono text-xs text-slate-700 dark:text-slate-400 max-h-[46vh]">
                <p className="whitespace-pre-wrap word-break-all leading-normal">{currentHierarchyJSON}</p>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="flex flex-col h-full gap-4 text-left">
              <div className="space-y-1 bg-blue-50/50 dark:bg-slate-900/50 p-4 border border-blue-100 dark:border-slate-800 rounded-lg">
                <h5 className="text-xs font-semibold text-blue-800 dark:text-blue-300">Continuous Layout Workspace Integration</h5>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Paste the exported JSON hierarchy layout directly below and trigger "Verify & Load Layout" to instantly build and map everything onto your infinite canvas workspace.
                </p>
              </div>

              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder="Paste your exported Canvas JSON scheme directly here..."
                rows={10}
                className="w-full flex-grow p-4 font-mono text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-transparent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
              />

              {importError && (
                <div className="p-3 text-xs bg-red-50 text-red-700 border border-red-100 rounded-lg font-medium">
                  {importError}
                </div>
              )}

              {importSuccess && (
                <div className="p-3 text-xs bg-green-50 text-green-700 border border-green-150 rounded-lg font-bold">
                  ✓ Success! Layout compiled and successfully mapped onto work canvas. Synchronizing modules...
                </div>
              )}

              <button
                type="button"
                onClick={executeImport}
                disabled={!importText.trim()}
                className="w-full h-10 select-none font-semibold text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 cursor-pointer active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Verify & Load Layout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
