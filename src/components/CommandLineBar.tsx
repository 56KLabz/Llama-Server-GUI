import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  Save, 
  FileCode2, 
  ChevronUp, 
  ChevronDown
} from 'lucide-react';
import { FlagDefinition } from '../data/llamaFlags';

interface CommandLineBarProps {
  binaryPath: string;
  flags: FlagDefinition[];
  flagValues: Record<string, any>;
  enabledFlags: Record<string, boolean>;
  onExportScript: (format: 'bat' | 'ps1' | 'sh' | 'json') => void;
  isVisible: boolean;
  onToggleVisible: () => void;
}

export function buildLlamaArgs(
  flags: FlagDefinition[], 
  flagValues: Record<string, any>, 
  enabledFlags: Record<string, boolean>,
  binaryPath?: string
): string[] {
  const isCliBinary = binaryPath ? binaryPath.toLowerCase().includes('cli') : false;
  const args: string[] = [];

  flags.forEach((flag) => {
    if (!enabledFlags[flag.id]) return;

    // Filter server-only flags if executing under llama-cli.exe
    if (isCliBinary && flag.isServerOnly) return;

    const val = flagValues[flag.id] !== undefined ? flagValues[flag.id] : flag.defaultValue;

    if (flag.id === 'flash_attn') {
      if (val === true || val === 'on') {
        args.push(flag.flag, 'on');
      } else if (val === 'off') {
        args.push(flag.flag, 'off');
      } else if (val === 'auto') {
        args.push(flag.flag, 'auto');
      }
    } else if (flag.type === 'boolean') {
      if (val === true) {
        args.push(flag.flag);
      }
    } else if (val !== undefined && val !== null && val !== '') {
      args.push(flag.flag);
      const strVal = String(val);
      args.push(strVal);
    }
  });

  return args;
}

export const CommandLineBar: React.FC<CommandLineBarProps> = ({
  binaryPath,
  flags,
  flagValues,
  enabledFlags,
  onExportScript,
  isVisible,
  onToggleVisible
}) => {
  const [copied, setCopied] = useState(false);

  const argsList = buildLlamaArgs(flags, flagValues, enabledFlags, binaryPath);
  const binaryExecutable = binaryPath ? (binaryPath.includes(' ') ? `"${binaryPath}"` : binaryPath) : 'llama-server.exe';
  
  const fullCommandString = [
    binaryExecutable,
    ...argsList.map(a => (a.includes(' ') && !a.startsWith('"') ? `"${a}"` : a))
  ].join(' ');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullCommandString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeCount = Object.values(enabledFlags).filter(Boolean).length;

  return (
    <div 
      className="border-t text-xs font-mono select-none z-20 shadow-2xl transition-all"
      style={{
        backgroundColor: 'var(--bg-root)',
        borderColor: 'var(--border-subtle)'
      }}
    >
      {/* Header bar */}
      <div 
        className="px-4 py-2 flex items-center justify-between gap-3"
        style={{ backgroundColor: 'var(--bg-panel)' }}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleVisible}
            className="flex items-center gap-2 font-semibold cursor-pointer transition-colors hover:opacity-80"
          >
            <Terminal className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
            <span className="font-bold text-slate-200">LIVE COMMAND PREVIEW</span>
            <span 
              className="text-[10px] px-1.5 py-0.2 rounded font-normal border"
              style={{
                backgroundColor: 'var(--accent-bg)',
                color: 'var(--accent)',
                borderColor: 'var(--accent-border)'
              }}
            >
              {activeCount} active flags
            </span>
            {isVisible ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-500" />}
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={copyToClipboard}
            className="px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-contrast)'
            }}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied!' : 'Copy Command'}</span>
          </button>

          <button
            onClick={() => onExportScript('bat')}
            className="px-2 py-1 text-[11px] font-medium rounded text-slate-300 border transition-all flex items-center gap-1 cursor-pointer hover:border-white/20"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)'
            }}
            title="Export as Windows .BAT"
          >
            <Download className="w-3 h-3" style={{ color: 'var(--accent)' }} />
            <span>.BAT</span>
          </button>

          <button
            onClick={() => onExportScript('ps1')}
            className="px-2 py-1 text-[11px] font-medium rounded text-slate-300 border transition-all flex items-center gap-1 cursor-pointer hover:border-white/20"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)'
            }}
            title="Export as PowerShell .PS1"
          >
            <FileCode2 className="w-3 h-3 text-cyan-400" />
            <span>.PS1</span>
          </button>

          <button
            onClick={() => onExportScript('json')}
            className="px-2 py-1 text-[11px] font-medium rounded text-slate-300 border transition-all flex items-center gap-1 cursor-pointer hover:border-white/20"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)'
            }}
            title="Save Profile"
          >
            <Save className="w-3 h-3 text-emerald-400" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Real-time Read-Only Live Terminal Box */}
      {isVisible && (
        <div 
          className="p-3 pt-1 border-t"
          style={{ 
            backgroundColor: 'var(--bg-root)',
            borderColor: 'var(--border-subtle)'
          }}
        >
          <div 
            onClick={copyToClipboard}
            title="Click to copy full command line"
            className="w-full border rounded-lg p-3 font-mono text-xs max-h-28 overflow-y-auto break-words whitespace-normal leading-relaxed cursor-pointer transition-all select-all shadow-inner"
            style={{
              backgroundColor: 'var(--bg-input)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)'
            }}
          >
            <span className="font-bold select-none mr-2" style={{ color: 'var(--accent)' }}>❯</span>
            <span className="text-cyan-300 font-bold">{binaryExecutable}</span>
            {' '}
            {argsList.map((arg, idx) => {
              const isFlag = arg.startsWith('-');
              return (
                <span 
                  key={idx} 
                  className={isFlag ? 'font-medium ml-1.5' : 'text-slate-200 bg-white/5 px-1 py-0.2 rounded border border-white/5 inline-block mr-1'}
                  style={isFlag ? { color: 'var(--accent)' } : undefined}
                >
                  {arg.includes(' ') && !arg.startsWith('"') ? `"${arg}"` : arg}
                  {' '}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
