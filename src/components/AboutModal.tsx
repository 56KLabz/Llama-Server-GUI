import React, { useEffect } from 'react';
import { TerminalSquare, X, ExternalLink, Cpu, Sparkles } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
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

  const openLink = (url: string) => {
    if (window.llamaAPI?.openExternal) {
      window.llamaAPI.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#090b10] border border-amber-500/30 rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden font-mono text-slate-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-[#06080d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <TerminalSquare className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-100">About Llama Server GUI</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl shadow-amber-500/20 border border-amber-400/40 mx-auto">
            <TerminalSquare className="w-9 h-9 text-black stroke-[2.5]" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-100">Llama Server GUI</h3>
            <p className="text-xs text-amber-400 font-mono mt-0.5">Version 1.0.0 (Release Build)</p>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            A comprehensive, native Windows control center and options matrix for <code className="text-amber-300 font-mono">llama.cpp</code> and <code className="text-amber-300 font-mono">llama-server</code>.
          </p>

          <div className="p-3 bg-[#050609] rounded-xl border border-slate-800 text-[11px] text-slate-400 space-y-1.5 text-left">
            <div className="flex justify-between">
              <span>Frontend:</span>
              <span className="text-slate-200">React 19 + Tailwind CSS</span>
            </div>
            <div className="flex justify-between">
              <span>Core Engine:</span>
              <span className="text-slate-200">Electron + llama.cpp</span>
            </div>
            <div className="flex justify-between">
              <span>Platform:</span>
              <span className="text-slate-200">Windows (x64)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-500">
            <span>Brought to you by </span>
            <button
              onClick={() => openLink('https://56klabz.io')}
              className="text-amber-400 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
            >
              <span>56kLabz</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#06080d] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
