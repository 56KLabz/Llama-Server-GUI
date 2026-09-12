import React, { useState } from 'react';
import { 
  FolderOpen, 
  HelpCircle, 
  RotateCcw, 
  Check, 
  Copy, 
  ChevronDown, 
  ChevronUp
} from 'lucide-react';
import { FlagDefinition } from '../data/llamaFlags';

interface FlagCardProps {
  flag: FlagDefinition;
  value: any;
  isEnabled: boolean;
  onToggle: (flagId: string, enabled: boolean) => void;
  onChangeValue: (flagId: string, val: any) => void;
  onBrowseFile?: (flagId: string, filters?: { name: string; extensions: string[] }[]) => void;
  onBrowseDirectory?: (flagId: string) => void;
}

// Memoized to prevent re-rendering unchanged cards when system info polls or other flags update.
export const FlagCard: React.FC<FlagCardProps> = React.memo(({
  flag,
  value,
  isEnabled,
  onToggle,
  onChangeValue,
  onBrowseFile,
  onBrowseDirectory
}) => {
  const [showDocs, setShowDocs] = useState(false);
  const [copied, setCopied] = useState(false);

  const currentValue = value !== undefined ? value : (flag.defaultValue !== undefined ? flag.defaultValue : '');

  const copyFlagName = () => {
    navigator.clipboard.writeText(`${flag.short ? flag.short + ' ' : ''}${flag.flag}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleReset = () => {
    if (flag.defaultValue !== undefined) {
      onChangeValue(flag.id, flag.defaultValue);
    }
  };

  return (
    <div 
      className={`rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
        isEnabled 
          ? 'bg-[#0f131c] border-amber-500/50 shadow-lg shadow-amber-950/20' 
          : 'bg-[#0b0e15]/80 border-slate-800/80 hover:border-slate-700/90'
      }`}
    >
      {/* Top Header of Card */}
      <div className="p-3.5 pb-2">
        <div className="flex items-start justify-between gap-2">
          {/* Flag name and Short Badge */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
              <span className="font-bold text-xs text-slate-100 font-mono tracking-tight">{flag.name}</span>
              {flag.isServerOnly && (
                <span className="px-1.5 py-0.2 text-[8px] font-mono font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                  SERVER
                </span>
              )}
              {flag.quickAction && (
                <span className="px-1.5 py-0.2 text-[8px] font-mono font-bold rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                  CORE
                </span>
              )}
            </div>

            {/* Flag syntax badge with copy */}
            <div className="flex items-center gap-1.5">
              <code 
                onClick={copyFlagName}
                title="Click to copy flag syntax"
                className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-[#06080d] text-amber-400 border border-slate-800 hover:border-amber-500/60 transition-all cursor-pointer flex items-center gap-1.5 shadow-inner"
              >
                {flag.short && <span className="text-cyan-400 font-bold">{flag.short}</span>}
                {flag.short && <span className="text-slate-600">|</span>}
                <span>{flag.flag}</span>
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-2.5 h-2.5 text-slate-500 opacity-60" />}
              </code>
            </div>
          </div>

          {/* Master Enable/Disable Switch (Noir style) */}
          <div className="flex items-center gap-2 shrink-0">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => onToggle(flag.id, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800/90 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-amber-900 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 peer-checked:after:bg-black after:border-slate-400 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 shadow-inner"></div>
            </label>
          </div>
        </div>

        {/* Short Description */}
        <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed font-sans">
          {flag.description}
        </p>
      </div>

      {/* Control Body (Depending on FlagType) */}
      <div className="px-3.5 py-2.5 bg-[#07090f] border-t border-slate-800/80 mt-2 flex flex-col gap-2">
        {/* BOOLEAN CONTROL */}
        {flag.type === 'boolean' && (
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-400">Flag State:</span>
            <div className="flex items-center gap-1 font-mono">
              <button
                type="button"
                onClick={() => {
                  onChangeValue(flag.id, true);
                  if (!isEnabled) onToggle(flag.id, true);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  currentValue === true && isEnabled
                    ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-950/40'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                Enabled
              </button>
              <button
                type="button"
                onClick={() => {
                  onChangeValue(flag.id, false);
                  onToggle(flag.id, false);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  !isEnabled || currentValue === false
                    ? 'bg-slate-900 text-slate-300 border border-slate-800'
                    : 'bg-slate-900/50 text-slate-600 hover:text-slate-400'
                }`}
              >
                Omitted
              </button>
            </div>
          </div>
        )}

        {/* NUMBER CONTROL */}
        {flag.type === 'number' && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">
                Value {flag.unit && <span className="text-slate-500">({flag.unit})</span>}:
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={flag.min}
                  max={flag.max}
                  step={flag.step || 1}
                  value={currentValue}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                    onChangeValue(flag.id, val);
                    if (!isEnabled) onToggle(flag.id, true);
                  }}
                  className="w-24 bg-[#0d1017] border border-slate-800 focus:border-amber-500/60 rounded px-2 py-0.5 text-xs text-right font-mono text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500/40 shadow-inner"
                />
                {flag.defaultValue !== undefined && (
                  <button
                    onClick={handleReset}
                    title="Reset to default"
                    className="p-1 hover:bg-slate-800 text-slate-500 hover:text-amber-400 rounded cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Slider */}
            {flag.min !== undefined && flag.max !== undefined && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="range"
                  min={flag.min}
                  max={flag.max}
                  step={flag.step || 1}
                  value={typeof currentValue === 'number' ? currentValue : flag.min}
                  onChange={(e) => {
                    onChangeValue(flag.id, parseFloat(e.target.value));
                    if (!isEnabled) onToggle(flag.id, true);
                  }}
                  className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            )}
          </div>
        )}

        {/* FILE CONTROL */}
        {flag.type === 'file' && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Choose file or enter path..."
                value={currentValue || ''}
                onChange={(e) => {
                  onChangeValue(flag.id, e.target.value);
                  if (e.target.value && !isEnabled) onToggle(flag.id, true);
                }}
                className="flex-1 bg-[#0d1017] border border-slate-800 focus:border-amber-500/60 rounded px-2.5 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500/40 shadow-inner"
              />
              <button
                type="button"
                onClick={() => {
                  if (onBrowseFile) {
                    onBrowseFile(flag.id, flag.fileFilters);
                  }
                }}
                className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-medium transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-sm"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Browse</span>
              </button>
            </div>
          </div>
        )}

        {/* DIRECTORY CONTROL */}
        {flag.type === 'directory' && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                placeholder="Choose directory path..."
                value={currentValue || ''}
                onChange={(e) => {
                  onChangeValue(flag.id, e.target.value);
                  if (e.target.value && !isEnabled) onToggle(flag.id, true);
                }}
                className="flex-1 bg-[#0d1017] border border-slate-800 focus:border-amber-500/60 rounded px-2.5 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500/40 shadow-inner"
              />
              <button
                type="button"
                onClick={() => {
                  if (onBrowseDirectory) {
                    onBrowseDirectory(flag.id);
                  }
                }}
                className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-medium transition-all flex items-center gap-1 shrink-0 cursor-pointer shadow-sm"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Folder</span>
              </button>
            </div>
          </div>
        )}

        {/* ENUM CONTROL */}
        {flag.type === 'enum' && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-mono text-slate-400">Select Mode:</span>
            <div className="flex items-center gap-1 flex-wrap justify-end font-mono">
              {flag.options?.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChangeValue(flag.id, opt);
                    if (!isEnabled) onToggle(flag.id, true);
                  }}
                  className={`px-2 py-0.5 text-xs rounded font-medium transition-all cursor-pointer ${
                    currentValue === opt && isEnabled
                      ? 'bg-amber-500 text-black font-bold shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-[#f1f5f9] border border-slate-800'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STRING CONTROL */}
        {flag.type === 'string' && (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              placeholder={`Enter value for ${flag.flag}...`}
              value={currentValue || ''}
              onChange={(e) => {
                onChangeValue(flag.id, e.target.value);
                if (e.target.value && !isEnabled) onToggle(flag.id, true);
              }}
              className="w-full bg-[#0d1017] border border-slate-800 focus:border-amber-500/60 rounded px-2.5 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500/40 shadow-inner"
            />
          </div>
        )}

        {/* Bottom actions: Documentation toggle & default reset */}
        <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-500">
          <button
            onClick={() => setShowDocs(!showDocs)}
            className="flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3 h-3" />
            <span>{showDocs ? 'Hide details' : 'Docs & Specs'}</span>
            {showDocs ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {flag.defaultValue !== undefined && (
            <span>Default: <strong className="text-slate-400">{String(flag.defaultValue)}</strong></span>
          )}
        </div>

        {/* Expanded documentation block */}
        {showDocs && (
          <div className="mt-1 p-2.5 rounded-lg bg-[#05060a] border border-slate-800 text-[11px] text-amber-200/90 whitespace-pre-wrap font-mono leading-relaxed shadow-inner">
            {flag.detailedHelp || flag.description}
          </div>
        )}
      </div>
    </div>
  );
});
