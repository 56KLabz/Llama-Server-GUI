import React, { useEffect } from 'react';
import { Palette, Check, X } from 'lucide-react';
import { THEMES, ThemeId } from '../data/themes';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: ThemeId;
  onSelectTheme: (themeId: ThemeId) => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  currentTheme,
  onSelectTheme
}) => {
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

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div 
        className="border rounded-2xl w-full max-w-xl shadow-2xl flex flex-col overflow-hidden font-mono"
        style={{
          backgroundColor: 'var(--bg-panel)',
          borderColor: 'var(--accent-border)'
        }}
      >
        {/* Header */}
        <div 
          className="px-5 py-4 border-b flex items-center justify-between"
          style={{ 
            backgroundColor: 'var(--bg-root)',
            borderColor: 'var(--border-subtle)'
          }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                backgroundColor: 'var(--accent-bg)',
                border: '1px solid var(--accent-border)',
                color: 'var(--accent)'
              }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wider uppercase text-slate-100">
                Interface Color Themes
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Select your favorite terminal colorway
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme Grid */}
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto">
          {THEMES.map((theme) => {
            const isSelected = currentTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => onSelectTheme(theme.id)}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-3 relative group ${
                  isSelected ? 'shadow-lg ring-1' : 'hover:border-white/20'
                }`}
                style={{
                  backgroundColor: theme.vars['--bg-card'],
                  borderColor: isSelected ? theme.previewColor : 'var(--border-subtle)',
                  boxShadow: isSelected ? `0 0 15px -3px ${theme.previewColor}40` : undefined
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    {/* Color Swatch / Dot */}
                    <div 
                      className="w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 shadow-sm"
                      style={{
                        backgroundColor: theme.previewBg,
                        borderColor: theme.previewColor
                      }}
                    >
                      <div 
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: theme.previewColor }}
                      />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-100 block">
                        {theme.name}
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div 
                      className="p-1 rounded-md text-black font-bold"
                      style={{ backgroundColor: theme.previewColor }}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 leading-snug">
                  {theme.description}
                </p>

                {/* Mini color bar preview */}
                <div className="flex items-center gap-1.5 pt-2 border-t border-white/5">
                  <div className="h-2 flex-1 rounded-sm" style={{ backgroundColor: theme.vars['--bg-root'] }} />
                  <div className="h-2 flex-1 rounded-sm" style={{ backgroundColor: theme.vars['--bg-panel'] }} />
                  <div className="h-2 flex-1 rounded-sm" style={{ backgroundColor: theme.vars['--accent'] }} />
                  <div className="h-2 flex-1 rounded-sm" style={{ backgroundColor: theme.vars['--secondary-accent'] }} />
                  <div className="h-2 flex-1 rounded-sm" style={{ backgroundColor: theme.vars['--text-primary'] }} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div 
          className="px-5 py-3 border-t flex items-center justify-between text-xs"
          style={{ 
            backgroundColor: 'var(--bg-root)',
            borderColor: 'var(--border-subtle)'
          }}
        >
          <span className="text-slate-400 font-mono text-[11px]">
            Theme persists across restarts
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg font-bold transition-opacity hover:opacity-90 cursor-pointer"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-contrast)'
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
