export type FlagType = 'boolean' | 'number' | 'string' | 'file' | 'directory' | 'enum' | 'array';

export type FlagCategory = 
  | 'model'
  | 'gpu'
  | 'context'
  | 'sampling'
  | 'server'
  | 'multimodal'
  | 'speculative'
  | 'embeddings'
  | 'templates'
  | 'performance'
  | 'logging'
  | 'custom';

export interface FlagDefinition {
  id: string;
  flag: string;
  short?: string;
  name: string;
  category: FlagCategory;
  type: FlagType;
  description: string;
  detailedHelp?: string;
  defaultValue?: any;
  options?: string[]; // for enum
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  fileFilters?: { name: string; extensions: string[] }[];
  isServerOnly?: boolean;
  isAdvanced?: boolean;
  quickAction?: boolean;
}

export const CATEGORIES: { id: FlagCategory; label: string; iconName: string; desc: string }[] = [
  { id: 'model', label: 'Model & Weights', iconName: 'Box', desc: 'GGUF models, Hugging Face repos, LoRA adapters, and control vectors' },
  { id: 'gpu', label: 'GPU & Hardware', iconName: 'Cpu', desc: 'GPU offloading layers, split mode, VRAM allocation, Flash Attention, mlock' },
  { id: 'context', label: 'Context & Batching', iconName: 'Layers', desc: 'Context window size, batching, KV cache quantization, and RoPE scaling' },
  { id: 'server', label: 'Server & Network', iconName: 'Globe', desc: 'Host, port, parallel slots, API keys, SSL certificates, and endpoints' },
  { id: 'sampling', label: 'Sampling & Output', iconName: 'Sliders', desc: 'Temperature, Top-P, Min-P, penalties, Mirostat, and sampler chains' },
  { id: 'multimodal', label: 'Vision & Multimodal', iconName: 'Image', desc: 'CLIP and vision projectors (LLaVA, Qwen2-VL, MiniCPM)' },
  { id: 'speculative', label: 'Speculative Decoding', iconName: 'Zap', desc: 'Draft models and acceleration parameters' },
  { id: 'embeddings', label: 'Embeddings & Rerank', iconName: 'Binary', desc: 'Vector embeddings, reranking models, and pooling options' },
  { id: 'templates', label: 'Templates & Grammar', iconName: 'FileCode', desc: 'Jinja chat templates, JSON schema constraints, and BNF grammars' },
  { id: 'performance', label: 'Threads & Concurrency', iconName: 'Activity', desc: 'CPU threads, micro-batches, thread affinity, and NUMA tuning' },
  { id: 'logging', label: 'Logging & Metrics', iconName: 'Terminal', desc: 'Log levels, JSON output, Prometheus metrics, and tensor checks' },
  { id: 'custom', label: 'Custom & Discovered', iconName: 'PlusCircle', desc: 'Manually added or dynamically parsed flags from --help' },
];

