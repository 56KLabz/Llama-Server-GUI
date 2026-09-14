import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { open, save } from '@tauri-apps/plugin-dialog';
import { open as openShell } from '@tauri-apps/plugin-shell';
import { DiscoveredAssets, SystemInfo } from '../types';

export const isTauriEnvironment = (): boolean => {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
};

export const apiBridge = {
  openFile: async (options?: { filters?: { name: string; extensions: string[] }[] }): Promise<string | null> => {
    if (isTauriEnvironment()) {
      const selected = await open({
        multiple: false,
        directory: false,
        filters: options?.filters?.map(f => ({
          name: f.name,
          extensions: f.extensions.map(e => e.replace(/^\*\.?/, ''))
        }))
      });
      if (typeof selected === 'string') return selected;
      return null;
    }
    return window.llamaAPI?.openFile(options) ?? null;
  },

  openDirectory: async (): Promise<string | null> => {
    if (isTauriEnvironment()) {
      const selected = await open({
        multiple: false,
        directory: true
      });
      if (typeof selected === 'string') return selected;
      return null;
    }
    return window.llamaAPI?.openDirectory() ?? null;
  },

  saveFile: async (options?: { defaultPath?: string; content?: string; filters?: { name: string; extensions: string[] }[] }): Promise<string | null> => {
    if (isTauriEnvironment()) {
      const selected = await save({
        defaultPath: options?.defaultPath,
        filters: options?.filters?.map(f => ({
          name: f.name,
          extensions: f.extensions.map(e => e.replace(/^\*\.?/, ''))
        }))
      });
      return selected;
    }
    return window.llamaAPI?.saveFile(options) ?? null;
  },

  openExternal: async (url: string): Promise<boolean> => {
    if (isTauriEnvironment()) {
      try {
        await openShell(url);
        return true;
      } catch {
        return false;
      }
    }
    return window.llamaAPI?.openExternal(url) ?? false;
  },

  extractHelp: async (binaryPath: string): Promise<{ success: boolean; output?: string; error?: string }> => {
    if (isTauriEnvironment()) {
      return await invoke('extract_help', { binaryPath });
    }
    return (await window.llamaAPI?.extractHelp(binaryPath)) ?? { success: false, error: 'No backend available' };
  },

  scanAssets: async (customDirs?: string[]): Promise<DiscoveredAssets> => {
    if (isTauriEnvironment()) {
      return await invoke('scan_assets', { customSearchDirs: customDirs || [] });
    }
    return (await window.llamaAPI?.scanAssets(customDirs)) ?? { binaries: [], models: [], projectors: [], loras: [] };
  },

  startProcess: async (params: { binaryPath: string; args: string[]; cwd?: string }): Promise<{ success: boolean; pid?: number; error?: string }> => {
    if (isTauriEnvironment()) {
      return await invoke('start_process', { params });
    }
    return (await window.llamaAPI?.startProcess(params)) ?? { success: false, error: 'No backend available' };
  },

  stopProcess: async (): Promise<{ success: boolean; error?: string; message?: string }> => {
    if (isTauriEnvironment()) {
      return await invoke('stop_process');
    }
    return (await window.llamaAPI?.stopProcess()) ?? { success: true };
  },

  isRunning: async (): Promise<boolean> => {
    if (isTauriEnvironment()) {
      return await invoke('is_running');
    }
    return (await window.llamaAPI?.isRunning()) ?? false;
  },

  getSystemInfo: async (): Promise<SystemInfo> => {
    if (isTauriEnvironment()) {
      return await invoke('get_system_info');
    }
    return (await window.llamaAPI?.getSystemInfo()) ?? {
      totalMemGB: 0,
      freeMemGB: 0,
      usedMemGB: 0,
      cpuModel: 'Unknown',
      cpuCores: 1,
      gpus: []
    };
  },

  onLog: (callback: (data: { type: 'stdout' | 'stderr'; text: string }) => void): (() => void) => {
    if (isTauriEnvironment()) {
      let unlistenPromise = listen<{ type: string; text: string }>('llama:log', (event) => {
        callback({
          type: (event.payload.type === 'stderr' ? 'stderr' : 'stdout'),
          text: event.payload.text
        });
      });
      return () => {
        unlistenPromise.then(unlisten => unlisten());
      };
    }
    return window.llamaAPI?.onLog(callback) ?? (() => {});
  },

  onStatus: (callback: (data: { state: 'stopped' | 'error'; exitCode?: number; error?: string }) => void): (() => void) => {
    if (isTauriEnvironment()) {
      let unlistenPromise = listen<{ state: string; exitCode?: number; error?: string }>('llama:status', (event) => {
        callback({
          state: (event.payload.state === 'error' ? 'error' : 'stopped'),
          exitCode: event.payload.exitCode,
          error: event.payload.error
        });
      });
      return () => {
        unlistenPromise.then(unlisten => unlisten());
      };
    }
    return window.llamaAPI?.onStatus(callback) ?? (() => {});
  }
};
