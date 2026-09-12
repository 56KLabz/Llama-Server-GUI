import React, { useState, useEffect, useMemo } from 'react';
import { 
  LLAMA_FLAGS, 
  FlagDefinition, 
  FlagCategory, 
  DEFAULT_PRESETS, 
  PresetProfile 
} from './data/llamaFlags';
import { MenuBar } from './components/MenuBar';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { FlagCard } from './components/FlagCard';
import { CommandLineBar, buildLlamaArgs } from './components/CommandLineBar';
import { ProcessTerminal } from './components/ProcessTerminal';
import { ApiPlayground } from './components/ApiPlayground';
import { HelpExtractorModal } from './components/HelpExtractorModal';
import { CustomFlagModal } from './components/CustomFlagModal';
import { AssetScannerModal } from './components/AssetScannerModal';
import { AboutModal } from './components/AboutModal';
import { ThemeModal } from './components/ThemeModal';
import { ThemeId, applyTheme } from './data/themes';
import { LogEntry, SystemInfo, DiscoveredAssets, DiscoveredModel, DiscoveredBinary } from './types';

export function App() {
  // App state
  const [binaryPath, setBinaryPath] = useState<string>(() => {
    return localStorage.getItem('llama_binary_path') || '';
  });

  const [flags, setFlags] = useState<FlagDefinition[]>(() => {
    // Merge latest updated flags definitions with any custom saved ones
    return LLAMA_FLAGS;
  });

  const [flagValues, setFlagValues] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem('llama_flag_values');
    let vals = saved ? JSON.parse(saved) : DEFAULT_PRESETS[0].values;
    // Auto-migrate boolean flash_attn to 'on'
    if (vals.flash_attn === true || vals.flash_attn === undefined) {
      vals.flash_attn = 'on';
    }
    return vals;
  });

  const [enabledFlags, setEnabledFlags] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('llama_enabled_flags');
    return saved ? JSON.parse(saved) : DEFAULT_PRESETS[0].enabledFlags;
  });

  const [activeCategory, setActiveCategory] = useState<FlagCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'flags' | 'terminal' | 'playground'>('flags');
  const [showCommandBar, setShowCommandBar] = useState<boolean>(() => {
    const saved = localStorage.getItem('llama_show_command_bar');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Asset Discovery state
  const [assets, setAssets] = useState<DiscoveredAssets | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [customFolders, setCustomFolders] = useState<string[]>(() => {
    const saved = localStorage.getItem('llama_custom_scan_folders');
    return saved ? JSON.parse(saved) : [];
  });

  // Process & System state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);

  // Modals
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [isAssetModalOpen, setIsAssetModalOpen] = useState<boolean>(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);

  // Active theme state
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => {
    return (localStorage.getItem('llama_theme') as ThemeId) || 'noir';
  });

  // Apply theme on load and change
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  // Persist settings
  useEffect(() => {
    localStorage.setItem('llama_binary_path', binaryPath);
  }, [binaryPath]);

  useEffect(() => {
    localStorage.setItem('llama_flags_matrix', JSON.stringify(flags));
  }, [flags]);

  useEffect(() => {
    localStorage.setItem('llama_flag_values', JSON.stringify(flagValues));
  }, [flagValues]);

  useEffect(() => {
    localStorage.setItem('llama_enabled_flags', JSON.stringify(enabledFlags));
  }, [enabledFlags]);

  useEffect(() => {
    localStorage.setItem('llama_show_command_bar', JSON.stringify(showCommandBar));
  }, [showCommandBar]);

  useEffect(() => {
    localStorage.setItem('llama_custom_scan_folders', JSON.stringify(customFolders));
  }, [customFolders]);

  // Initial scan and IPC setup
  const runAutoScan = async (foldersToScan?: string[]) => {
    if (window.llamaAPI?.scanAssets) {
      setIsScanning(true);
      try {
        const found = await window.llamaAPI.scanAssets(foldersToScan || customFolders);
        setAssets(found);

        // Auto-select first discovered binary if none selected
        if (!binaryPath && found.binaries.length > 0) {
          setBinaryPath(found.binaries[0].path);
        }

        // Auto-select first model if none selected
        if (!flagValues['model'] && found.models.length > 0) {
          setFlagValues(prev => ({ ...prev, model: found.models[0].path }));
          setEnabledFlags(prev => ({ ...prev, model: true }));
        }
      } catch (err) {
        console.error('Scan failed:', err);
      } finally {
        setIsScanning(false);
      }
    }
  };

  // Stable callbacks for FlagCard to leverage React.memo optimization
  const handleToggleFlag = React.useCallback((flagId: string, enabled: boolean) => {
    setEnabledFlags(prev => ({ ...prev, [flagId]: enabled }));
  }, []);

  const handleChangeFlagValue = React.useCallback((flagId: string, val: any) => {
    setFlagValues(prev => ({ ...prev, [flagId]: val }));
  }, []);

  useEffect(() => {
    if (window.llamaAPI) {
      window.llamaAPI.getSystemInfo().then((info) => {
        setSystemInfo(info);
        if (info && info.gpus && info.gpus.length > 0 && info.gpus.some(g => g.name && !g.name.toLowerCase().includes('remote') && !g.name.toLowerCase().includes('virtual'))) {
          setFlagValues(prev => ({
            ...prev,
            n_gpu_layers: (prev.n_gpu_layers !== undefined && prev.n_gpu_layers !== 0) ? prev.n_gpu_layers : 99,
            flash_attn: prev.flash_attn || 'on'
          }));
          setEnabledFlags(prev => ({
            ...prev,
            n_gpu_layers: true,
            flash_attn: true
          }));
        }
      }).catch(() => {});

      window.llamaAPI.isRunning().then(setIsRunning).catch(() => {});
      runAutoScan();

      const unbindLog = window.llamaAPI.onLog((data) => {
        const entry: LogEntry = {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toLocaleTimeString(),
          type: data.type,
          text: data.text
        };
        setLogs(prev => [...prev.slice(-2000), entry]);
      });

      const unbindStatus = window.llamaAPI.onStatus((data) => {
        if (data.state === 'stopped') {
          setIsRunning(false);
          setLogs(prev => [
            ...prev,
            {
              id: Math.random().toString(36).substring(2, 9),
              timestamp: new Date().toLocaleTimeString(),
              type: 'system',
              text: `[SYSTEM] Process stopped (Exit code: ${data.exitCode})`
            }
          ]);
        } else if (data.state === 'error') {
          setIsRunning(false);
          setLogs(prev => [
            ...prev,
            {
              id: Math.random().toString(36).substring(2, 9),
              timestamp: new Date().toLocaleTimeString(),
              type: 'stderr',
              text: `[ERROR] Process failed: ${data.error}`
            }
          ]);
        }
      });

      // Setup live system metrics polling every 2.5 seconds
      const metricsInterval = setInterval(() => {
        window.llamaAPI?.getSystemInfo().then(setSystemInfo).catch(() => {});
      }, 2500);

      return () => {
        clearInterval(metricsInterval);
        unbindLog();
        unbindStatus();
      };
    }
  }, []);

  // Keyboard shortcuts (Ctrl+O, Ctrl+B, F1, F2, F3)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleBrowseModel();
      } else if (e.ctrlKey && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        handleSelectBinary();
      } else if (e.ctrlKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setIsThemeModalOpen(true);
      } else if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        setShowCommandBar(prev => !prev);
      } else if (e.key === 'F1') {
        e.preventDefault();
        setActiveTab('flags');
      } else if (e.key === 'F2') {
        e.preventDefault();
        setActiveTab('terminal');
      } else if (e.key === 'F3') {
        e.preventDefault();
        setActiveTab('playground');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter flags
  const filteredFlags = useMemo(() => {
    return flags.filter((f) => {
      if (activeCategory !== 'all' && f.category !== activeCategory) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = f.name.toLowerCase().includes(query);
        const matchesFlag = f.flag.toLowerCase().includes(query);
        const matchesShort = f.short?.toLowerCase().includes(query);
        const matchesDesc = f.description.toLowerCase().includes(query);
        return matchesName || matchesFlag || matchesShort || matchesDesc;
      }
      return true;
    });
  }, [flags, activeCategory, searchQuery]);

  // Handle Binary Selection
  const handleSelectBinary = async () => {
    if (window.llamaAPI) {
      const selected = await window.llamaAPI.openFile({
        filters: [
          { name: 'Executables', extensions: ['exe', 'bat', 'cmd', '*'] }
        ]
      });
      if (selected) {
        setBinaryPath(selected);
      }
    } else {
      const path = prompt('Enter executable path (e.g. C:\\llama\\llama-server.exe):', binaryPath);
      if (path !== null) setBinaryPath(path);
    }
  };

  // Handle Primary Model Browse
  const handleBrowseModel = async () => {
    if (window.llamaAPI) {
      const selected = await window.llamaAPI.openFile({
        filters: [
          { name: 'GGUF Models', extensions: ['gguf', 'bin'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      if (selected) {
        setFlagValues(prev => ({ ...prev, model: selected }));
        setEnabledFlags(prev => ({ ...prev, model: true }));
      }
    }
  };

  // Handle Discovered Selection
  const handleSelectDiscoveredBinary = (bin: DiscoveredBinary) => {
    setBinaryPath(bin.path);
  };

  const handleSelectDiscoveredModel = (model: DiscoveredModel, targetFlagId: 'model' | 'model_draft' | 'mmproj' | 'lora' = 'model') => {
    setFlagValues(prev => ({ ...prev, [targetFlagId]: model.path }));
    setEnabledFlags(prev => ({ ...prev, [targetFlagId]: true }));
  };

  const handleBrowseCustomFolder = async () => {
    if (window.llamaAPI) {
      const folder = await window.llamaAPI.openDirectory();
      if (folder && !customFolders.includes(folder)) {
        const nextFolders = [...customFolders, folder];
        setCustomFolders(nextFolders);
        runAutoScan(nextFolders);
      }
    }
  };

  // Handle File Browsing for flags
  const handleBrowseFile = async (flagId: string, filters?: { name: string; extensions: string[] }[]) => {
    if (window.llamaAPI) {
      const selected = await window.llamaAPI.openFile({ filters });
      if (selected) {
        setFlagValues(prev => ({ ...prev, [flagId]: selected }));
        setEnabledFlags(prev => ({ ...prev, [flagId]: true }));
      }
    } else {
      const path = prompt(`Enter path for flag:`);
      if (path) {
        setFlagValues(prev => ({ ...prev, [flagId]: path }));
        setEnabledFlags(prev => ({ ...prev, [flagId]: true }));
      }
    }
  };

  // Handle Directory Browsing for flags
  const handleBrowseDirectory = async (flagId: string) => {
    if (window.llamaAPI) {
      const selected = await window.llamaAPI.openDirectory();
      if (selected) {
        setFlagValues(prev => ({ ...prev, [flagId]: selected }));
        setEnabledFlags(prev => ({ ...prev, [flagId]: true }));
      }
    } else {
      const path = prompt(`Enter directory path:`);
      if (path) {
        setFlagValues(prev => ({ ...prev, [flagId]: path }));
        setEnabledFlags(prev => ({ ...prev, [flagId]: true }));
      }
    }
  };

  // Apply Optimization Preset
  const handleApplyPreset = (preset: PresetProfile) => {
    setFlagValues(prev => ({ ...prev, ...preset.values }));
    setEnabledFlags(prev => ({ ...prev, ...preset.enabledFlags }));
  };

  // Start Server / Process
  const handleStartProcess = async () => {
    if (!binaryPath) {
      alert('Please select a llama-server.exe or llama-cli.exe executable binary first.');
      return;
    }

    const hasModel = enabledFlags['model'] && flagValues['model'];
    const hasRouter = enabledFlags['models_dir'] && flagValues['models_dir'];
    const hasHf = enabledFlags['hf_repo'] && flagValues['hf_repo'];

    if (!hasModel && !hasRouter && !hasHf) {
      if (!confirm('No model file, HuggingFace repo, or models directory is enabled. Launch anyway?')) {
        return;
      }
    }

    const args = buildLlamaArgs(flags, flagValues, enabledFlags, binaryPath);

    if (window.llamaAPI) {
      const res = await window.llamaAPI.startProcess({
        binaryPath,
        args
      });
      if (res.success) {
        setIsRunning(true);
        setActiveTab('terminal');
        setLogs(prev => [
          ...prev,
          {
            id: Math.random().toString(36).substring(2, 9),
            timestamp: new Date().toLocaleTimeString(),
            type: 'system',
            text: `[SYSTEM] Launched ${binaryPath} (PID: ${res.pid})`
          }
        ]);
      } else {
        alert(`Failed to start: ${res.error}`);
      }
    } else {
      alert(`[Demo Mode] Would launch: ${binaryPath} ${args.join(' ')}`);
      setIsRunning(true);
      setActiveTab('terminal');
    }
  };

  // Stop Process
  const handleStopProcess = async () => {
    if (window.llamaAPI) {
      await window.llamaAPI.stopProcess();
    }
    setIsRunning(false);
  };

  // Export Script
  const handleExportScript = async (format: 'bat' | 'ps1' | 'sh' | 'json') => {
    const argsList = buildLlamaArgs(flags, flagValues, enabledFlags, binaryPath);
    const exe = binaryPath || 'llama-server.exe';

    let content = '';
    let defaultPath = 'run_llama.' + format;

    if (format === 'bat') {
      content = `@echo off\r\necho Starting llama.cpp...\r\n"${exe}" ${argsList.map(a => a.includes(' ') ? `"${a}"` : a).join(' ')}\r\npause\r\n`;
    } else if (format === 'ps1') {
      content = `# llama.cpp PowerShell Launcher\r\nWrite-Host "Starting llama.cpp..." -ForegroundColor Cyan\r\n& "${exe}" ${argsList.map(a => a.includes(' ') ? `"${a}"` : a).join(' ')}\r\n`;
    } else if (format === 'sh') {
      content = `#!/bin/bash\n# llama.cpp Bash Launcher\necho "Starting llama.cpp..."\n"${exe}" ${argsList.map(a => a.includes(' ') ? `"${a}"` : a).join(' ')}\n`;
    } else if (format === 'json') {
      content = JSON.stringify({
        binaryPath,
        flagValues,
        enabledFlags,
        timestamp: new Date().toISOString()
      }, null, 2);
    }

    if (window.llamaAPI) {
      await window.llamaAPI.saveFile({
        defaultPath,
        content,
        filters: [{ name: format.toUpperCase(), extensions: [format] }]
      });
    } else {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = defaultPath;
      link.click();
    }
  };

  const handleResetAll = () => {
    if (confirm('Reset all enabled flags to default?')) {
      setEnabledFlags({});
    }
  };

  const handleImportFlags = (newFlags: FlagDefinition[]) => {
    setFlags(prev => {
      const map = new Map<string, FlagDefinition>();
      prev.forEach(f => map.set(f.flag, f));
      newFlags.forEach(f => map.set(f.flag, f));
      return Array.from(map.values());
    });
  };

  const handleAddCustomFlag = (newFlag: FlagDefinition) => {
    setFlags(prev => [newFlag, ...prev]);
    setEnabledFlags(prev => ({ ...prev, [newFlag.id]: true }));
    if (newFlag.defaultValue !== undefined) {
      setFlagValues(prev => ({ ...prev, [newFlag.id]: newFlag.defaultValue }));
    }
  };

  const currentHost = flagValues['host'] || '127.0.0.1';
  const currentPort = parseInt(flagValues['port']) || 8080;
  const currentApiKey = flagValues['api_key'] || '';
  const currentModelPath = flagValues['model'] || '';

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#050608] text-slate-100 font-sans">
      {/* Standard Desktop MenuBar */}
      <MenuBar
        onOpenModel={handleBrowseModel}
        onSelectBinary={handleSelectBinary}
        onOpenAssetVault={() => setIsAssetModalOpen(true)}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
        onOpenCustomFlagModal={() => setIsCustomModalOpen(true)}
        onOpenAboutModal={() => setIsAboutModalOpen(true)}
        onOpenSettingsModal={() => {}}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onApplyPreset={handleApplyPreset}
        onResetAll={handleResetAll}
        onExportScript={handleExportScript}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        showCommandBar={showCommandBar}
        onToggleCommandBar={() => setShowCommandBar(prev => !prev)}
        isRunning={isRunning}
        onStart={handleStartProcess}
        onStop={handleStopProcess}
      />

      {/* Main Header / Quick Action Bar */}
      <Header
        binaryPath={binaryPath}
        onSelectBinary={handleSelectBinary}
        isRunning={isRunning}
        onStart={handleStartProcess}
        onStop={handleStopProcess}
        onOpenAssetModal={() => setIsAssetModalOpen(true)}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        assets={assets}
        onSelectDiscoveredBinary={handleSelectDiscoveredBinary}
        onSelectDiscoveredModel={(m) => handleSelectDiscoveredModel(m, 'model')}
        activeModelPath={currentModelPath}
        systemInfo={systemInfo}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'flags' && (
          <>
            <CategoryNav
              activeCategory={activeCategory}
              onSelectCategory={setActiveCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              flags={flags}
              enabledFlags={enabledFlags}
              onResetAll={handleResetAll}
              onEnableAllQuick={() => {}}
            />

            <main className="flex-1 overflow-y-auto p-4 bg-[#050608]">
              <div className="max-w-7xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-100 capitalize">
                      {activeCategory === 'all' ? 'All llama.cpp Help Options' : `${activeCategory} Parameters`}
                    </h2>
                    <p className="text-xs text-slate-400">
                      Showing {filteredFlags.length} configurable command-line parameters
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredFlags.map((flag) => (
                    <FlagCard
                      key={flag.id}
                      flag={flag}
                      value={flagValues[flag.id]}
                      isEnabled={!!enabledFlags[flag.id]}
                      onToggle={handleToggleFlag}
                      onChangeValue={handleChangeFlagValue}
                      onBrowseFile={handleBrowseFile}
                      onBrowseDirectory={handleBrowseDirectory}
                    />
                  ))}
                </div>

                {filteredFlags.length === 0 && (
                  <div className="py-20 text-center text-slate-500 space-y-2">
                    <p className="text-sm">No options matching "{searchQuery}"</p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-xs text-amber-400 hover:underline cursor-pointer"
                    >
                      Clear search filter
                    </button>
                  </div>
                )}
              </div>
            </main>
          </>
        )}

        {activeTab === 'terminal' && (
          <ProcessTerminal
            logs={logs}
            isRunning={isRunning}
            onClearLogs={() => setLogs([])}
            onStart={handleStartProcess}
            onStop={handleStopProcess}
          />
        )}

        {activeTab === 'playground' && (
          <ApiPlayground
            serverHost={currentHost}
            serverPort={currentPort}
            apiKey={currentApiKey}
            isRunning={isRunning}
          />
        )}
      </div>

      {/* Redesigned Collapsible Multiline Command Line Drawer */}
      <CommandLineBar
        binaryPath={binaryPath}
        flags={flags}
        flagValues={flagValues}
        enabledFlags={enabledFlags}
        onExportScript={handleExportScript}
        isVisible={showCommandBar}
        onToggleVisible={() => setShowCommandBar(prev => !prev)}
      />

      {/* Modals */}
      <HelpExtractorModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        binaryPath={binaryPath}
        onImportFlags={handleImportFlags}
      />

      <CustomFlagModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onAddFlag={handleAddCustomFlag}
      />

      <AssetScannerModal
        isOpen={isAssetModalOpen}
        onClose={() => setIsAssetModalOpen(false)}
        assets={assets}
        isScanning={isScanning}
        onScan={runAutoScan}
        onSelectBinary={handleSelectDiscoveredBinary}
        onSelectModel={handleSelectDiscoveredModel}
        onBrowseCustomFolder={handleBrowseCustomFolder}
        customFolders={customFolders}
      />

      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentTheme={currentTheme}
        onSelectTheme={(t) => setCurrentTheme(t)}
      />
    </div>
  );
}