export const LLAMA_FLAGS: FlagDefinition[] = [
  // --- MODEL & WEIGHTS ---
  {
    id: 'model',
    flag: '--model',
    short: '-m',
    name: 'Model File (GGUF)',
    category: 'model',
    type: 'file',
    description: 'Path to the primary GGUF model file to load.',
    detailedHelp: 'The main quantized or unquantized model file in GGUF format (e.g. Meta-Llama-3-8B-Instruct.Q4_K_M.gguf).',
    fileFilters: [{ name: 'GGUF Models', extensions: ['gguf'] }],
    quickAction: true
  },
  {
    id: 'model_url',
    flag: '--model-url',
    short: '-mu',
    name: 'Model Direct URL',
    category: 'model',
    type: 'string',
    description: 'Direct HTTP/HTTPS URL to download and cache the GGUF model from.',
    detailedHelp: 'Downloads the model directly into local cache if not present.'
  },
  {
    id: 'hf_repo',
    flag: '--hf-repo',
    short: '-hf',
    name: 'Hugging Face Repo',
    category: 'model',
    type: 'string',
    description: 'Hugging Face repository ID (e.g. unsloth/Meta-Llama-3.1-8B-Instruct-GGUF).',
    detailedHelp: 'Automatically pulls the model from Hugging Face hub without needing manual downloads.'
  },
  {
    id: 'hf_file',
    flag: '--hf-file',
    short: '-hff',
    name: 'Hugging Face File',
    category: 'model',
    type: 'string',
    description: 'Specific GGUF filename inside the Hugging Face repository.',
    detailedHelp: 'Filename inside the repository (e.g. Meta-Llama-3.1-8B-Instruct-Q4_K_M.gguf).'
  },
  {
    id: 'hf_token',
    flag: '--hf-token',
    short: '-hft',
    name: 'Hugging Face Token',
    category: 'model',
    type: 'string',
    description: 'Hugging Face authentication token for gated / private models.'
  },
  {
    id: 'alias',
    flag: '--alias',
    short: '-a',
    name: 'Model Alias',
    category: 'model',
    type: 'string',
    description: 'Set custom alias for model (e.g. gpt-4o, llama3, my-assistant) for API compatibility.',
    detailedHelp: 'Allows client tools (like LangChain, OpenAI SDK, Continue) to request this model by alias name.'
  },
  {
    id: 'lora',
    flag: '--lora',
    name: 'LoRA Adapter File',
    category: 'model',
    type: 'file',
    description: 'Path to LoRA adapter file to apply on top of the base model.',
    fileFilters: [{ name: 'GGUF LoRA', extensions: ['gguf'] }]
  },
  {
    id: 'lora_scaled',
    flag: '--lora-scaled',
    name: 'Scaled LoRA Adapter',
    category: 'model',
    type: 'string',
    description: 'Path to LoRA adapter with scale factor: <file> <scale> (e.g. ./adapter.gguf 0.75).'
  },
  {
    id: 'lora_base',
    flag: '--lora-base',
    name: 'LoRA Base Model',
    category: 'model',
    type: 'file',
    description: 'Optional base model to use with the LoRA adapter.',
    fileFilters: [{ name: 'GGUF Models', extensions: ['gguf'] }]
  },
  {
    id: 'control_vector',
    flag: '--control-vector',
    name: 'Control Vector File',
    category: 'model',
    type: 'file',
    description: 'Path to control vector file to modify behavior representation.'
  },
  {
    id: 'control_vector_scaled',
    flag: '--control-vector-scaled',
    name: 'Control Vector Scaled',
    category: 'model',
    type: 'string',
    description: 'Path to control vector with custom scale: <file> <scale>.'
  },

  // --- GPU & HARDWARE ACCELERATION ---
  {
    id: 'n_gpu_layers',
    flag: '--n-gpu-layers',
    short: '-ngl',
    name: 'GPU Layers Offload',
    category: 'gpu',
    type: 'number',
    defaultValue: 99,
    min: 0,
    max: 250,
    unit: 'layers',
    description: 'Number of model layers to offload to GPU VRAM (99 = entire model).',
    detailedHelp: 'Offloading all or most layers to GPU dramatically increases inference speed (CUDA/Vulkan/Metal/ROCm). Set to 0 for pure CPU.',
    quickAction: true
  },
  {
    id: 'n_gpu_layers_draft',
    flag: '--n-gpu-layers-draft',
    short: '-ngld',
    name: 'Draft GPU Layers',
    category: 'gpu',
    type: 'number',
    defaultValue: 99,
    min: 0,
    max: 250,
    unit: 'layers',
    description: 'Number of layers to offload to GPU for the speculative draft model.'
  },
  {
    id: 'split_mode',
    flag: '--split-mode',
    short: '-sm',
    name: 'Multi-GPU Split Mode',
    category: 'gpu',
    type: 'enum',
    defaultValue: 'layer',
    options: ['layer', 'row', 'none'],
    description: 'How to distribute layers across multiple physical GPUs.'
  },
  {
    id: 'tensor_split',
    flag: '--tensor-split',
    short: '-ts',
    name: 'Tensor Split Fractions',
    category: 'gpu',
    type: 'string',
    description: 'Fraction of model to offload to each GPU as comma-separated values (e.g. 3,1 for 75% GPU0, 25% GPU1).'
  },
  {
    id: 'main_gpu',
    flag: '--main-gpu',
    short: '-mg',
    name: 'Main GPU Index',
    category: 'gpu',
    type: 'number',
    defaultValue: 0,
    min: 0,
    max: 16,
    description: 'Primary GPU index for scratch buffers and small operations (default: 0).'
  },
  {
    id: 'flash_attn',
    flag: '--flash-attn',
    short: '-fa',
    name: 'Flash Attention',
    category: 'gpu',
    type: 'enum',
    defaultValue: 'on',
    options: ['on', 'off', 'auto'],
    description: "Set Flash Attention use ('on', 'off', or 'auto'). Significantly reduces VRAM and speeds up context processing.",
    detailedHelp: "Modern llama.cpp supports -fa [on|off|auto]. Enables fused high-performance flash attention kernels.",
    quickAction: true
  },
  {
    id: 'no_kv_offload',
    flag: '--no-kv-offload',
    short: '-nkvo',
    name: 'Disable KV Offload',
    category: 'gpu',
    type: 'boolean',
    defaultValue: false,
    description: 'Do not offload KV cache to GPU (keeps KV cache exclusively in system RAM to save VRAM).'
  },
  {
    id: 'gpu_reserve_mb_main',
    flag: '--gpu-reserve-mb-main',
    name: 'Main GPU Reserve VRAM',
    category: 'gpu',
    type: 'number',
    unit: 'MB',
    min: 0,
    max: 48000,
    description: 'Reserve fixed amount of VRAM on main GPU for OS/Display (in MB).'
  },
  {
    id: 'gpu_reserve_mb_alt',
    flag: '--gpu-reserve-mb-alt',
    name: 'Secondary GPU Reserve VRAM',
    category: 'gpu',
    type: 'number',
    unit: 'MB',
    min: 0,
    max: 48000,
    description: 'Reserve fixed amount of VRAM on secondary GPUs (in MB).'
  },
  {
    id: 'no_mmap',
    flag: '--no-mmap',
    name: 'Disable Memory Map (no-mmap)',
    category: 'gpu',
    type: 'boolean',
    defaultValue: false,
    description: 'Do not memory-map the model; load entire weights directly into RAM on startup.',
    detailedHelp: 'Prevents page faults and slow loading over network drives or slow disks.'
  },
  {
    id: 'mlock',
    flag: '--mlock',
    name: 'Lock Model in RAM (mlock)',
    category: 'gpu',
    type: 'boolean',
    defaultValue: false,
    description: 'Force the operating system to lock model in physical RAM and prevent swapping.'
  },
  {
    id: 'numa',
    flag: '--numa',
    name: 'NUMA Strategy',
    category: 'gpu',
    type: 'enum',
    defaultValue: 'none',
    options: ['none', 'distribute', 'isolate', 'numactl'],
    description: 'NUMA memory optimization strategy for multi-socket CPU systems.'
  },

  // --- CONTEXT & BATCHING ---
  {
    id: 'ctx_size',
    flag: '--ctx-size',
    short: '-c',
    name: 'Context Size (Tokens)',
    category: 'context',
    type: 'number',
    defaultValue: 8192,
    min: 0,
    max: 131072,
    step: 512,
    unit: 'tokens',
    description: 'Size of the prompt context window (0 = native model default, e.g. 8192, 16384, 32768, 131072).',
    detailedHelp: 'Allocates KV cache for context memory. 0 loads the maximum context embedded in the GGUF header.',
    quickAction: true
  },
  {
    id: 'batch_size',
    flag: '--batch-size',
    short: '-b',
    name: 'Logical Batch Size',
    category: 'context',
    type: 'number',
    defaultValue: 2048,
    min: 16,
    max: 8192,
    step: 128,
    unit: 'tokens',
    description: 'Logical batch size for prompt processing.',
    detailedHelp: 'Larger batch sizes process long input prompts much faster if you have sufficient VRAM.'
  },
  {
    id: 'ubatch_size',
    flag: '--ubatch-size',
    short: '-ub',
    name: 'Physical Micro-Batch Size',
    category: 'context',
    type: 'number',
    defaultValue: 512,
    min: 16,
    max: 4096,
    step: 64,
    unit: 'tokens',
    description: 'Physical micro-batch size for compute operations (default: 512).'
  },
  {
    id: 'cont_batching',
    flag: '--cont-batching',
    short: '-cb',
    name: 'Continuous Batching',
    category: 'context',
    type: 'boolean',
    defaultValue: true,
    description: 'Enable cellular continuous batching for multi-slot concurrent requests.',
    quickAction: true
  },
  {
    id: 'cache_type_k',
    flag: '--cache-type-k',
    short: '-ctk',
    name: 'KV Cache Type (K)',
    category: 'context',
    type: 'enum',
    defaultValue: 'f16',
    options: ['f16', 'q8_0', 'q4_0', 'q4_1', 'iq4_nl', 'q5_0', 'q5_1', 'bf16', 'f32'],
    description: 'Data type for Key cache (e.g. q8_0 or q4_0 significantly reduces VRAM footprint with minimal quality loss).'
  },
  {
    id: 'cache_type_v',
    flag: '--cache-type-v',
    short: '-ctv',
    name: 'KV Cache Type (V)',
    category: 'context',
    type: 'enum',
    defaultValue: 'f16',
    options: ['f16', 'q8_0', 'q4_0', 'q4_1', 'iq4_nl', 'q5_0', 'q5_1', 'bf16', 'f32'],
    description: 'Data type for Value cache (q8_0 or q4_0 cuts VRAM consumption by 50% to 75%).'
  },
  {
    id: 'defrag_thold',
    flag: '--defrag-thold',
    name: 'KV Defrag Threshold',
    category: 'context',
    type: 'number',
    defaultValue: 0.1,
    min: 0.0,
    max: 1.0,
    step: 0.05,
    description: 'KV cache defragmentation threshold (0.0 to 1.0, default: 0.1).'
  },
  {
    id: 'rope_scaling',
    flag: '--rope-scaling',
    name: 'RoPE Scaling Method',
    category: 'context',
    type: 'enum',
    defaultValue: 'none',
    options: ['none', 'linear', 'yarn'],
    description: 'RoPE frequency scaling method for context extension beyond native model limit.'
  },
  {
    id: 'rope_scale',
    flag: '--rope-scale',
    name: 'RoPE Linear Scale',
    category: 'context',
    type: 'number',
    min: 0.1,
    max: 16.0,
    step: 0.1,
    description: 'RoPE context linear scaling factor.'
  },
  {
    id: 'rope_freq_base',
    flag: '--rope-freq-base',
    name: 'RoPE Base Frequency',
    category: 'context',
    type: 'number',
    min: 0,
    max: 10000000,
    unit: 'Hz',
    description: 'RoPE base frequency (e.g. 500000 for Llama 3).'
  },
  {
    id: 'rope_freq_scale',
    flag: '--rope-freq-scale',
    name: 'RoPE Frequency Scale',
    category: 'context',
    type: 'number',
    min: 0.0,
    max: 10.0,
    step: 0.05,
    description: 'RoPE frequency scale factor.'
  },
  {
    id: 'yarn_orig_ctx',
    flag: '--yarn-orig-ctx',
    name: 'YaRN Original Context',
    category: 'context',
    type: 'number',
    min: 512,
    max: 131072,
    description: 'Original context size of model before YaRN scaling.'
  },
  {
    id: 'yarn_ext_factor',
    flag: '--yarn-ext-factor',
    name: 'YaRN Extrapolation Factor',
    category: 'context',
    type: 'number',
    defaultValue: -1.0,
    step: 0.1,
    description: 'YaRN extrapolation mix factor.'
  },
  {
    id: 'yarn_attn_factor',
    flag: '--yarn-attn-factor',
    name: 'YaRN Attention Scale',
    category: 'context',
    type: 'number',
    defaultValue: 1.0,
    step: 0.1,
    description: 'YaRN magnitude attention scaling factor.'
  },

  // --- SERVER & NETWORKING ---
  {
    id: 'host',
    flag: '--host',
    name: 'Server Host / Bind IP',
    category: 'server',
    type: 'string',
    defaultValue: '127.0.0.1',
    description: 'IP address to bind the HTTP server to (use 0.0.0.0 for all LAN interfaces, 127.0.0.1 for local only).',
    quickAction: true,
    isServerOnly: true
  },
  {
    id: 'port',
    flag: '--port',
    name: 'Server Port',
    category: 'server',
    type: 'number',
    defaultValue: 8080,
    min: 1,
    max: 65535,
    description: 'TCP port to listen on (default: 8080).',
    quickAction: true,
    isServerOnly: true
  },
  {
    id: 'api_key',
    flag: '--api-key',
    name: 'API Key (Auth)',
    category: 'server',
    type: 'string',
    description: 'Secret bearer API key for OpenAI compatible API authorization (header: Authorization: Bearer <key>).',
    isServerOnly: true
  },
  {
    id: 'api_key_file',
    flag: '--api-key-file',
    name: 'API Key File',
    category: 'server',
    type: 'file',
    description: 'Path to text file containing list of valid API keys.',
    isServerOnly: true
  },
  {
    id: 'parallel',
    flag: '--parallel',
    short: '-np',
    name: 'Parallel Slots (Concurrency)',
    category: 'server',
    type: 'number',
    defaultValue: 1,
    min: 1,
    max: 64,
    description: 'Number of simultaneous client requests to process concurrently.',
    detailedHelp: 'Each slot shares the model weights but creates an independent context slice in KV cache.',
    isServerOnly: true,
    quickAction: true
  },
  {
    id: 'timeout',
    flag: '--timeout',
    name: 'HTTP Timeout',
    category: 'server',
    type: 'number',
    defaultValue: 600,
    min: 10,
    max: 3600,
    unit: 'sec',
    description: 'Server request timeout in seconds (default: 600).',
    isServerOnly: true
  },
  {
    id: 'threads_http',
    flag: '--threads-http',
    name: 'HTTP Worker Threads',
    category: 'server',
    type: 'number',
    defaultValue: 4,
    min: 1,
    max: 32,
    description: 'Number of threads dedicated to handling incoming HTTP networking requests.',
    isServerOnly: true
  },
  {
    id: 'webui_path',
    flag: '--path',
    name: 'Static Web UI Path',
    category: 'server',
    type: 'directory',
    description: 'Path to serve static frontend files from.',
    isServerOnly: true
  },
  {
    id: 'no_webui',
    flag: '--no-webui',
    name: 'Disable Web UI',
    category: 'server',
    type: 'boolean',
    defaultValue: false,
    description: 'Disable serving the built-in llama.cpp web chat frontend.',
    isServerOnly: true
  },
  {
    id: 'metrics',
    flag: '--metrics',
    name: 'Prometheus Metrics',
    category: 'server',
    type: 'boolean',
    defaultValue: true,
    description: 'Enable Prometheus /metrics endpoint for live monitoring of requests, tokens/sec, and slots.',
    isServerOnly: true
  },
  {
    id: 'slots_endpoint',
    flag: '--slots',
    name: 'Slots Monitor Endpoint',
    category: 'server',
    type: 'boolean',
    defaultValue: true,
    description: 'Enable /slots monitoring endpoint to inspect active token generation state per slot.',
    isServerOnly: true
  },
  {
    id: 'props_endpoint',
    flag: '--props',
    name: 'Props Endpoint',
    category: 'server',
    type: 'boolean',
    defaultValue: true,
    description: 'Enable /props endpoint to expose model and server properties.',
    isServerOnly: true
  },
  {
    id: 'ssl_key_file',
    flag: '--ssl-key-file',
    name: 'SSL Key File',
    category: 'server',
    type: 'file',
    description: 'Path to SSL/TLS private key for HTTPS encryption.',
    isServerOnly: true
  },
  {
    id: 'ssl_cert_file',
    flag: '--ssl-cert-file',
    name: 'SSL Cert File',
    category: 'server',
    type: 'file',
    description: 'Path to SSL/TLS public certificate for HTTPS.',
    isServerOnly: true
  },
  {
    id: 'models_dir',
    flag: '--models-dir',
    name: 'Models Directory (Router Mode)',
    category: 'server',
    type: 'directory',
    description: 'Directory for Multi-Model Router Mode. Server automatically discovers and dynamically loads/unloads models on demand.',
    detailedHelp: 'When running without a single model specified, llama-server enters router mode and hosts all models found in this folder.',
    isServerOnly: true,
    quickAction: true
  },
  {
    id: 'models_max',
    flag: '--models-max',
    name: 'Max Router Models in Memory',
    category: 'server',
    type: 'number',
    defaultValue: 4,
    min: 1,
    max: 32,
    description: 'Maximum number of models the router keeps loaded concurrently before LRU eviction.',
    isServerOnly: true
  },
  {
    id: 'jinja',
    flag: '--jinja',
    name: 'Jinja2 Chat Templates & Function Calling',
    category: 'server',
    type: 'boolean',
    defaultValue: true,
    description: 'Enable Jinja template engine for chat templating and native OpenAI-compatible tool/function calling.',
    isServerOnly: true,
    quickAction: true
  },
  {
    id: 'chat_template_file',
    flag: '--chat-template-file',
    name: 'Custom Chat Template File',
    category: 'server',
    type: 'file',
    description: 'Path to a custom Jinja chat template file override.',
    isServerOnly: true
  },
  {
    id: 'cache_ram',
    flag: '--cache-ram',
    name: 'Host-RAM Prompt Caching',
    category: 'context',
    type: 'boolean',
    defaultValue: false,
    description: 'Store pre-computed prompt representations in system RAM instead of VRAM to drastically reduce TTFT on recurring prompts.',
    detailedHelp: 'Shares prefix computations across slots and frees up valuable GPU memory.'
  },

  // --- SAMPLING & OUTPUT ---
  {
    id: 'temp',
    flag: '--temp',
    name: 'Temperature',
    category: 'sampling',
    type: 'number',
    defaultValue: 0.7,
    min: 0.0,
    max: 2.0,
    step: 0.05,
    description: 'Higher values make the output more creative, lower values more deterministic (0 = greedy/deterministic).',
    quickAction: true
  },
  {
    id: 'top_p',
    flag: '--top-p',
    name: 'Top-P (Nucleus)',
    category: 'sampling',
    type: 'number',
    defaultValue: 0.95,
    min: 0.0,
    max: 1.0,
    step: 0.01,
    description: 'Top-p (nucleus) sampling threshold (1.0 = disabled).'
  },
  {
    id: 'top_k',
    flag: '--top-k',
    name: 'Top-K',
    category: 'sampling',
    type: 'number',
    defaultValue: 40,
    min: 0,
    max: 200,
    description: 'Top-k sampling cutoff (0 = disabled, 40 = top 40 candidates).'
  },
  {
    id: 'min_p',
    flag: '--min-p',
    name: 'Min-P Sampling',
    category: 'sampling',
    type: 'number',
    defaultValue: 0.05,
    min: 0.0,
    max: 1.0,
    step: 0.01,
    description: 'Min-p sampling threshold relative to the most likely token (0.0 = disabled, 0.05 is widely praised).'
  },
  {
    id: 'typical',
    flag: '--typical',
    name: 'Locally Typical Sampling',
    category: 'sampling',
    type: 'number',
    defaultValue: 1.0,
    min: 0.0,
    max: 1.0,
    step: 0.05,
    description: 'Locally typical sampling parameter p (1.0 = disabled).'
  },
  {
    id: 'repeat_penalty',
    flag: '--repeat-penalty',
    name: 'Repetition Penalty',
    category: 'sampling',
    type: 'number',
    defaultValue: 1.05,
    min: 0.0,
    max: 2.0,
    step: 0.05,
    description: 'Penalty for repeating tokens (1.0 = disabled, 1.1 = moderate penalty).'
  },
  {
    id: 'repeat_last_n',
    flag: '--repeat-last-n',
    name: 'Repeat Last N Tokens',
    category: 'sampling',
    type: 'number',
    defaultValue: 64,
    min: -1,
    max: 2048,
    unit: 'tokens',
    description: 'Number of recent tokens to consider for repetition penalty (0 = disabled, -1 = full context).'
  },
  {
    id: 'presence_penalty',
    flag: '--presence-penalty',
    name: 'Presence Penalty',
    category: 'sampling',
    type: 'number',
    defaultValue: 0.0,
    min: -2.0,
    max: 2.0,
    step: 0.1,
    description: 'OpenAI-style presence penalty: encourages new topics.'
  },
  {
    id: 'frequency_penalty',
    flag: '--frequency-penalty',
    name: 'Frequency Penalty',
    category: 'sampling',
    type: 'number',
    defaultValue: 0.0,
    min: -2.0,
    max: 2.0,
    step: 0.1,
    description: 'OpenAI-style frequency penalty: penalizes verbatim token repetition.'
  },
  {
    id: 'dynatemp_range',
    flag: '--dynatemp-range',
    name: 'Dynamic Temperature Range',
    category: 'sampling',
    type: 'number',
    defaultValue: 0.0,
    min: 0.0,
    max: 2.0,
    step: 0.1,
    description: 'Dynamic temperature range: varies temperature dynamically depending on token entropy.'
  },
  {
    id: 'dynatemp_exp',
    flag: '--dynatemp-exp',
    name: 'Dynamic Temp Exponent',
    category: 'sampling',
    type: 'number',
    defaultValue: 1.0,
    min: 0.1,
    max: 5.0,
    step: 0.1,
    description: 'Dynamic temperature exponent.'
  },
  {
    id: 'mirostat',
    flag: '--mirostat',
    name: 'Mirostat Algorithm',
    category: 'sampling',
    type: 'enum',
    defaultValue: '0',
    options: ['0', '1', '2'],
    description: 'Mirostat sampling algorithm (0 = disabled, 1 = Mirostat 1.0, 2 = Mirostat 2.0).'
  },
  {
    id: 'mirostat_lr',
    flag: '--mirostat-lr',
    name: 'Mirostat Learning Rate (eta)',
    category: 'sampling',
    type: 'number',
    defaultValue: 0.1,
    min: 0.01,
    max: 1.0,
    step: 0.01,
    description: 'Mirostat learning rate eta.'
  },
  {
    id: 'mirostat_ent',
    flag: '--mirostat-ent',
    name: 'Mirostat Target Entropy (tau)',
    category: 'sampling',
    type: 'number',
    defaultValue: 5.0,
    min: 1.0,
    max: 10.0,
    step: 0.1,
    description: 'Mirostat target entropy tau.'
  },
  {
    id: 'seed',
    flag: '--seed',
    short: '-s',
    name: 'RNG Seed',
    category: 'sampling',
    type: 'number',
    defaultValue: -1,
    description: 'Random number generator seed (-1 for random seed, fixed number for deterministic outputs).'
  },
  {
    id: 'n_predict',
    flag: '--n-predict',
    short: '-n',
    name: 'Max Tokens to Predict',
    category: 'sampling',
    type: 'number',
    defaultValue: -1,
    min: -2,
    max: 32768,
    unit: 'tokens',
    description: 'Maximum number of tokens to generate (-1 = infinite/model limit, -2 = until context filled).'
  },
  {
    id: 'ignore_eos',
    flag: '--ignore-eos',
    name: 'Ignore EOS Token',
    category: 'sampling',
    type: 'boolean',
    defaultValue: false,
    description: 'Ignore end-of-sequence token and keep generating text until max context.'
  },
  {
    id: 'samplers',
    flag: '--samplers',
    name: 'Sampler Sequence Order',
    category: 'sampling',
    type: 'string',
    defaultValue: 'top_k;typ_p;top_p;min_p;temp',
    description: 'Custom order and chaining of samplers separated by semicolon (;).'
  },

  // --- MULTIMODAL & VISION ---
  {
    id: 'mmproj',
    flag: '--mmproj',
    name: 'Multimodal Projector (Vision/CLIP)',
    category: 'multimodal',
    type: 'file',
    description: 'Path to multimodal projector GGUF file (e.g. mmproj-model-f16.gguf for LLaVA, MiniCPM-V, Qwen-VL).',
    fileFilters: [{ name: 'Projector GGUF', extensions: ['gguf'] }],
    quickAction: true
  },
  {
    id: 'image',
    flag: '--image',
    name: 'Input Image File (CLI)',
    category: 'multimodal',
    type: 'file',
    description: 'Path to an image file to pass alongside prompts in CLI mode.',
    fileFilters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'webp', 'bmp'] }]
  },

  // --- SPECULATIVE DECODING ---
  {
    id: 'model_draft',
    flag: '--model-draft',
    short: '-md',
    name: 'Draft Model (GGUF)',
    category: 'speculative',
    type: 'file',
    description: 'Path to small fast draft model used to propose candidate tokens for speculative decoding.',
    fileFilters: [{ name: 'GGUF Models', extensions: ['gguf'] }],
    quickAction: true
  },
  {
    id: 'ctx_size_draft',
    flag: '--ctx-size-draft',
    short: '-cd',
    name: 'Draft Context Size',
    category: 'speculative',
    type: 'number',
    defaultValue: 2048,
    min: 512,
    max: 32768,
    unit: 'tokens',
    description: 'Context size for the speculative draft model.'
  },
  {
    id: 'draft_max',
    flag: '--draft-max',
    short: '-draft',
    name: 'Max Draft Tokens',
    category: 'speculative',
    type: 'number',
    defaultValue: 16,
    min: 1,
    max: 64,
    description: 'Maximum number of tokens to predict with the draft model per step.'
  },
  {
    id: 'draft_min',
    flag: '--draft-min',
    short: '-draft-min',
    name: 'Min Draft Tokens',
    category: 'speculative',
    type: 'number',
    defaultValue: 5,
    min: 1,
    max: 32,
    description: 'Minimum draft tokens to generate before verification.'
  },
  {
    id: 'draft_p_min',
    flag: '--draft-p-min',
    name: 'Draft Acceptance Threshold',
    category: 'speculative',
    type: 'number',
    defaultValue: 0.9,
    min: 0.0,
    max: 1.0,
    step: 0.05,
    description: 'Minimum probability threshold for speculative token acceptance.'
  },

  // --- EMBEDDINGS & RERANKING ---
  {
    id: 'embedding',
    flag: '--embedding',
    name: 'Enable Embeddings Mode',
    category: 'embeddings',
    type: 'boolean',
    defaultValue: false,
    description: 'Run model in text embeddings extraction mode (enables /v1/embeddings endpoint).',
    quickAction: true
  },
  {
    id: 'reranking',
    flag: '--reranking',
    name: 'Enable Reranking Mode',
    category: 'embeddings',
    type: 'boolean',
    defaultValue: false,
    description: 'Run model as a cross-encoder document reranker (enables /v1/rerank endpoint).',
    quickAction: true
  },
  {
    id: 'pooling',
    flag: '--pooling',
    name: 'Embedding Pooling Type',
    category: 'embeddings',
    type: 'enum',
    defaultValue: 'none',
    options: ['none', 'mean', 'cls', 'last', 'rank'],
    description: 'Token pooling strategy for embedding extraction.'
  },

  // --- TEMPLATES & GRAMMAR ---
  {
    id: 'chat_template',
    flag: '--chat-template',
    name: 'Chat Template (Jinja/Name)',
    category: 'templates',
    type: 'string',
    description: 'Jinja chat template string or preset name (e.g. chatml, llama3, mistral, gemma, phi3, deepseek2).'
  },
  {
    id: 'chat_template_file',
    flag: '--chat-template-file',
    name: 'Chat Template File',
    category: 'templates',
    type: 'file',
    description: 'Path to custom Jinja .j2 template file for chat conversation formatting.'
  },
  {
    id: 'grammar',
    flag: '--grammar',
    name: 'BNF Grammar String',
    category: 'templates',
    type: 'string',
    description: 'BNF-like grammar string to strictly constrain generation output structure.'
  },
  {
    id: 'grammar_file',
    flag: '--grammar-file',
    name: 'BNF Grammar File',
    category: 'templates',
    type: 'file',
    description: 'Path to BNF grammar file (.gbnf).'
  },
  {
    id: 'json_schema',
    flag: '--json-schema',
    name: 'JSON Schema Constraint',
    category: 'templates',
    type: 'string',
    description: 'JSON Schema definition to guarantee strict valid JSON response matching the schema.'
  },
  {
    id: 'system_prompt',
    flag: '--system-prompt',
    name: 'System Prompt Override',
    category: 'templates',
    type: 'string',
    description: 'Override the default system prompt / persona for chat completions.'
  },

  // --- PERFORMANCE & THREADS ---
  {
    id: 'threads',
    flag: '--threads',
    short: '-t',
    name: 'Generation Threads',
    category: 'performance',
    type: 'number',
    defaultValue: 8,
    min: 1,
    max: 128,
    description: 'Number of CPU threads to use for generation (recommend matching physical CPU cores).',
    quickAction: true
  },
  {
    id: 'threads_batch',
    flag: '--threads-batch',
    short: '-tb',
    name: 'Batch Processing Threads',
    category: 'performance',
    type: 'number',
    defaultValue: 8,
    min: 1,
    max: 128,
    description: 'Number of CPU threads to use for batch and prompt ingestion.'
  },
  {
    id: 'cpu_mask',
    flag: '--cpu-mask',
    short: '-C',
    name: 'CPU Affinity Mask',
    category: 'performance',
    type: 'string',
    description: 'Hex CPU affinity mask to bind threads to specific CPU cores.'
  },
  {
    id: 'cpu_range',
    flag: '--cpu-range',
    short: '-Cr',
    name: 'CPU Affinity Range',
    category: 'performance',
    type: 'string',
    description: 'CPU core range (e.g. 0-7, 8-15) for thread pinning.'
  },
  {
    id: 'cpu_strict',
    flag: '--cpu-strict',
    name: 'Strict CPU Placement',
    category: 'performance',
    type: 'boolean',
    defaultValue: false,
    description: 'Enforce strict CPU placement rules.'
  },
  {
    id: 'poll',
    flag: '--poll',
    name: 'Thread Polling Level',
    category: 'performance',
    type: 'number',
    defaultValue: 0,
    min: 0,
    max: 100,
    description: 'Thread polling level (0-100). Higher values reduce latency at the expense of higher idle CPU utilization.'
  },

  // --- LOGGING & DEBUGGING ---
  {
    id: 'verbose',
    flag: '--verbose',
    short: '-v',
    name: 'Verbose Logging',
    category: 'logging',
    type: 'boolean',
    defaultValue: false,
    description: 'Print detailed verbose logs, timings, and token statistics.'
  },
  {
    id: 'log_file',
    flag: '--log-file',
    name: 'Log Output File',
    category: 'logging',
    type: 'file',
    description: 'Redirect all server and generation logs to a specified file path.'
  },
  {
    id: 'log_json',
    flag: '--log-json',
    name: 'JSON Log Format',
    category: 'logging',
    type: 'boolean',
    defaultValue: false,
    description: 'Format output logs as structured JSON lines.'
  },
  {
    id: 'perf',
    flag: '--perf',
    name: 'Performance Profiling Counters',
    category: 'logging',
    type: 'boolean',
    defaultValue: false,
    description: 'Print low-level performance counters and compute timing breakdown.'
  },
  {
    id: 'check_tensors',
    flag: '--check-tensors',
    name: 'Check Tensor Integrity',
    category: 'logging',
    type: 'boolean',
    defaultValue: false,
    description: 'Verify tensor checksums and integrity during model loading.'
  },
  {
    id: 'warmup',
    flag: '--warmup',
    name: 'Warmup Iteration',
    category: 'logging',
    type: 'boolean',
    defaultValue: true,
    description: 'Execute a warmup inference step on startup to prime GPU caches and compute shaders.'
  },
  {
    id: 'override_kv',
    flag: '--override-kv',
    name: 'Override Model KV Attribute',
    category: 'logging',
    type: 'string',
    description: 'Override GGUF model metadata key-value (e.g. tokenizer.ggml.add_bos_token=bool:true).'
  }
];

