import { FlagDefinition, FlagCategory, FlagType } from '../data/llamaFlags';

/**
 * Intelligent parser for llama-server and llama-cli --help output
 */
export function parseHelpOutput(helpText: string): FlagDefinition[] {
  const lines = helpText.split(/\r?\n/);
  const flags: FlagDefinition[] = [];
  const seenFlags = new Set<string>();

  let currentCategory: FlagCategory = 'custom';
  let currentFlag: Partial<FlagDefinition> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    if (!trimmed) {
      if (currentFlag && currentFlag.flag) {
        if (!seenFlags.has(currentFlag.flag)) {
          seenFlags.add(currentFlag.flag);
          flags.push(finalizeFlag(currentFlag, currentCategory));
        }
        currentFlag = null;
      }
      continue;
    }

    // Detect section headers
    const lower = trimmed.toLowerCase();
    if (lower.includes('general options') || lower.includes('common:')) {
      currentCategory = 'model';
    } else if (lower.includes('sampling') || lower.includes('sampler')) {
      currentCategory = 'sampling';
    } else if (lower.includes('server') || lower.includes('network') || lower.includes('http:')) {
      currentCategory = 'server';
    } else if (lower.includes('speculative') || lower.includes('draft:')) {
      currentCategory = 'speculative';
    } else if (lower.includes('multimodal') || lower.includes('vision') || lower.includes('clip:')) {
      currentCategory = 'multimodal';
    } else if (lower.includes('embedding') || lower.includes('rerank')) {
      currentCategory = 'embeddings';
    } else if (lower.includes('performance') || lower.includes('thread') || lower.includes('cpu:')) {
      currentCategory = 'performance';
    } else if (lower.includes('logging') || lower.includes('debug')) {
      currentCategory = 'logging';
    } else if (lower.includes('context') || lower.includes('batch') || lower.includes('kv cache')) {
      currentCategory = 'context';
    }

    // Match flag pattern: e.g. "-m, --model <FNAME>" or "-fa, --flash-attn [on|off|auto]"
    const flagMatch = trimmed.match(/^(?:(-[a-zA-Z0-9_-]+),\s+)?(--[a-zA-Z0-9_-]+)(?:\s+([<\[A-Za-z0-9_|.-]+))?(?:\s{2,}|\s*:\s*|\s*-\s*)(.*)$/);

    if (flagMatch) {
      if (currentFlag && currentFlag.flag && !seenFlags.has(currentFlag.flag)) {
        seenFlags.add(currentFlag.flag);
        flags.push(finalizeFlag(currentFlag, currentCategory));
      }

      const short = flagMatch[1];
      const long = flagMatch[2];
      const argType = flagMatch[3] || '';
      const description = flagMatch[4] || '';

      const id = long.replace(/^--/, '').replace(/-/g, '_');
      const { type, options } = inferTypeAndOptions(argType, long, description);

      currentFlag = {
        id,
        flag: long,
        short: short || undefined,
        name: formatFlagName(long),
        category: currentCategory,
        type,
        options,
        description: description.trim(),
        detailedHelp: description.trim()
      };
    } else if (currentFlag && trimmed.length > 0) {
      if (currentFlag.description) {
        currentFlag.description += ' ' + trimmed;
        currentFlag.detailedHelp += '\n' + trimmed;
      }
    }
  }

  if (currentFlag && currentFlag.flag && !seenFlags.has(currentFlag.flag)) {
    flags.push(finalizeFlag(currentFlag, currentCategory));
  }

  return flags;
}

function inferTypeAndOptions(argType: string, flag: string, desc: string): { type: FlagType; options?: string[] } {
  const f = flag.toLowerCase();
  const d = desc.toLowerCase();
  const a = argType.toLowerCase();

  // Check enum with bracketed options like [on|off|auto] or <val1|val2>
  if (a.includes('|')) {
    const cleanOpts = a.replace(/[<\[\]>]/g, '').split('|').map(s => s.trim()).filter(Boolean);
    if (cleanOpts.length > 0) {
      return { type: 'enum', options: cleanOpts };
    }
  }

  if (f.includes('file') || f.includes('model') || f.includes('lora') || f.includes('mmproj') || a.includes('fname') || a.includes('path') || a.includes('file')) {
    if (f.includes('path') && !f.includes('file') && (f.includes('dir') || d.includes('directory'))) {
      return { type: 'directory' };
    }
    return { type: 'file' };
  }

  if (a.includes('n') || a.includes('int') || a.includes('float') || a.includes('val') || a.includes('num') || a.includes('size') || a.includes('port') || a.includes('threads') || a.includes('temp') || a.includes('layers')) {
    return { type: 'number' };
  }

  if (!argType || argType.trim().length === 0) {
    if (d.includes('enable') || d.includes('disable') || d.includes('toggle') || d.includes('flag') || f.startsWith('--no-') || f.startsWith('--enable-')) {
      return { type: 'boolean' };
    }
  }

  return { type: 'string' };
}

function formatFlagName(flag: string): string {
  const clean = flag.replace(/^--/, '');
  return clean
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function finalizeFlag(partial: Partial<FlagDefinition>, category: FlagCategory): FlagDefinition {
  return {
    id: partial.id || 'custom_' + Math.random().toString(36).substring(2, 7),
    flag: partial.flag || '--custom',
    short: partial.short,
    name: partial.name || 'Custom Flag',
    category: partial.category || category || 'custom',
    type: partial.type || 'string',
    options: partial.options,
    description: partial.description || 'Custom flag argument',
    detailedHelp: partial.detailedHelp,
    defaultValue: partial.type === 'boolean' ? false : (partial.type === 'number' ? 0 : (partial.options && partial.options.length > 0 ? partial.options[0] : ''))
  };
}
