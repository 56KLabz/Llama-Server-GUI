import React, { useState, useEffect } from 'react';
import { FileSearch, Sparkles, X, Terminal, CheckCircle2, AlertCircle } from 'lucide-react';
import { FlagDefinition } from '../data/llamaFlags';
import { parseHelpOutput } from '../utils/helpParser';

interface HelpExtractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  binaryPath: string;
  onImportFlags: (newFlags: FlagDefinition[]) => void;
}

export const HelpExtractorModal: React.FC<HelpExtractorModalProps> = ({
  isOpen,
  onClose,
  binaryPath,
  onImportFlags
}) => {
  const [helpText, setHelpText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRunAutoExtract = async () => {
    if (!binaryPath) {
      setStatusMsg({ type: 'error', text: 'Please choose an executable binary first.' });
      return;
    }

    setIsExtracting(true);
    setStatusMsg(null);

    try {
      if (window.llamaAPI?.extractHelp) {
        const res = await window.llamaAPI.extractHelp(binaryPath);
        if (res.success && res.output) {
          setHelpText(res.output);
          const parsed = parseHelpOutput(res.output);
          setStatusMsg({ type: 'success', text: `Successfully extracted ${parsed.length} options from binary!` });
        } else {
          setStatusMsg({ type: 'error', text: res.error || 'Failed to extract --help from binary.' });
        }
      } else {
        setStatusMsg({ type: 'error', text: 'Electron IPC is not available in browser mode.' });
      }
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleParseAndApply = () => {
    if (!helpText.trim()) {
      setStatusMsg({ type: 'error', text: 'Please paste or extract --help text first.' });
      return;
    }

    const parsed = parseHelpOutput(helpText);
    if (parsed.length === 0) {
      setStatusMsg({ type: 'error', text: 'Could not identify valid flag patterns in text.' });
      return;
    }

    onImportFlags(parsed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#090b10] border border-amber-500/30 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh] font-mono">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#06080d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileSearch className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Live --help Ingest & Flag Extractor</h2>
              <p className="text-xs text-slate-400">Extract every option directly from your llama executable</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-[#090b10]">
          <div className="flex items-center justify-between bg-[#050609] p-3 rounded-xl border border-slate-800">
            <div className="flex-1 min-w-0 pr-3">
              <span className="text-xs font-semibold text-slate-200 block">Auto-Extract From Selected Binary</span>
              <span className="text-[11px] text-slate-400 font-mono truncate block" title={binaryPath}>
                {binaryPath || 'No binary selected'}
              </span>
            </div>
            <button
              onClick={handleRunAutoExtract}
              disabled={isExtracting || !binaryPath}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shrink-0"
            >
              <Terminal className={`w-3.5 h-3.5 ${isExtracting ? 'animate-pulse' : ''}`} />
              <span>{isExtracting ? 'Extracting...' : 'Run --help'}</span>
            </button>
          </div>

          {statusMsg && (
            <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
              statusMsg.type === 'success' ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300' : 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
            }`}>
              {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              Or Paste Raw Output of <code className="text-amber-300">llama-server --help</code>:
            </label>
            <textarea
              rows={10}
              placeholder="usage: llama-server [options]&#10;&#10;options:&#10;  -h, --help            show this help message and exit&#10;  -m, --model FNAME     model path (default: )&#10;  -c, --ctx-size N      size of the prompt context..."
              value={helpText}
              onChange={(e) => setHelpText(e.target.value)}
              className="w-full bg-[#050609] border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-amber-500/60"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#06080d] flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleParseAndApply}
            disabled={!helpText.trim()}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-950/40"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Parse & Update Matrix</span>
          </button>
        </div>
      </div>
    </div>
  );
};
