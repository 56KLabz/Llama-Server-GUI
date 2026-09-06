import React, { useState } from 'react';
import { 
  Scan, 
  Box, 
  Terminal, 
  FolderPlus, 
  Sparkles, 
  Check, 
  X, 
  RefreshCw, 
  HardDrive, 
  Eye, 
  Layers, 
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { DiscoveredAssets, DiscoveredModel, DiscoveredBinary } from '../types';

interface AssetScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: DiscoveredAssets | null;
  isScanning: boolean;
  onScan: (customDirs?: string[]) => void;
  onSelectBinary: (binary: DiscoveredBinary) => void;
  onSelectModel: (model: DiscoveredModel, targetFlagId: 'model' | 'model_draft' | 'mmproj' | 'lora') => void;
  onBrowseCustomFolder: () => void;
  customFolders: string[];
}

export const AssetScannerModal: React.FC<AssetScannerModalProps> = ({
  isOpen,
  onClose,
  assets,
  isScanning,
  onScan,
  onSelectBinary,
  onSelectModel,
  onBrowseCustomFolder,
  customFolders
}) => {
  const [activeTab, setActiveTab] = useState<'models' | 'binaries' | 'projectors' | 'loras'>('models');
  const [search, setSearch] = useState('');

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filterList = <T extends { name: string; path: string }>(list?: T[]) => {
    if (!list) return [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(item => item.name.toLowerCase().includes(q) || item.path.toLowerCase().includes(q));
  };

  const filteredModels = filterList(assets?.models);
  const filteredBinaries = filterList(assets?.binaries);
  const filteredProjectors = filterList(assets?.projectors);
  const filteredLoras = filterList(assets?.loras);

  const totalAssetsCount = (assets?.models.length || 0) + (assets?.binaries.length || 0) + (assets?.projectors.length || 0) + (assets?.loras.length || 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#090b10] border border-amber-500/30 rounded-2xl w-full max-w-4xl shadow-2xl shadow-black flex flex-col overflow-hidden max-h-[88vh] font-mono">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-[#06080d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-100 tracking-wider uppercase">
                  Local Asset Vault & Auto-Discovery
                </h2>
                <span className="px-2 py-0.2 text-[9px] font-bold rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {totalAssetsCount} FOUND
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Auto-scans your local system for llama.cpp binaries, GGUF weights, and vision projectors
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onScan()}
              disabled={isScanning}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-amber-950/40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Scanning PC...' : 'Rescan System'}</span>
            </button>

            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Custom Directory Toolbar */}
        <div className="p-3 bg-[#0c0f16] border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-amber-400/80 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter detected models, weights, or binaries..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#050609] border border-slate-800 focus:border-amber-500/60 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onBrowseCustomFolder}
              className="px-3 py-1.5 rounded-lg bg-[#07090f] hover:bg-slate-800 text-amber-300 border border-slate-700/80 transition-all flex items-center gap-1.5 cursor-pointer text-xs"
            >
              <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>+ Add Folder to Scan</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 pt-2 border-b border-slate-800/80 bg-[#07090e] text-xs">
          <button
            onClick={() => setActiveTab('models')}
            className={`px-4 py-2 rounded-t-lg font-bold flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === 'models'
                ? 'bg-[#090b10] text-amber-400 border-amber-500/40 border-b-transparent'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>GGUF Models ({assets?.models.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('binaries')}
            className={`px-4 py-2 rounded-t-lg font-bold flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === 'binaries'
                ? 'bg-[#090b10] text-amber-400 border-amber-500/40 border-b-transparent'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Llama Binaries ({assets?.binaries.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('projectors')}
            className={`px-4 py-2 rounded-t-lg font-bold flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === 'projectors'
                ? 'bg-[#090b10] text-amber-400 border-amber-500/40 border-b-transparent'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Vision Projectors ({assets?.projectors.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('loras')}
            className={`px-4 py-2 rounded-t-lg font-bold flex items-center gap-2 cursor-pointer border-t border-x ${
              activeTab === 'loras'
                ? 'bg-[#090b10] text-amber-400 border-amber-500/40 border-b-transparent'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>LoRA Adapters ({assets?.loras.length || 0})</span>
          </button>
        </div>

        {/* Content Viewport */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#090b10] space-y-2">
          {/* GGUF MODELS TAB */}
          {activeTab === 'models' && (
            <div className="space-y-2">
              {filteredModels.length === 0 ? (
                <div className="py-16 text-center text-slate-500 space-y-2">
                  <Box className="w-10 h-10 mx-auto text-slate-700" />
                  <p className="text-sm font-bold">No GGUF models discovered yet</p>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Click "+ Add Folder to Scan" to point to your model storage (e.g. LM Studio, Ollama, Hugging Face, or custom drive).
                  </p>
                </div>
              ) : (
                filteredModels.map((model, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#0e121a] border border-slate-800/90 hover:border-amber-500/40 transition-all flex items-center justify-between gap-3 shadow-inner group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-100 truncate block group-hover:text-amber-300 transition-colors">
                          {model.name}
                        </span>
                        <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                          {model.sizeGB} GB
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 truncate block mt-0.5" title={model.path}>
                        {model.path}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          onSelectModel(model, 'model');
                          onClose();
                        }}
                        className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-black transition-all cursor-pointer shadow-sm"
                        title="Load as primary model (-m / --model)"
                      >
                        Load Model (-m)
                      </button>
                      <button
                        onClick={() => {
                          onSelectModel(model, 'model_draft');
                          onClose();
                        }}
                        className="px-2 py-1 text-[11px] font-medium rounded-lg bg-[#07090f] hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all cursor-pointer"
                        title="Load as speculative draft model"
                      >
                        Draft
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* BINARIES TAB */}
          {activeTab === 'binaries' && (
            <div className="space-y-2">
              {filteredBinaries.length === 0 ? (
                <div className="py-16 text-center text-slate-500 space-y-2">
                  <Terminal className="w-10 h-10 mx-auto text-slate-700" />
                  <p className="text-sm font-bold">No llama binaries discovered in standard paths</p>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Use Browse in the top bar or click "+ Add Folder to Scan" to select your llama.cpp build folder.
                  </p>
                </div>
              ) : (
                filteredBinaries.map((bin, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#0e121a] border border-slate-800/90 hover:border-amber-500/40 transition-all flex items-center justify-between gap-3 shadow-inner group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-100 truncate block group-hover:text-amber-300">
                          {bin.name}
                        </span>
                        <span className={`px-2 py-0.2 rounded text-[9px] font-bold uppercase ${
                          bin.type === 'server' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        }`}>
                          {bin.type}
                        </span>
                        {bin.fromPath && (
                          <span className="px-1.5 py-0.2 rounded text-[8px] bg-slate-800 text-slate-400 border border-slate-700">
                            SYSTEM PATH
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 truncate block mt-0.5" title={bin.path}>
                        {bin.path}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        onSelectBinary(bin);
                        onClose();
                      }}
                      className="px-3 py-1 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-black transition-all cursor-pointer shadow-sm shrink-0"
                    >
                      Set Active Executable
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* VISION PROJECTORS TAB */}
          {activeTab === 'projectors' && (
            <div className="space-y-2">
              {filteredProjectors.length === 0 ? (
                <div className="py-16 text-center text-slate-500 space-y-2">
                  <Eye className="w-10 h-10 mx-auto text-slate-700" />
                  <p className="text-sm font-bold">No multimodal projector files (mmproj-*.gguf) detected</p>
                </div>
              ) : (
                filteredProjectors.map((proj, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#0e121a] border border-slate-800/90 hover:border-amber-500/40 transition-all flex items-center justify-between gap-3 shadow-inner"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-xs text-slate-100 truncate block">{proj.name}</span>
                      <span className="text-[10px] text-slate-500 truncate block">{proj.path}</span>
                    </div>
                    <button
                      onClick={() => {
                        onSelectModel(proj, 'mmproj');
                        onClose();
                      }}
                      className="px-3 py-1 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-black transition-all cursor-pointer shadow-sm"
                    >
                      Set as --mmproj
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* LORAS TAB */}
          {activeTab === 'loras' && (
            <div className="space-y-2">
              {filteredLoras.length === 0 ? (
                <div className="py-16 text-center text-slate-500 space-y-2">
                  <Layers className="w-10 h-10 mx-auto text-slate-700" />
                  <p className="text-sm font-bold">No LoRA adapter files detected</p>
                </div>
              ) : (
                filteredLoras.map((lora, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#0e121a] border border-slate-800/90 hover:border-amber-500/40 transition-all flex items-center justify-between gap-3 shadow-inner"
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-xs text-slate-100 truncate block">{lora.name}</span>
                      <span className="text-[10px] text-slate-500 truncate block">{lora.path}</span>
                    </div>
                    <button
                      onClick={() => {
                        onSelectModel(lora, 'lora');
                        onClose();
                      }}
                      className="px-3 py-1 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-400 text-black transition-all cursor-pointer shadow-sm"
                    >
                      Set as --lora
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#06080d] flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Scanned folders:</span>
            <span className="text-slate-300">Downloads, Models, Ollama, LM Studio, HuggingFace, WinGet</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
          >
            Close Vault
          </button>
        </div>
      </div>
    </div>
  );
};
