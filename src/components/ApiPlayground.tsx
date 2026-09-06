import React, { useState } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  RefreshCw, 
  Trash2, 
  Zap, 
  Clock, 
  Sliders, 
  CheckCircle2, 
  AlertCircle,
  Radio
} from 'lucide-react';

interface ApiPlaygroundProps {
  serverHost: string;
  serverPort: number;
  apiKey: string;
  isRunning: boolean;
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  tokensPerSec?: number;
  elapsedMs?: number;
}

export const ApiPlayground: React.FC<ApiPlaygroundProps> = ({
  serverHost,
  serverPort,
  apiKey,
  isRunning
}) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'You are a helpful, intelligent AI assistant powered by llama.cpp.' }
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful, intelligent AI assistant powered by llama.cpp.');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [stream, setStream] = useState(true);
  const [healthStatus, setHealthStatus] = useState<'checking' | 'healthy' | 'unreachable' | 'idle'>('idle');

  const endpointHost = serverHost === '0.0.0.0' ? '127.0.0.1' : serverHost;
  const baseUrl = `http://${endpointHost}:${serverPort}`;

  const checkHealth = async () => {
    setHealthStatus('checking');
    try {
      const res = await fetch(`${baseUrl}/health`, { method: 'GET' });
      if (res.ok) {
        setHealthStatus('healthy');
      } else {
        setHealthStatus('unreachable');
      }
    } catch (e) {
      setHealthStatus('unreachable');
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPrompt.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: inputPrompt.trim() };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputPrompt('');
    setIsLoading(true);

    const startTime = performance.now();

    try {
      const payload = {
        model: 'default',
        messages: newHistory.map(m => ({ role: m.role, content: m.content })),
        temperature: temperature,
        max_tokens: maxTokens,
        stream: stream
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      }

      if (stream) {
        const response = await fetch(`${baseUrl}/v1/chat/completions`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Server returned HTTP ${response.status}: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder('utf-8');
        let assistantReply = '';
        let totalTokens = 0;
        let sseBuffer = '';

        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            sseBuffer += decoder.decode(value, { stream: true });
            const lines = sseBuffer.split('\n');
            sseBuffer = lines.pop() || ''; // keep remaining incomplete line in buffer

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed.startsWith('data:')) continue;
              const dataStr = trimmed.replace(/^data:\s*/, '').trim();
              if (dataStr === '[DONE]') continue;

              try {
                const parsed = JSON.parse(dataStr);
                const delta = parsed.choices?.[0]?.delta?.content || '';
                if (delta) {
                  assistantReply += delta;
                  totalTokens++;

                  setMessages(prev => {
                    const updated = [...prev];
                    const last = updated[updated.length - 1];
                    if (last && last.role === 'assistant') {
                      last.content = assistantReply;
                    }
                    return updated;
                  });
                }
              } catch (err) {}
            }
          }
        }

        const elapsedMs = Math.round(performance.now() - startTime);
        const tokensPerSec = elapsedMs > 0 ? Number(((totalTokens / elapsedMs) * 1000).toFixed(1)) : 0;

        setMessages(prev => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === 'assistant') {
            last.elapsedMs = elapsedMs;
            last.tokensPerSec = tokensPerSec;
          }
          return updated;
        });

      } else {
        const res = await fetch(`${baseUrl}/v1/chat/completions`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          throw new Error(`Server returned HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        const content = data.choices?.[0]?.message?.content || 'No response content';
        const elapsedMs = Math.round(performance.now() - startTime);
        const tokens = data.usage?.completion_tokens || content.split(' ').length;
        const tokensPerSec = Number(((tokens / elapsedMs) * 1000).toFixed(1));

        setMessages(prev => [
          ...prev, 
          { role: 'assistant', content, elapsedMs, tokensPerSec }
        ]);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `❌ Error connecting to server: ${err.message}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'system', content: systemPrompt }]);
  };

  return (
    <div 
      className="flex-1 flex h-full overflow-hidden font-sans"
      style={{ backgroundColor: 'var(--bg-root)' }}
    >
      {/* Chat Conversation View */}
      <div 
        className="flex-1 flex flex-col h-full border-r"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        {/* Playground Header */}
        <div 
          className="border-b px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 font-mono"
          style={{
            backgroundColor: 'var(--bg-panel)',
            borderColor: 'var(--border-subtle)'
          }}
        >
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-bold text-slate-100 uppercase tracking-wider">
              API Chat Playground
            </span>
            <code 
              className="text-[10px] px-2 py-0.5 rounded border"
              style={{
                backgroundColor: 'var(--bg-input)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--accent)'
              }}
            >
              {baseUrl}/v1/chat/completions
            </code>
          </div>

          <div className="flex items-center gap-2 font-mono">
            <button
              onClick={checkHealth}
              className="px-2.5 py-1 text-xs rounded border transition-all flex items-center gap-1.5 cursor-pointer hover:border-white/20"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-primary)'
              }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${healthStatus === 'checking' ? 'animate-spin' : ''}`} />
              <span>Ping Health</span>
            </button>

            {healthStatus === 'healthy' && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 200 OK
              </span>
            )}
            {healthStatus === 'unreachable' && (
              <span className="text-xs text-rose-400 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Offline
              </span>
            )}

            <button
              onClick={clearChat}
              className="p-1.5 rounded text-rose-400 border transition-all cursor-pointer hover:bg-rose-950/20"
              style={{
                backgroundColor: 'var(--bg-card)',
                borderColor: 'var(--border-subtle)'
              }}
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div 
          className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs"
          style={{ backgroundColor: 'var(--bg-root)' }}
        >
          {messages.map((m, idx) => {
            if (m.role === 'system') {
              return (
                <div key={idx} className="bg-[#090c13] border border-amber-500/20 rounded-lg p-2.5 text-amber-200/80 flex items-start gap-2 font-mono">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-400 block mb-0.5">System Prompt:</span>
                    <span>{m.content}</span>
                  </div>
                </div>
              );
            }

            const isUser = m.role === 'user';

            return (
              <div 
                key={idx} 
                className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-amber-400" />
                  </div>
                )}

                <div 
                  className={`max-w-[75%] rounded-xl p-3.5 leading-relaxed shadow-md ${
                    isUser
                      ? 'bg-amber-500 text-black font-medium rounded-tr-none shadow-amber-950/20'
                      : 'bg-[#0b0e16] border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  <p>{m.content || (isLoading && idx === messages.length - 1 ? 'Generating response...' : '')}</p>
                  
                  {m.tokensPerSec !== undefined && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <Zap className="w-3 h-3" /> {m.tokensPerSec} tokens/sec
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <Clock className="w-3 h-3" /> {m.elapsedMs}ms
                      </span>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Prompt Input Form */}
        <form 
          onSubmit={handleSendMessage} 
          className="p-3 border-t flex gap-2 font-mono"
          style={{
            backgroundColor: 'var(--bg-panel)',
            borderColor: 'var(--border-subtle)'
          }}
        >
          <input
            type="text"
            placeholder={isRunning ? "Type a prompt or question..." : "Launch server to begin chat testing..."}
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={isLoading}
            className="flex-1 border rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors"
            style={{
              backgroundColor: 'var(--bg-input)',
              borderColor: 'var(--border-subtle)'
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !inputPrompt.trim()}
            className="px-4 py-2 rounded-lg disabled:opacity-50 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-contrast)'
            }}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>

      {/* Right Sidebar: Playground Sampling Controls */}
      <div 
        className="w-64 p-4 border-l flex flex-col gap-4 overflow-y-auto font-mono"
        style={{
          backgroundColor: 'var(--bg-panel)',
          borderColor: 'var(--border-subtle)'
        }}
      >
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
          <Sliders className="w-4 h-4" />
          <span>Inference Tuning</span>
        </div>

        {/* Temperature */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Temperature:</span>
            <span className="font-mono text-amber-400 font-bold">{temperature}</span>
          </div>
          <input
            type="range"
            min="0"
            max="2"
            step="0.05"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        {/* Max Tokens */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Max Tokens:</span>
            <span className="font-mono text-amber-400 font-bold">{maxTokens}</span>
          </div>
          <input
            type="range"
            min="64"
            max="4096"
            step="64"
            value={maxTokens}
            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
            className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
        </div>

        {/* Streaming switch */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
          <span className="text-slate-400">Stream Output:</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={stream}
              onChange={(e) => setStream(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-slate-900 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-amber-900 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 peer-checked:after:bg-black after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-amber-500"></div>
          </label>
        </div>

        {/* System Prompt config */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
          <span className="text-xs font-bold text-slate-300 uppercase">System Prompt:</span>
          <textarea
            rows={4}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            className="w-full bg-[#030406] border border-slate-800 rounded p-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
          />
        </div>
      </div>
    </div>
  );
};
