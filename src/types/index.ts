export type VideoFormat = 'shorts' | 'reels' | 'long_story' | 'movie';

export type AgentStatus = 'idle' | 'running' | 'completed' | 'error' | 'waiting';

export interface HFToken {
  id: string;
  token: string;
  label: string;
  isActive: boolean;
  usageCount: number;
  quotaExhausted: boolean;
  addedAt: string;
  lastUsed?: string;
  failCount: number;
}

export interface Agent {
  id: string;
  name: string;
  type: 'script' | 'image' | 'audio' | 'compiler';
  status: AgentStatus;
  progress: number;
  currentTask?: string;
  output?: string;
  hfModel?: string;
}

export interface VideoProject {
  id: string;
  title: string;
  prompt: string;
  format: VideoFormat;
  status: 'draft' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  agents: Agent[];
  script?: string;
  scenes?: Scene[];
  audioAssets?: AudioAsset[];
  thumbnail?: string;
  outputUrl?: string;
}

export interface Scene {
  id: string;
  index: number;
  description: string;
  imageUrl?: string;
  duration: number;
  caption?: string;
}

export interface AudioAsset {
  id: string;
  type: 'voiceover' | 'music' | 'sfx';
  url?: string;
  description: string;
  duration?: number;
}

export interface TokenStats {
  total: number;
  active: number;
  exhausted: number;
  currentIndex: number;
}
