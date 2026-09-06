import React, { useState, useEffect } from 'react';
import { PlusCircle, X, Check } from 'lucide-react';
import { FlagDefinition, FlagType, FlagCategory, CATEGORIES } from '../data/llamaFlags';

interface CustomFlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFlag: (flag: FlagDefinition) => void;
}

export const CustomFlagModal: React.FC<CustomFlagModalProps> = ({
  isOpen,
  onClose,
  onAddFlag
}) => {
  const [flagName, setFlagName] = useState('');
  const [flagSwitch, setFlagSwitch] = useState('--');
  const [shortSwitch, setShortSwitch] = useState('-');
  const [category, setCategory] = useState<FlagCategory>('custom');
  const [type, setType] = useState<FlagType>('string');
  const [description, setDescription] = useState('');
  const [defaultValue, setDefaultValue] = useState('');

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagSwitch.trim() || !flagName.trim()) return;

    const formattedFlag = flagSwitch.startsWith('--') ? flagSwitch : `--${flagSwitch.replace(/^-+/, '')}`;
    const formattedShort = shortSwitch.trim() && shortSwitch !== '-' 
      ? (shortSwitch.startsWith('-') ? shortSwitch : `-${shortSwitch}`)
      : undefined;

    const id = 'custom_' + formattedFlag.replace(/^--/, '').replace(/-/g, '_');

    let parsedDefault: any = defaultValue;
    if (type === 'number') parsedDefault = parseFloat(defaultValue) || 0;
    if (type === 'boolean') parsedDefault = defaultValue === 'true';

    const newFlag: FlagDefinition = {
      id,
      flag: formattedFlag,
      short: formattedShort,
      name: flagName,
      category,
      type,
      description: description || 'User defined custom flag',
      detailedHelp: description,
      defaultValue: parsedDefault
    };

    onAddFlag(newFlag);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#090b10] border border-amber-500/30 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden font-mono">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#06080d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Add Custom Parameter</h2>
              <p className="text-xs text-slate-400">Extend the GUI with custom or experimental flags</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 bg-[#090b10]">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Long Flag (e.g. --my-option):</label>
              <input
                type="text"
                placeholder="--my-option"
                value={flagSwitch}
                onChange={(e) => setFlagSwitch(e.target.value)}
                required
                className="w-full bg-[#050609] border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500/60"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Short Flag (Optional):</label>
              <input
                type="text"
                placeholder="-o"
                value={shortSwitch}
                onChange={(e) => setShortSwitch(e.target.value)}
                className="w-full bg-[#050609] border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-300 focus:outline-none focus:border-amber-500/60"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Display Label:</label>
            <input
              type="text"
              placeholder="e.g. Custom Flag Label"
              value={flagName}
              onChange={(e) => setFlagName(e.target.value)}
              required
              className="w-full bg-[#050609] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Category:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as FlagCategory)}
                className="w-full bg-[#050609] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id} className="bg-[#090b10]">{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Control Type:</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as FlagType)}
                className="w-full bg-[#050609] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
              >
                <option value="string" className="bg-[#090b10]">String</option>
                <option value="number" className="bg-[#090b10]">Number</option>
                <option value="boolean" className="bg-[#090b10]">Boolean Switch</option>
                <option value="file" className="bg-[#090b10]">File Browser</option>
                <option value="directory" className="bg-[#090b10]">Directory Browser</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Default Value:</label>
            <input
              type="text"
              placeholder="e.g. default setting"
              value={defaultValue}
              onChange={(e) => setDefaultValue(e.target.value)}
              className="w-full bg-[#050609] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Description / Help Text:</label>
            <textarea
              rows={3}
              placeholder="What does this parameter do?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#050609] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-950/40"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Add Parameter</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
