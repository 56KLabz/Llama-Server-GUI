import React from 'react';
import { 
  Box, 
  Cpu, 
  Layers, 
  Globe, 
  Sliders, 
  Image, 
  Zap, 
  Binary, 
  FileCode, 
  Activity, 
  Terminal, 
  PlusCircle, 
  Search,
  CheckCircle2,
  LucideIcon
} from 'lucide-react';
import { CATEGORIES, FlagCategory, FlagDefinition } from '../data/llamaFlags';

const ICON_MAP: Record<string, LucideIcon> = {
  Box,
  Cpu,
  Layers,
  Globe,
  Sliders,
  Image,
  Zap,
  Binary,
  FileCode,
  Activity,
  Terminal,
  PlusCircle
};

interface CategoryNavProps {
  activeCategory: FlagCategory | 'all';
  onSelectCategory: (cat: FlagCategory | 'all') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  flags: FlagDefinition[];
  enabledFlags: Record<string, boolean>;
  onResetAll: () => void;
  onEnableAllQuick: () => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  flags,
  enabledFlags,
  onResetAll
}) => {
  const activeCountTotal = Object.values(enabledFlags).filter(Boolean).length;

  const getCategoryActiveCount = (catId: FlagCategory) => {
    return flags
      .filter(f => f.category === catId && enabledFlags[f.id])
      .length;
  };

  const getCategoryTotalCount = (catId: FlagCategory) => {
    return flags.filter(f => f.category === catId).length;
  };

  return (
    <aside className="w-72 bg-[#06080c] border-r border-slate-800/90 flex flex-col h-full shrink-0 shadow-2xl">
      {/* Search Bar with Noir Monospace Style */}
      <div className="p-3 border-b border-slate-800/80 bg-[#07090e]">
        <div className="relative">
          <Search className="w-4 h-4 text-amber-500/70 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search (--ngl, ctx, temp)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-[#0d1017] border border-slate-800 focus:border-amber-500/60 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-2 text-xs text-slate-400 hover:text-white font-mono cursor-pointer"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Global Active Indicator Banner */}
      <div className="px-3 py-2 border-b border-slate-800/70 flex items-center justify-between text-[11px] bg-[#090b10] font-mono">
        <div className="flex items-center gap-1.5 text-slate-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Active: <strong className="text-amber-300 font-bold">{activeCountTotal} flags</strong></span>
        </div>
        <button
          onClick={onResetAll}
          className="text-rose-400 hover:text-rose-300 hover:underline text-[10px] uppercase font-bold tracking-wider cursor-pointer"
        >
          Reset All
        </button>
      </div>

      {/* Categories List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {/* All Options button */}
        <button
          onClick={() => onSelectCategory('all')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-mono font-medium transition-all text-left cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-md shadow-amber-950/20'
              : 'text-slate-300 hover:bg-[#10141e] hover:text-white border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-amber-400" />
            <span className="font-semibold">ALL HELP OPTIONS</span>
          </div>
          <div className="flex items-center gap-1.5">
            {activeCountTotal > 0 && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/30 text-amber-200 border border-amber-500/40 font-mono">
                {activeCountTotal}
              </span>
            )}
            <span className="text-[10px] text-slate-500 font-mono">({flags.length})</span>
          </div>
        </button>

        {CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.iconName] || Sliders;
          const activeInCat = getCategoryActiveCount(cat.id);
          const totalInCat = getCategoryTotalCount(cat.id);

          if (totalInCat === 0 && cat.id === 'custom') return null;

          const isSelected = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer group font-mono ${
                isSelected
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm'
                  : 'text-slate-400 hover:bg-[#10141e] hover:text-slate-100 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-amber-400' : 'text-slate-500 group-hover:text-amber-400'}`} />
                <span className="truncate text-[11px] uppercase tracking-wide">{cat.label}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 font-mono">
                {activeInCat > 0 && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-500/25 text-amber-300 border border-amber-500/40">
                    {activeInCat}
                  </span>
                )}
                <span className="text-[10px] text-slate-600">
                  {totalInCat}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 56KLABZ Noir Badge Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-[#050609] text-[10px] font-mono text-slate-500 space-y-1">
        <div className="flex items-center justify-between text-amber-400/90 font-bold">
          <span>56KLABZ ENGINE</span>
          <span className="text-emerald-400 font-bold">● ONLINE</span>
        </div>
        <p className="text-slate-500 leading-tight">Every flag dynamically translates to live llama.cpp CLI execution arguments.</p>
      </div>
    </aside>
  );
};
