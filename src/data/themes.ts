export type ThemeId = 
  | 'noir'
  | 'tokyo-night'
  | 'catppuccin'
  | 'dracula'
  | 'gruvbox'
  | 'nord'
  | 'cyberpunk';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  previewColor: string; // Accent color for preview icon
  previewBg: string;    // Background color for preview icon
  vars: Record<string, string>;
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'noir',
    name: 'Noir Obsidian (Default)',
    description: 'Pitch black OLED with amber gold phosphor accents',
    previewColor: '#f59e0b',
    previewBg: '#050608',
    vars: {
      '--bg-root': '#050608',
      '--bg-main': '#06070a',
      '--bg-panel': '#080a0f',
      '--bg-card': '#0b0e15',
      '--bg-card-active': '#0f131c',
      '--bg-input': '#050609',
      '--bg-input-subtle': '#0d1017',
      '--border-subtle': 'rgba(255, 255, 255, 0.07)',
      '--border-medium': 'rgba(255, 255, 255, 0.12)',
      '--accent': '#f59e0b',
      '--accent-hover': '#fbbf24',
      '--accent-bg': 'rgba(245, 158, 11, 0.15)',
      '--accent-border': 'rgba(245, 158, 11, 0.4)',
      '--accent-text': '#fef3c7',
      '--accent-contrast': '#000000',
      '--secondary-accent': '#06b6d4',
      '--text-primary': '#f1f5f9',
      '--text-secondary': '#94a3b8',
      '--text-muted': '#64748b',
      '--scrollbar-thumb': '#232734',
    }
  },
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    description: 'Iconic moody neon storm with lavender, cyan & blue',
    previewColor: '#7aa2f7',
    previewBg: '#1a1b26',
    vars: {
      '--bg-root': '#16161e',
      '--bg-main': '#1a1b26',
      '--bg-panel': '#1f2335',
      '--bg-card': '#24283b',
      '--bg-card-active': '#292e42',
      '--bg-input': '#13141c',
      '--bg-input-subtle': '#1e202e',
      '--border-subtle': 'rgba(122, 162, 247, 0.12)',
      '--border-medium': 'rgba(122, 162, 247, 0.25)',
      '--accent': '#7aa2f7',
      '--accent-hover': '#89b4fa',
      '--accent-bg': 'rgba(122, 162, 247, 0.18)',
      '--accent-border': 'rgba(122, 162, 247, 0.45)',
      '--accent-text': '#c0caf5',
      '--accent-contrast': '#15161e',
      '--secondary-accent': '#bb9af7',
      '--text-primary': '#c0caf5',
      '--text-secondary': '#a9b1d6',
      '--text-muted': '#565f89',
      '--scrollbar-thumb': '#3b4261',
    }
  },
  {
    id: 'catppuccin',
    name: 'Catppuccin Mocha',
    description: 'Soothing dark pastel palette loved by the dev community',
    previewColor: '#cba6f7',
    previewBg: '#1e1e2e',
    vars: {
      '--bg-root': '#11111b',
      '--bg-main': '#181825',
      '--bg-panel': '#1e1e2e',
      '--bg-card': '#24273a',
      '--bg-card-active': '#313244',
      '--bg-input': '#11111b',
      '--bg-input-subtle': '#181825',
      '--border-subtle': 'rgba(203, 166, 247, 0.12)',
      '--border-medium': 'rgba(203, 166, 247, 0.25)',
      '--accent': '#cba6f7',
      '--accent-hover': '#b4befe',
      '--accent-bg': 'rgba(203, 166, 247, 0.18)',
      '--accent-border': 'rgba(203, 166, 247, 0.45)',
      '--accent-text': '#f5e0dc',
      '--accent-contrast': '#11111b',
      '--secondary-accent': '#89dceb',
      '--text-primary': '#cdd6f4',
      '--text-secondary': '#bac2de',
      '--text-muted': '#6c7086',
      '--scrollbar-thumb': '#45475a',
    }
  },
  {
    id: 'dracula',
    name: 'Dracula Dark',
    description: 'Vibrant gothic purple, pink and electric green',
    previewColor: '#ff79c6',
    previewBg: '#282a36',
    vars: {
      '--bg-root': '#1e1f29',
      '--bg-main': '#21222c',
      '--bg-panel': '#282a36',
      '--bg-card': '#2d303e',
      '--bg-card-active': '#383a59',
      '--bg-input': '#191a21',
      '--bg-input-subtle': '#242632',
      '--border-subtle': 'rgba(255, 121, 198, 0.12)',
      '--border-medium': 'rgba(189, 147, 249, 0.25)',
      '--accent': '#bd93f9',
      '--accent-hover': '#ff79c6',
      '--accent-bg': 'rgba(189, 147, 249, 0.2)',
      '--accent-border': 'rgba(255, 121, 198, 0.45)',
      '--accent-text': '#f8f8f2',
      '--accent-contrast': '#282a36',
      '--secondary-accent': '#50fa7b',
      '--text-primary': '#f8f8f2',
      '--text-secondary': '#bfbfbf',
      '--text-muted': '#6272a4',
      '--scrollbar-thumb': '#44475a',
    }
  },
  {
    id: 'gruvbox',
    name: 'Gruvbox Retro',
    description: 'Warm earthy retro terminal with cozy amber and sage tones',
    previewColor: '#fabd2f',
    previewBg: '#1d2021',
    vars: {
      '--bg-root': '#141617',
      '--bg-main': '#1d2021',
      '--bg-panel': '#282828',
      '--bg-card': '#32302f',
      '--bg-card-active': '#3c3836',
      '--bg-input': '#141617',
      '--bg-input-subtle': '#282828',
      '--border-subtle': 'rgba(250, 189, 47, 0.12)',
      '--border-medium': 'rgba(250, 189, 47, 0.25)',
      '--accent': '#fabd2f',
      '--accent-hover': '#fe8019',
      '--accent-bg': 'rgba(250, 189, 47, 0.18)',
      '--accent-border': 'rgba(250, 189, 47, 0.45)',
      '--accent-text': '#ebdbb2',
      '--accent-contrast': '#1d2021',
      '--secondary-accent': '#b8bb26',
      '--text-primary': '#ebdbb2',
      '--text-secondary': '#d5c4a1',
      '--text-muted': '#928374',
      '--scrollbar-thumb': '#504945',
    }
  },
  {
    id: 'nord',
    name: 'Nordic Frost',
    description: 'Clean Arctic icy blues, slate grays and frozen cyans',
    previewColor: '#88c0d0',
    previewBg: '#2e3440',
    vars: {
      '--bg-root': '#242933',
      '--bg-main': '#2e3440',
      '--bg-panel': '#3b4252',
      '--bg-card': '#434c5e',
      '--bg-card-active': '#4c566a',
      '--bg-input': '#1f232a',
      '--bg-input-subtle': '#2e3440',
      '--border-subtle': 'rgba(136, 192, 208, 0.12)',
      '--border-medium': 'rgba(136, 192, 208, 0.25)',
      '--accent': '#88c0d0',
      '--accent-hover': '#81a1c1',
      '--accent-bg': 'rgba(136, 192, 208, 0.18)',
      '--accent-border': 'rgba(136, 192, 208, 0.45)',
      '--accent-text': '#eceff4',
      '--accent-contrast': '#2e3440',
      '--secondary-accent': '#8fbcbb',
      '--text-primary': '#eceff4',
      '--text-secondary': '#e5e9f0',
      '--text-muted': '#7b88a1',
      '--scrollbar-thumb': '#4c566a',
    }
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    description: 'High-energy electric yellow and hot magenta matrix',
    previewColor: '#fcee0a',
    previewBg: '#05070e',
    vars: {
      '--bg-root': '#020307',
      '--bg-main': '#080a14',
      '--bg-panel': '#0e1122',
      '--bg-card': '#141830',
      '--bg-card-active': '#1b2042',
      '--bg-input': '#04050a',
      '--bg-input-subtle': '#0d1020',
      '--border-subtle': 'rgba(252, 238, 10, 0.15)',
      '--border-medium': 'rgba(255, 0, 85, 0.3)',
      '--accent': '#fcee0a',
      '--accent-hover': '#00f0ff',
      '--accent-bg': 'rgba(252, 238, 10, 0.15)',
      '--accent-border': 'rgba(252, 238, 10, 0.45)',
      '--accent-text': '#ffffff',
      '--accent-contrast': '#000000',
      '--secondary-accent': '#ff0055',
      '--text-primary': '#ffffff',
      '--text-secondary': '#a0a8d0',
      '--text-muted': '#5c6490',
      '--scrollbar-thumb': '#ff0055',
    }
  }
];

export function applyTheme(themeId: ThemeId) {
  const theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  const root = document.documentElement;
  
  root.setAttribute('data-theme', theme.id);
  Object.entries(theme.vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
  
  localStorage.setItem('llama_theme', themeId);
}
