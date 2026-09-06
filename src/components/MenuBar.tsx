import React, { useState, useEffect, useRef } from 'react';
import { 
  FolderOpen, 
  Download, 
  Save, 
  RotateCcw, 
  Scan, 
  FileSearch, 
  Sliders, 
  Monitor, 
  Radio, 
  Info, 
  Settings, 
  Play, 
  Square,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Palette
} from 'lucide-react';
import { PresetProfile, DEFAULT_PRESETS } from '../data/llamaFlags';

interface MenuBarProps {
  onOpenModel: () => void;
  onSelectBinary: () => void;
  onOpenAssetVault: () => void;
  onOpenHelpModal: () => void;
  onOpenCustomFlagModal: () => void;
  onOpenAboutModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenThemeModal: () => void;
  onApplyPreset: (preset: PresetProfile) => void;
  onResetAll: () => void;
  onExportScript: (format: 'bat' | 'ps1' | 'sh' | 'json') => void;
  activeTab: 'flags' | 'terminal' | 'playground';
  setActiveTab: (tab: 'flags' | 'terminal' | 'playground') => void;
  showCommandBar: boolean;
  onToggleCommandBar: () => void;
  isRunning: boolean;
  onStart: () => void;
  onStop: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  onOpenModel,
  onSelectBinary,
  onOpenAssetVault,
  onOpenHelpModal,
  onOpenCustomFlagModal,
  onOpenAboutModal,
  onOpenSettingsModal,
  onOpenThemeModal,
  onApplyPreset,
  onResetAll,
  onExportScript,
  activeTab,
  setActiveTab,
  showCommandBar,
  onToggleCommandBar,
  isRunning,
  onStart,
  onStop
}) => {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuClick = (menuName: string) => {
    setOpenMenu(openMenu === menuName ? null : menuName);
  };

  const handleItemClick = (action: () => void) => {
    action();
    setOpenMenu(null);
  };

  return (
    <div ref={menuRef} className="bg-[#090b10] border-b border-slate-800/90 text-xs select-none px-3 py-1 flex items-center justify-between z-40 relative">
      {/* Left side: Menu items */}
      <div className="flex items-center gap-1">
        {/* FILE MENU */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('file')}
            className={`px-2.5 py-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ${
              openMenu === 'file' ? 'bg-slate-800 text-white' : ''
            }`}
          >
            File
          </button>
          {openMenu === 'file' && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-[#0f131c] border border-slate-700/80 rounded-lg shadow-2xl py-1 z-50 text-slate-200">
              <button
                onClick={() => handleItemClick(onOpenModel)}
                className="w-full px-3 py-1.5 text-left hover:bg-amber-500 hover:text-black flex items-center justify-between cursor-pointer"
              >
                <span>Open GGUF Model...</span>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+O</span>
              </button>
              <button
                onClick={() => handleItemClick(onSelectBinary)}
                className="w-full px-3 py-1.5 text-left hover:bg-amber-500 hover:text-black flex items-center justify-between cursor-pointer"
              >
                <span>Select Llama Binary...</span>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+B</span>
              </button>
              <div className="border-t border-slate-800 my-1"></div>
              <button
                onClick={() => handleItemClick(() => onExportScript('bat'))}
                className="w-full px-3 py-1.5 text-left hover:bg-amber-500 hover:text-black flex items-center justify-between cursor-pointer"
              >
                <span>Export Windows .BAT...</span>
              </button>
              <button
                onClick={() => handleItemClick(() => onExportScript('ps1'))}
                className="w-full px-3 py-1.5 text-left hover:bg-amber-500 hover:text-black flex items-center justify-between cursor-pointer"
              >
                <span>Export PowerShell .PS1...</span>
              </button>
              <button
                onClick={() => handleItemClick(() => onExportScript('json'))}
                className="w-full px-3 py-1.5 text-left hover:bg-amber-500 hover:text-black flex items-center justify-between cursor-pointer"
              >
                <span>Save Profile (.json)...</span>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+S</span>
              </button>
              <div className="border-t border-slate-800 my-1"></div>
              <button
                onClick={() => {
                  window.close();
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-rose-600 hover:text-white flex items-center justify-between cursor-pointer"
              >
                <span>Exit</span>
                <span className="text-[10px] text-slate-400 font-mono">Alt+F4</span>
              </button>
            </div>
          )}
        </div>

        {/* VIEW MENU */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('view')}
            className={`px-2.5 py-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ${
              openMenu === 'view' ? 'bg-slate-800 text-white' : ''
            }`}
          >
            View
          </button>
          {openMenu === 'view' && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-[#0f131c] border border-slate-700/80 rounded-lg shadow-2xl py-1 z-50 text-slate-200">
              <button
                onClick={() => handleItemClick(() => setActiveTab('flags'))}
                className={`w-full px-3 py-1.5 text-left hover:bg-amber-500 hover:text-black flex items-center justify-between cursor-pointer ${
                  activeTab === 'flags' ? 'text-amber-400 font-bold' : ''
                }`}
              >
                <span>Options Matrix</span>
                <span className="text-[10px] text-slate-400 font-mono">F1</span>
              </button>
              <button
                onClick={() => handleItemClick(() => setActiveTab('terminal'))}
                className={`w-full px-3 py-1.5 text-left hover:bg-amber-500 hover:text-black flex items-center justify-between cursor-pointer ${
                  activeTab === 'terminal' ? 'text-amber-400 font-bold' : ''
                }`}
              >
                <span>Logs Terminal</span>
                <span className="text-[10px] text-slate-400 font-mono">F2</span>
              </button>
              <button
                onClick={() => handleItemClick(() => setActiveTab('playground'))}
                className={`w-full px-3 py-1.5 text-left hover:bg-amber-500 hover:text-black flex items-center justify-between cursor-pointer ${
                  activeTab === 'playground' ? 'text-amber-400 font-bold' : ''
                }`}
              >
                <span>Chat Playground</span>
                <span className="text-[10px] text-slate-400 font-mono">F3</span>
              </button>
              <div className="border-t border-slate-800 my-1"></div>
              <button
                onClick={() => handleItemClick(onOpenThemeModal)}
                className="w-full px-3 py-1.5 text-left hover:bg-amber-500 hover:text-black flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5" />
                  <span>Color Themes...</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+T</span>
              </button>
              <button
                onClick={() => handleItemClick(onToggleCommandBar)}
                className="w-full px-3 py-1.5 text-left hover:bg-amber-500 hover:text-black flex items-center justify-between cursor-pointer"
              >
                <span>{showCommandBar ? 'Hide Command Box' : 'Show Command Box'}</span>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+`</span>
              </button>
            </div>
          )}
        </div>

        {/* TOOLS MENU */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('tools')}
            className={`px-2.5 py-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ${
              openMenu === 'tools' ? 'bg-slate-800 text-white' : ''
            }`}
          >
            Tools
          </button>
          {openMenu === 'tools' && (
            <div className="absolute top-full left-0 mt-1 w-60 bg-[#0f131c] border border-slate-700/80 rounded-lg shadow-2xl py-1 z-50 text-slate-200">
              <button
                onClick={() => handleItemClick(onOpenAssetVault)}
                className="w-full px-3 py-1.5 text-left hover:bg-amber-500 hover:text-black flex items-center justify-between cursor-pointer"
              >
                <span>Scan Local Model Vault...</span>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+Shift+S</span>
              </button>
              <button
                onClick={() => handleItemClick(onOpenHelpModal)}
                className="w-full px-3 py-1.5 text-left hover:bg-amber-500 hover:text-black flex items-center justify-between cursor-pointer"
              >
                <span>Ingest from --help...</span>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+H</span>
              </button>
              <button
                onClick={() => handleItemClick(onOpenCustomFlagModal)}
                className="w-full px-3 py-1.5 text-left hover:bg-amber-500 hover:text-black flex items-center justify-between cursor-pointer"
              >
                <span>Add Custom Parameter...</span>
              </button>
              <div className="border-t border-slate-800 my-1"></div>
              <button
                onClick={() => handleItemClick(onResetAll)}
                className="w-full px-3 py-1.5 text-left hover:bg-rose-600 hover:text-white flex items-center justify-between cursor-pointer text-rose-300"
              >
                <span>Reset All Flags to Default</span>
              </button>
            </div>
          )}
        </div>

        {/* PRESETS MENU */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('presets')}
            className={`px-2.5 py-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ${
              openMenu === 'presets' ? 'bg-slate-800 text-white' : ''
            }`}
          >
            Presets
          </button>
          {openMenu === 'presets' && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-[#0f131c] border border-slate-700/80 rounded-lg shadow-2xl py-1 z-50 text-slate-200">
              {DEFAULT_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleItemClick(() => onApplyPreset(preset))}
                  className="w-full px-3 py-1.5 text-left hover:bg-amber-500 hover:text-black block cursor-pointer"
                >
                  <div className="font-semibold text-xs">{preset.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{preset.description}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* HELP MENU */}
        <div className="relative">
          <button
            onClick={() => handleMenuClick('help')}
            className={`px-2.5 py-1 rounded text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ${
              openMenu === 'help' ? 'bg-slate-800 text-white' : ''
            }`}
          >
            Help
          </button>
          {openMenu === 'help' && (
            <div className="absolute top-full left-0 mt-1 w-52 bg-[#0f131c] border border-slate-700/80 rounded-lg shadow-2xl py-1 z-50 text-slate-200">
              <button
                onClick={() => {
                  window.llamaAPI?.openExternal('https://github.com/ggerganov/llama.cpp');
                  setOpenMenu(null);
                }}
                className="w-full px-3 py-1.5 text-left hover:bg-amber-500 hover:text-black flex items-center justify-between cursor-pointer"
              >
                <span>llama.cpp GitHub</span>
                <ExternalLink className="w-3 h-3 opacity-60" />
              </button>
              <div className="border-t border-slate-800 my-1"></div>
              <button
                onClick={() => handleItemClick(onOpenAboutModal)}
                className="w-full px-3 py-1.5 text-left hover:bg-amber-500 hover:text-black flex items-center justify-between cursor-pointer"
              >
                <span>About Llama Server GUI...</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Right side: Process status indicator */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-slate-400 font-mono">Status:</span>
        <span className={`px-2 py-0.2 rounded-full text-[10px] font-mono font-bold flex items-center gap-1.5 ${
          isRunning 
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
            : 'bg-slate-800 text-slate-400'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
          {isRunning ? 'RUNNING' : 'STOPPED'}
        </span>
      </div>
    </div>
  );
};
