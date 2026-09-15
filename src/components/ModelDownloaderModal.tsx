import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  HardDrive, 
  ExternalLink,
  Search,
  Check,
  AlertCircle
} from 'lucide-react';

interface ModelPreset {
  name: string;
  repo: string;
  filename: string;
  sizeGB: number;
  params: string;
  quant: string;
  description: string;
  url: string;
}

const FEATURED_MODELS: ModelPreset[] = [
  {
    name: 'Qwen 2.5 7B Instruct',
    repo: 'Qwen/Qwen2.5-7B-Instruct-GGUF',
    filename: 'qwen2.5-7b-instruct-q4_k_m.gguf',
    sizeGB: 4.68,
    params: '7B',
    quant: 'Q4_K_M',
    description: 'Blazing fast, exceptional reasoning, coding & multilingual performance for 6GB+ GPUs.',
    url: 'https://huggingface.co/Qwen/Qwen2.5-7B-Instruct-GGUF/resolve/main/qwen2.5-7b-instruct-q4_k_m.gguf'
  },
  {
    name: 'Qwen 2.5 14B Instruct',
    repo: 'Qwen/Qwen2.5-14B-Instruct-GGUF',
    filename: 'qwen2.5-14b-instruct-q4_k_m.gguf',
    sizeGB: 8.99,
    params: '14B',
    quant: 'Q4_K_M',
    description: 'Gold-standard balance of deep intelligence and speed. Runs at 40+ t/s on 12GB–16GB VRAM.',
    url: 'https://huggingface.co/Qwen/Qwen2.5-14B-Instruct-GGUF/resolve/main/qwen2.5-14b-instruct-q4_k_m.gguf'
  },
  {
    name: 'Llama 3.1 8B Instruct',
    repo: 'bartowski/Meta-Llama-3.1-8B-Instruct-GGUF',
    filename: 'Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf',
    sizeGB: 4.92,
    params: '8B',
    quant: 'Q4_K_M',
    description: "Meta's flagship compact model. Extremely broad general knowledge and tool proficiency.",
    url: 'https://huggingface.co/bartowski/Meta-Llama-3.1-8B-Instruct-GGUF/resolve/main/Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf'
  },
  {
    name: 'DeepSeek R1 Distill Qwen 8B',
    repo: 'bartowski/DeepSeek-R1-Distill-Qwen-8B-GGUF',
    filename: 'DeepSeek-R1-Distill-Qwen-8B-Q4_K_M.gguf',
    sizeGB: 5.05,
    params: '8B',
    quant: 'Q4_K_M',
    description: 'State-of-the-art chain-of-thought reasoning distilled into a lightweight 8B footprint.',
    url: 'https://huggingface.co/bartowski/DeepSeek-R1-Distill-Qwen-8B-GGUF/resolve/main/DeepSeek-R1-Distill-Qwen-8B-Q4_K_M.gguf'
  },
  {
    name: 'DeepSeek R1 Distill Qwen 14B',
    repo: 'bartowski/DeepSeek-R1-Distill-Qwen-14B-GGUF',
    filename: 'DeepSeek-R1-Distill-Qwen-14B-Q4_K_M.gguf',
    sizeGB: 9.36,
    params: '14B',
    quant: 'Q4_K_M',
    description: 'Elite math, STEM & coding reasoning model. Rivals top proprietary models on benchmarks.',
    url: 'https://huggingface.co/bartowski/DeepSeek-R1-Distill-Qwen-14B-GGUF/resolve/main/DeepSeek-R1-Distill-Qwen-14B-Q4_K_M.gguf'
  }
];

interface ModelDownloaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModelUrl?: (url: string) => void;
}

export const ModelDownloaderModal: React.FC<ModelDownloaderModalProps> = ({
  isOpen,
  onClose
}) => {
  const [search, setSearch] = useState('');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = FEATURED_MODELS.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.repo.toLowerCase().includes(search.toLowerCase()) ||
    m.description.toLowerCase().includes(search.toLowerCase())
  );

  const copyUrl = (filename: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(filename);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-mono">
      <div className="bg-[#090b10] border border-cyan-500/30 rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-[#06080d] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Curated GGUF Models Vault
              </h2>
              <p className="text-[11px] text-slate-400 font-sans">
                Verified high-throughput models tuned for optimal GPU quantization and Flash Attention
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-800/80 bg-[#0c0e14] flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-500 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search models (e.g. Qwen, Llama, DeepSeek, 8B, 14B)..."
            className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Model Cards List */}
        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {filtered.map((m) => (
            <div 
              key={m.filename}
              className="bg-[#0e1118] border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-xs font-bold text-slate-100">{m.name}</h3>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-800/50">
                    {m.params}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    {m.quant}
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-950/40 text-amber-300 border border-amber-800/40">
                    {m.sizeGB} GB
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  {m.description}
                </p>
                <div className="text-[10px] text-slate-500 font-mono mt-1.5 truncate">
                  Repo: {m.repo}
                </div>
              </div>

              {/* Actions */}
              <div className="flex sm:flex-col items-center gap-2 shrink-0">
                <a
                  href={m.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-cyan-950/40 cursor-pointer transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>

                <button
                  onClick={() => copyUrl(m.filename, m.url)}
                  className="w-full px-2.5 py-1 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex items-center justify-center gap-1 cursor-pointer"
                  title="Copy direct Hugging Face download link"
                >
                  {copiedUrl === m.filename ? <Check className="w-3 h-3 text-emerald-400" /> : <HardDrive className="w-3 h-3 text-slate-400" />}
                  <span>{copiedUrl === m.filename ? 'Copied Link' : 'Copy URL'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#06080d] flex items-center justify-between text-xs text-slate-400 font-sans">
          <span>
            💡 Save downloaded <code>.gguf</code> files into your <code>Models</code> or <code>Downloads</code> folder. The app will auto-detect them immediately.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold font-mono cursor-pointer transition-colors ml-4 shrink-0"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
