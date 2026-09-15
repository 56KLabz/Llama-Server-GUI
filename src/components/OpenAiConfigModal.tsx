import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Terminal, 
  Code2, 
  Globe, 
  Layers, 
  ExternalLink,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface OpenAiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  serverHost: string;
  serverPort: number;
  apiKey: string;
  activeModelName?: string;
}

export const OpenAiConfigModal: React.FC<OpenAiConfigModalProps> = ({
  isOpen,
  onClose,
  serverHost,
  serverPort,
  apiKey,
  activeModelName
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'url' | 'vscode' | 'python' | 'curl' | 'webui'>('url');

  if (!isOpen) return null;

  const host = serverHost === '0.0.0.0' ? '127.0.0.1' : serverHost;
  const baseUrl = `http://${host}:${serverPort}/v1`;
  const modelName = activeModelName || 'default';
  const effectiveKey = apiKey || 'not-needed';

  const copySnippet = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const continueConfig = JSON.stringify({
    models: [
      {
        title: activeModelName ? activeModelName.replace(/\.gguf$/i, '') : 'Local Llama Model',
        provider: 'openai',
        model: modelName,
        apiBase: baseUrl,
        apiKey: effectiveKey
      }
    ]
  }, null, 2);

  const pythonSnippet = `from openai import OpenAI

client = OpenAI(
    base_url="${baseUrl}",
    api_key="${effectiveKey}"
)

response = client.chat.completions.create(
    model="${modelName}",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello world!"}
    ],
    temperature=0.7,
    stream=True
)

for chunk in response:
    content = chunk.choices[0].delta.content or ""
    print(content, end="", flush=True)
print()`;

  const curlSnippet = `curl "${baseUrl}/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${effectiveKey}" \\
  -d '{
    "model": "${modelName}",
    "messages": [{"role": "user", "content": "Hello!"}],
    "temperature": 0.7
  }'`;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#090b10] border border-slate-700/80 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden font-mono text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-[#06080d] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Connect External Apps & Tools
              </h2>
              <p className="text-[11px] text-slate-400 font-sans">
                Universal OpenAI-compatible API endpoint hosted on port {serverPort}
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-[#0c0e14] px-4 pt-2 gap-2 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('url')}
            className={`px-3 py-1.5 rounded-t-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'url'
                ? 'bg-[#090b10] text-emerald-400 border-t border-x border-slate-700 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Endpoint URL</span>
          </button>

          <button
            onClick={() => setActiveTab('vscode')}
            className={`px-3 py-1.5 rounded-t-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'vscode'
                ? 'bg-[#090b10] text-emerald-400 border-t border-x border-slate-700 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>VS Code / Continue</span>
          </button>

          <button
            onClick={() => setActiveTab('webui')}
            className={`px-3 py-1.5 rounded-t-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'webui'
                ? 'bg-[#090b10] text-emerald-400 border-t border-x border-slate-700 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>OpenWebUI / LibreChat</span>
          </button>

          <button
            onClick={() => setActiveTab('python')}
            className={`px-3 py-1.5 rounded-t-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'python'
                ? 'bg-[#090b10] text-emerald-400 border-t border-x border-slate-700 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Python SDK</span>
          </button>

          <button
            onClick={() => setActiveTab('curl')}
            className={`px-3 py-1.5 rounded-t-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'curl'
                ? 'bg-[#090b10] text-emerald-400 border-t border-x border-slate-700 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>cURL</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
          {activeTab === 'url' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 font-semibold mb-1.5 block">
                  OpenAI Base URL (Plug into any OpenAI-compatible client):
                </label>
                <div className="flex items-center gap-2 bg-[#040507] border border-slate-800 rounded-lg p-2.5">
                  <span className="text-xs text-emerald-300 select-all flex-1 font-bold">{baseUrl}</span>
                  <button
                    onClick={() => copySnippet('url', baseUrl)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded border border-slate-700 transition-all flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    {copiedKey === 'url' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'url' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#0e1118] p-3 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">API Key</div>
                  <div className="text-xs text-slate-200 mt-1 font-mono truncate">
                    {apiKey ? apiKey : '(Optional / anything)'}
                  </div>
                </div>

                <div className="bg-[#0e1118] p-3 rounded-lg border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase font-bold">Model Identifier</div>
                  <div className="text-xs text-slate-200 mt-1 font-mono truncate" title={modelName}>
                    {modelName}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300 font-sans flex items-start gap-2">
                <span className="text-base">💡</span>
                <span>
                  Any application that works with the official OpenAI API (like Continue in VS Code, Roo Code, LibreChat, Obsidian Smart Connections, or SillyTavern) can point directly to this endpoint with zero code changes!
                </span>
              </div>
            </div>
          )}

          {activeTab === 'vscode' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-sans">
                  Paste into your <code>~/.continue/config.json</code>:
                </span>
                <button
                  onClick={() => copySnippet('continue', continueConfig)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded border border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'continue' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'continue' ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>
              <pre className="bg-[#040507] border border-slate-800 rounded-lg p-3 text-xs text-slate-300 overflow-x-auto leading-relaxed">
                {continueConfig}
              </pre>
            </div>
          )}

          {activeTab === 'webui' && (
            <div className="space-y-3 font-sans text-xs text-slate-300 leading-relaxed">
              <h3 className="font-bold text-slate-100 font-mono">OpenWebUI / LibreChat Setup:</h3>
              <ol className="list-decimal list-inside space-y-2 bg-[#0e1118] p-4 rounded-xl border border-slate-800">
                <li>Open your WebUI Settings $\rightarrow$ <strong>Connections / OpenAI API</strong>.</li>
                <li>Set <strong>API Base URL</strong> to: <code className="text-emerald-400 font-mono bg-black/40 px-1 py-0.5 rounded">{baseUrl}</code></li>
                <li>Set <strong>API Key</strong> to: <code className="text-amber-400 font-mono bg-black/40 px-1 py-0.5 rounded">{effectiveKey}</code> (or any string if authentication is disabled).</li>
                <li>Click <strong>Verify Connection</strong> to instantly populate all available models.</li>
              </ol>
            </div>
          )}

          {activeTab === 'python' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-sans">
                  Python snippet using the official <code>openai</code> package:
                </span>
                <button
                  onClick={() => copySnippet('python', pythonSnippet)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded border border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'python' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'python' ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>
              <pre className="bg-[#040507] border border-slate-800 rounded-lg p-3 text-xs text-slate-300 overflow-x-auto leading-relaxed">
                {pythonSnippet}
              </pre>
            </div>
          )}

          {activeTab === 'curl' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-sans">Test with cURL in terminal:</span>
                <button
                  onClick={() => copySnippet('curl', curlSnippet)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded border border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === 'curl' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'curl' ? 'Copied' : 'Copy cURL'}</span>
                </button>
              </div>
              <pre className="bg-[#040507] border border-slate-800 rounded-lg p-3 text-xs text-slate-300 overflow-x-auto leading-relaxed">
                {curlSnippet}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#06080d] flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-sans">
            Status: {serverHost}:{serverPort} (OpenAI v1 Protocol)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
