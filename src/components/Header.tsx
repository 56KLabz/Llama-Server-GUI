import React from 'react';
import { 
  Play, 
  Square, 
  Cpu, 
  HardDrive, 
  Sparkles, 
  FolderOpen, 
  Monitor, 
  Radio, 
  Sliders, 
  TerminalSquare, 
  Scan,
  Box,
  Palette
} from 'lucide-react';
import { SystemInfo, DiscoveredAssets, DiscoveredModel, DiscoveredBinary } from '../types';

interface HeaderProps {
  binaryPath: string;
  onSelectBinary: () => void;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
  onOpenAssetModal: () => void;
  onOpenThemeModal: () => void;
  assets: DiscoveredAssets | null;
  onSelectDiscoveredBinary: (bin: DiscoveredBinary) => void;
  onSelectDiscoveredModel: (model: DiscoveredModel) => void;
  activeModelPath?: string;
  systemInfo: SystemInfo | null;
  activeTab: 'flags' | 'terminal' | 'playground';
  setActiveTab: (tab: 'flags' | 'terminal' | 'playground') => void;
}

export const Header: React.FC<HeaderProps> = ({
  binaryPath,
  onSelectBinary,
  isRunning,
  onStart,
  onStop,
  onOpenAssetModal,
  onOpenThemeModal,
  assets,
  onSelectDiscoveredBinary,
  onSelectDiscoveredModel,
  activeModelPath,
  systemInfo,
  activeTab,
  setActiveTab
}) => {
  const modelsCount = assets?.models.length || 0;
  const binariesCount = assets?.binaries.length || 0;

  // Ensure current active selections are represented in dropdown options even if not in auto-scan
  const binariesList = [...(assets?.binaries || [])];
  if (binaryPath && !binariesList.some(b => b.path === binaryPath)) {
    binariesList.unshift({
      name: binaryPath.split(/[/\\]/).pop() || 'Custom Binary',
      path: binaryPath,
      type: binaryPath.toLowerCase().includes('server') ? 'server' : 'cli'
    });
  }

  const modelsList = [...(assets?.models || [])];
  if (activeModelPath && !modelsList.some(m => m.path === activeModelPath)) {
    modelsList.unshift({
      name: activeModelPath.split(/[/\\]/).pop() || 'Custom Model',
      path: activeModelPath,
      sizeGB: 0,
      folder: ''
    });
  }

  return (
    <header className="noir-panel border-b border-slate-800 px-5 py-3 sticky top-0 z-30 flex flex-col gap-3 shadow-xl bg-[#080a0f]">
      {/* Top row: Clean App Title + Binary/Model pickers + Launch button */}
      <div className="flex items-center justify-between gap-4">
        {/* Title */}
        <div className="flex items-center gap-3 min-w-fit">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 border border-amber-400/30">
            <TerminalSquare className="w-5 h-5 text-black stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100 tracking-tight">
                Llama Server GUI
              </h1>
              <span className="px-2 py-0.2 text-[9px] font-bold rounded bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans tracking-tight">
              Universal Control Center & Model Server Manager
            </p>
          </div>
        </div>

        {/* Binary Selector */}
        <div className="flex items-center gap-2 bg-[#0d1017] border border-slate-800 rounded-lg px-3 py-1.5 flex-1 max-w-sm shadow-inner">
          <FolderOpen className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="flex-1 min-w-0 text-left">
            <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider font-mono">Binary Executable</div>
            <select
              value={binaryPath}
              onChange={(e) => {
                const found = binariesList.find(b => b.path === e.target.value);
                if (found) {
                  onSelectDiscoveredBinary(found);
                } else if (e.target.value) {
                  onSelectDiscoveredBinary({
                    name: e.target.value.split(/[/\\]/).pop() || 'Binary',
                    path: e.target.value,
                    type: e.target.value.includes('server') ? 'server' : 'cli'
                  });
                }
              }}
              className="w-full bg-transparent text-xs font-mono text-slate-200 truncate focus:outline-none cursor-pointer"
            >
              {!binaryPath && <option value="">Select executable...</option>}
              {binariesList.map((b, i) => (
                <option key={i} value={b.path} className="bg-[#0d1017]">
                  {b.name} ({b.type})
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={onSelectBinary}
            className="px-2.5 py-1 text-[11px] font-medium rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shrink-0 cursor-pointer"
          >
            Browse
          </button>
        </div>

        {/* Model Selector */}
        <div className="flex items-center gap-2 bg-[#0d1017] border border-slate-800 rounded-lg px-3 py-1.5 flex-1 max-w-sm shadow-inner">
          <Box className="w-4 h-4 text-cyan-400 shrink-0" />
          <div className="flex-1 min-w-0 text-left">
            <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider font-mono">Model Weights (-m)</div>
            <select
              value={activeModelPath || ''}
              onChange={(e) => {
                const found = modelsList.find(m => m.path === e.target.value);
                if (found) {
                  onSelectDiscoveredModel(found);
                } else if (e.target.value) {
                  onSelectDiscoveredModel({
                    name: e.target.value.split(/[/\\]/).pop() || 'Model',
                    path: e.target.value,
                    sizeGB: 0,
                    folder: ''
                  });
                }
              }}
              className="w-full bg-transparent text-xs font-mono text-slate-200 truncate focus:outline-none cursor-pointer"
            >
              {!activeModelPath && <option value="">Select GGUF model...</option>}
              {modelsList.map((m, i) => (
                <option key={i} value={m.path} className="bg-[#0d1017]">
                  {m.name} {m.sizeGB > 0 ? `(${m.sizeGB}GB)` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenAssetModal}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-[#0e121a] hover:bg-slate-800 text-amber-300 border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Open Asset Vault to browse all detected models"
          >
            <Scan className="w-3.5 h-3.5 text-amber-400" />
            <span>Models Vault ({modelsCount})</span>
          </button>

          <button
            onClick={onOpenThemeModal}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-[#0e121a] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Change UI Theme (Tokyo Night, Catppuccin, Dracula, Gruvbox, Nord, Cyberpunk, Noir)"
          >
            <Palette className="w-3.5 h-3.5 text-cyan-400" />
            <span>Theme</span>
          </button>

          {/* Master Start / Stop Button */}
          {isRunning ? (
            <button
              onClick={onStop}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white text-xs font-bold tracking-wide transition-all shadow-lg shadow-rose-950 flex items-center gap-1.5 animate-pulse cursor-pointer border border-rose-400/40 shrink-0"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>STOP SERVER</span>
            </button>
          ) : (
            <button
              onClick={onStart}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-black text-xs font-bold tracking-wide transition-all shadow-lg shadow-amber-950/40 flex items-center gap-1.5 cursor-pointer border border-amber-300/40 shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-black stroke-black" />
              <span>START SERVER</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom row: View Mode Switcher + Hardware Status */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-[#06080d] p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('flags')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'flags'
                ? 'bg-slate-800 text-amber-300 border border-slate-700 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Options Grid</span>
          </button>

          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'terminal'
                ? 'bg-slate-800 text-amber-300 border border-slate-700 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5 text-cyan-400" />
            <span>Console Logs</span>
            {isRunning && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('playground')}
            className={`px-4 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'playground'
                ? 'bg-slate-800 text-amber-300 border border-slate-700 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span>API Playground</span>
          </button>
        </div>

        {/* Hardware Live Telemetry Status */}
        {systemInfo && (
          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 overflow-x-auto max-w-full">
            <div className="flex items-center gap-1.5 bg-[#06080d] px-2.5 py-1 rounded border border-slate-800 shrink-0">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>CPU: <strong className="text-slate-200">{systemInfo.cpuCores} Cores</strong></span>
            </div>
            
            <div className="flex items-center gap-1.5 bg-[#06080d] px-2.5 py-1 rounded border border-slate-800 shrink-0">
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
              <span>RAM: <strong className="text-slate-200">{systemInfo.usedMemGB}GB / {systemInfo.totalMemGB}GB</strong></span>
            </div>

            {systemInfo.gpus && systemInfo.gpus.length > 0 && systemInfo.gpus[0].name && (
              <div 
                className="flex items-center gap-1.5 bg-[#06080d] px-2.5 py-1 rounded border border-slate-800 shrink-0 shadow-sm"
                title={`${systemInfo.gpus[0].name} | Total: ${systemInfo.gpus[0].vramGB || 0}GB`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span className="whitespace-nowrap">
                  GPU: <strong className="text-slate-100 font-semibold">{systemInfo.gpus[0].name}</strong>
                  {systemInfo.gpus[0].vramGB !== null && (
                    <span className="ml-1.5 text-emerald-300 font-bold bg-emerald-950/40 px-1.5 py-0.2 rounded border border-emerald-800/40">
                      {systemInfo.gpus[0].usedVramGB !== undefined && systemInfo.gpus[0].usedVramGB !== null
                        ? `${systemInfo.gpus[0].usedVramGB}GB / ${systemInfo.gpus[0].vramGB}GB`
                        : `${systemInfo.gpus[0].vramGB}GB VRAM`}
                      {systemInfo.gpus[0].gpuUtilPercent !== undefined && systemInfo.gpus[0].gpuUtilPercent !== null && (
                        <span className="ml-1 text-slate-300">({systemInfo.gpus[0].gpuUtilPercent}%)</span>
                      )}
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
