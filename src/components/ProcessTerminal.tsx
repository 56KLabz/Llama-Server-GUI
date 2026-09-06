import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Trash2, 
  Download, 
  Search, 
  ArrowDownCircle, 
  Play,
  Square
} from 'lucide-react';
import { LogEntry } from '../types';

interface ProcessTerminalProps {
  logs: LogEntry[];
  isRunning: boolean;
  onClearLogs: () => void;
  onStart: () => void;
  onStop: () => void;
}

export const ProcessTerminal: React.FC<ProcessTerminalProps> = ({
  logs,
  isRunning,
  onClearLogs,
  onStart,
  onStop
}) => {
  const [filter, setFilter] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const filteredLogs = filter 
    ? logs.filter(l => l.text.toLowerCase().includes(filter.toLowerCase()))
    : logs;

  const downloadLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.text}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `llama-server-log-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.txt`;
    link.click();
  };

  return (
    <div 
      className="flex-1 flex flex-col h-full overflow-hidden font-mono"
      style={{ backgroundColor: 'var(--bg-root)' }}
    >
      {/* Terminal Toolbar */}
      <div 
        className="border-b px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 font-mono"
        style={{ 
          backgroundColor: 'var(--bg-panel)',
          borderColor: 'var(--border-subtle)'
        }}
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-100">
            Console Stream & Process Logs
          </span>
          <span className={`px-2 py-0.5 text-[9px] font-bold rounded flex items-center gap-1 ${
            isRunning 
               ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-black/40 text-slate-500 border border-white/10'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
            {isRunning ? 'PROCESS RUNNING' : 'PROCESS STOPPED'}
          </span>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
            <input
              type="text"
              placeholder="Filter logs..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border rounded-md pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-44 font-mono transition-colors"
              style={{
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-subtle)',
              }}
            />
          </div>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className="p-1.5 rounded-md text-xs font-medium border transition-all cursor-pointer"
            style={{
              backgroundColor: autoScroll ? 'var(--accent-bg)' : 'var(--bg-card)',
              borderColor: autoScroll ? 'var(--accent-border)' : 'var(--border-subtle)',
              color: autoScroll ? 'var(--accent)' : 'var(--text-muted)'
            }}
            title={autoScroll ? 'Auto-scroll is ON' : 'Auto-scroll is OFF'}
          >
            <ArrowDownCircle className="w-4 h-4" />
          </button>

          <button
            onClick={downloadLogs}
            disabled={logs.length === 0}
            className="p-1.5 rounded-md border disabled:opacity-40 text-slate-300 transition-all cursor-pointer hover:border-white/20"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)'
            }}
            title="Download full log file"
          >
            <Download className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          </button>

          <button
            onClick={onClearLogs}
            disabled={logs.length === 0}
            className="p-1.5 rounded-md border disabled:opacity-40 text-rose-400 transition-all cursor-pointer hover:bg-rose-950/20"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-subtle)'
            }}
            title="Clear console"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {isRunning ? (
            <button
              onClick={onStop}
              className="px-3 py-1 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm font-mono"
            >
              <Square className="w-3 h-3 fill-white" />
              <span>STOP</span>
            </button>
          ) : (
            <button
              onClick={onStart}
              className="px-3 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm font-mono"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--accent-contrast)'
              }}
            >
              <Play className="w-3 h-3 fill-current stroke-current" />
              <span>START</span>
            </button>
          )}
        </div>
      </div>

      {/* Terminal Viewport */}
      <div 
        className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-1 select-text"
        style={{ 
          backgroundColor: 'var(--bg-root)',
          color: 'var(--text-primary)'
        }}
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-2 select-none">
            <Terminal className="w-12 h-12 text-slate-800 stroke-1" />
            <p className="text-sm font-bold tracking-widest text-slate-600 uppercase font-mono">Log Buffer Clean</p>
            <p className="text-xs text-slate-600 font-mono">Launch the server to stream real-time logs and token timings.</p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isActualError = log.text.toLowerCase().includes('error:') || log.text.toLowerCase().includes('fatal:');
            const isWarn = log.text.toLowerCase().includes('warning:') || log.text.toLowerCase().includes('warn:');
            const isSuccess = log.text.includes('HTTP server listening') || log.text.includes('model loaded') || log.text.includes('main: ready');

            return (
              <div 
                key={log.id} 
                className={`leading-relaxed break-all flex gap-3 py-0.5 px-1.5 rounded transition-colors ${
                  isActualError 
                    ? 'text-rose-300 font-medium' 
                    : isWarn
                    ? 'text-amber-300/90'
                    : isSuccess
                    ? 'text-emerald-300 font-semibold'
                    : 'text-slate-300'
                }`}
              >
                <span className="text-slate-500 select-none shrink-0 font-mono text-[10px] pt-0.5">
                  {log.timestamp}
                </span>
                <span className="whitespace-pre-wrap flex-1">{log.text}</span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
