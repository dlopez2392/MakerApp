export type ModuleId =
  | 'home'
  | 'woodworking'
  | 'leather'
  | 'resin'
  | 'soap'
  | 'cnc'
  | 'knife'
  | 'candle'
  | 'laser'
  | 'printing';

export interface ModuleTheme {
  id: ModuleId;
  label: string;
  accent: string;
  accentMuted: string;
  cardBorderColor: string;
  backgroundAsset: number | null;
  darkOverlayOpacity: number;
  lightOverlayOpacity: number;
}

export const MODULE_THEMES: Record<ModuleId, ModuleTheme> = {
  home: {
    id: 'home',
    label: 'Home',
    accent: '#f59e0b',
    accentMuted: '#f59e0b26',
    cardBorderColor: '#f59e0b40',
    backgroundAsset: require("../../../assets/textures/placeholder-home.png"),
    darkOverlayOpacity: 0.1,
    lightOverlayOpacity: 0.06,
  },
  woodworking: {
    id: 'woodworking',
    label: 'Woodworking',
    accent: '#a0714f',
    accentMuted: '#a0714f26',
    cardBorderColor: '#a0714f40',
    backgroundAsset: require("../../../assets/textures/placeholder-woodworking.png"),
    darkOverlayOpacity: 0.1,
    lightOverlayOpacity: 0.06,
  },
  leather: {
    id: 'leather',
    label: 'Leather',
    accent: '#c2956b',
    accentMuted: '#c2956b26',
    cardBorderColor: '#c2956b40',
    backgroundAsset: require("../../../assets/textures/placeholder-leather.png"),
    darkOverlayOpacity: 0.1,
    lightOverlayOpacity: 0.06,
  },
  resin: {
    id: 'resin',
    label: 'Resin',
    accent: '#3b82f6',
    accentMuted: '#3b82f626',
    cardBorderColor: '#3b82f640',
    backgroundAsset: require("../../../assets/textures/placeholder-resin.png"),
    darkOverlayOpacity: 0.1,
    lightOverlayOpacity: 0.06,
  },
  soap: {
    id: 'soap',
    label: 'Soap',
    accent: '#a78bfa',
    accentMuted: '#a78bfa26',
    cardBorderColor: '#a78bfa40',
    backgroundAsset: null,
    darkOverlayOpacity: 0.1,
    lightOverlayOpacity: 0.06,
  },
  cnc: {
    id: 'cnc',
    label: 'CNC',
    accent: '#6b7280',
    accentMuted: '#6b728026',
    cardBorderColor: '#6b728040',
    backgroundAsset: null,
    darkOverlayOpacity: 0.1,
    lightOverlayOpacity: 0.06,
  },
  knife: {
    id: 'knife',
    label: 'Knife',
    accent: '#dc5a34',
    accentMuted: '#dc5a3426',
    cardBorderColor: '#dc5a3440',
    backgroundAsset: null,
    darkOverlayOpacity: 0.1,
    lightOverlayOpacity: 0.06,
  },
  candle: {
    id: 'candle',
    label: 'Candle',
    accent: '#e8a030',
    accentMuted: '#e8a03026',
    cardBorderColor: '#e8a03040',
    backgroundAsset: null,
    darkOverlayOpacity: 0.1,
    lightOverlayOpacity: 0.06,
  },
  laser: {
    id: 'laser',
    label: 'Laser',
    accent: '#06b6d4',
    accentMuted: '#06b6d426',
    cardBorderColor: '#06b6d440',
    backgroundAsset: null,
    darkOverlayOpacity: 0.1,
    lightOverlayOpacity: 0.06,
  },
  printing: {
    id: 'printing',
    label: '3D Print',
    accent: '#374151',
    accentMuted: '#37415126',
    cardBorderColor: '#37415140',
    backgroundAsset: null,
    darkOverlayOpacity: 0.1,
    lightOverlayOpacity: 0.06,
  },
};

export function getModuleTheme(id: ModuleId): ModuleTheme {
  return MODULE_THEMES[id] ?? MODULE_THEMES.home;
}
