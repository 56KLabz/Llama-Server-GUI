import { FlagDefinition } from './data/llamaFlags';

export interface AppState {
  binaryPath: string;
  binaryType: 'llama-server' | 'llama-cli' | 'custom';
  flags: FlagDefinition[];
  flagValues: Record<string, any>;
  enabledFlags: Record<string, boolean>;
  activeCategory: string;
  searchQuery: string;
  isRunning: boolean;
  serverPid: number | null;
  serverPort: number;
  serverHost: string;
  logs: LogEntry[];
  systemInfo: SystemInfo | null;
}

export interface DiscoveredBinary {
  name: string;
  path: string;
  type: 'server' | 'cli';
  fromPath?: boolean;
}

export interface DiscoveredModel {
  name: string;
  path: string;
  sizeGB: number;
  folder: string;
}

export interface DiscoveredAssets {
  binaries: DiscoveredBinary[];
  models: DiscoveredModel[];
  projectors: DiscoveredModel[];
  loras: DiscoveredModel[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'stdout' | 'stderr' | 'system';
  text: string;
}

export interface GpuInfo {
  name: string;
  vramGB: number | null;
  usedVramGB?: number | null;
  freeVramGB?: number | null;
  gpuUtilPercent?: number | null;
}

export interface SystemInfo {
  totalMemGB: number;
  freeMemGB: number;
  usedMemGB: number;
  cpuModel: string;
  cpuCores: number;
  gpus: GpuInfo[];
}

declare global {
  interface Window {
    llamaAPI?: {
      openFile: (options?: { filters?: { name: string; extensions: string[] }[] }) => Promise<string | null>;
      openDirectory: () => Promise<string | null>;
      saveFile: (options?: { defaultPath?: string; content?: string; filters?: { name: string; extensions: string[] }[] }) => Promise<string | null>;
      openExternal: (url: string) => Promise<boolean>;
      extractHelp: (binaryPath: string) => Promise<{ success: boolean; output?: string; error?: string }>;
      scanAssets: (customDirs?: string[]) => Promise<DiscoveredAssets>;
      startProcess: (params: { binaryPath: string; args: string[]; cwd?: string }) => Promise<{ success: boolean; pid?: number; error?: string }>;
      stopProcess: () => Promise<{ success: boolean; error?: string; message?: string }>;
      isRunning: () => Promise<boolean>;
      getSystemInfo: () => Promise<SystemInfo>;
      onLog: (callback: (data: { type: 'stdout' | 'stderr'; text: string }) => void) => () => void;
      onStatus: (callback: (data: { state: 'stopped' | 'error'; exitCode?: number; error?: string }) => void) => () => void;
    };
  }
}