export interface PresetProfile {
  id: string;
  name: string;
  description: string;
  values: Record<string, any>;
  enabledFlags: Record<string, boolean>;
}

export const DEFAULT_PRESETS: PresetProfile[] = [
  {
    id: 'max-gpu',
    name: 'Max GPU Speed (CUDA / Vulkan / Metal)',
    description: 'Offload all layers to GPU, enable Flash Attention 2, continuous batching, and 8k context.',
    values: {
      n_gpu_layers: 99,
      flash_attn: 'on',
      cont_batching: true,
      ctx_size: 8192,
      batch_size: 2048,
      ubatch_size: 512,
      host: '127.0.0.1',
      port: 8080,
      parallel: 1,
      temp: 0.7,
      min_p: 0.05
    },
    enabledFlags: {
      n_gpu_layers: true,
      flash_attn: true,
      cont_batching: true,
      ctx_size: true,
      batch_size: true,
      ubatch_size: true,
      host: true,
      port: true,
      parallel: true,
      temp: true,
      min_p: true
    }
  },
  {
    id: 'low-vram',
    name: 'Low VRAM / Shared Memory Mode',
    description: 'Quantize KV cache to Q4_0, partial GPU offload, disable unnecessary memory allocations.',
    values: {
      n_gpu_layers: 32,
      flash_attn: 'on',
      cache_type_k: 'q4_0',
      cache_type_v: 'q4_0',
      ctx_size: 4096,
      batch_size: 512,
      ubatch_size: 256,
      host: '127.0.0.1',
      port: 8080,
      parallel: 1
    },
    enabledFlags: {
      n_gpu_layers: true,
      flash_attn: true,
      cache_type_k: true,
      cache_type_v: true,
      ctx_size: true,
      batch_size: true,
      ubatch_size: true,
      host: true,
      port: true,
      parallel: true
    }
  },
  {
    id: 'openai-server',
    name: 'OpenAI API Compatible Server (LAN)',
    description: 'Exposes port 8080 on 0.0.0.0 for LAN clients, multi-slot concurrency, Prometheus metrics, and alias.',
    values: {
      host: '0.0.0.0',
      port: 8080,
      parallel: 4,
      alias: 'gpt-4o',
      metrics: true,
      slots_endpoint: true,
      props_endpoint: true,
      cont_batching: true,
      n_gpu_layers: 99,
      flash_attn: 'on',
      ctx_size: 16384
    },
    enabledFlags: {
      host: true,
      port: true,
      parallel: true,
      alias: true,
      metrics: true,
      slots_endpoint: true,
      props_endpoint: true,
      cont_batching: true,
      n_gpu_layers: true,
      flash_attn: true,
      ctx_size: true
    }
  },
  {
    id: 'embeddings-server',
    name: 'Vector Embeddings & Reranking Node',
    description: 'Optimized server for document embedding generation and RAG retrieval pipelines.',
    values: {
      embedding: true,
      pooling: 'mean',
      n_gpu_layers: 99,
      ctx_size: 2048,
      batch_size: 2048,
      host: '127.0.0.1',
      port: 8080
    },
    enabledFlags: {
      embedding: true,
      pooling: true,
      n_gpu_layers: true,
      ctx_size: true,
      batch_size: true,
      host: true,
      port: true
    }
  }
];
