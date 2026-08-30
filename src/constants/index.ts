import type { VideoFormat } from '@/types';

export const VIDEO_FORMATS: { value: VideoFormat; label: string; aspect: string; duration: string; icon: string }[] = [
  { value: 'shorts', label: 'YouTube Shorts', aspect: '9:16', duration: '15–60s', icon: '▶' },
  { value: 'reels', label: 'Instagram Reels', aspect: '9:16', duration: '30–90s', icon: '◉' },
  { value: 'long_story', label: 'Long Story Video', aspect: '16:9', duration: '5–15min', icon: '◈' },
  { value: 'movie', label: 'Movie Maker', aspect: '16:9', duration: '15min+', icon: '◆' },
];

export const HF_MODELS = {
  image: [
    { id: 'stabilityai/stable-diffusion-xl-base-1.0', label: 'SDXL Base 1.0' },
    { id: 'black-forest-labs/FLUX.1-dev', label: 'FLUX.1 Dev' },
    { id: 'ByteDance/SDXL-Lightning', label: 'SDXL Lightning' },
  ],
  video: [
    { id: 'ali-vilab/i2vgen-xl', label: 'I2VGen-XL' },
    { id: 'stabilityai/stable-video-diffusion-img2vid', label: 'SVD Img2Vid' },
  ],
  audio: [
    { id: 'facebook/musicgen-medium', label: 'MusicGen Medium' },
    { id: 'suno-ai/bark', label: 'Bark TTS' },
    { id: 'cvssp/audioldm2', label: 'AudioLDM 2 (SFX)' },
  ],
  caption: [
    { id: 'Salesforce/blip2-opt-2.7b', label: 'BLIP-2' },
  ],
};

export const AGENT_DEFINITIONS = [
  {
    id: 'script',
    name: 'Script Writer',
    type: 'script' as const,
    hfModel: 'mistralai/Mistral-7B-Instruct-v0.2',
    tasks: ['Analyzing prompt', 'Generating story structure', 'Writing scene scripts', 'Refining dialogue'],
  },
  {
    id: 'image',
    name: 'Scene Visualizer',
    type: 'image' as const,
    hfModel: 'black-forest-labs/FLUX.1-dev',
    tasks: ['Parsing scene descriptions', 'Generating visual prompts', 'Rendering images via HF Spaces', 'Applying style consistency'],
  },
  {
    id: 'audio',
    name: 'Audio Producer',
    type: 'audio' as const,
    hfModel: 'suno-ai/bark + facebook/musicgen-medium',
    tasks: ['Generating voiceover scripts', 'Synthesizing voice (Bark)', 'Creating background music', 'Adding SFX layers'],
  },
  {
    id: 'compiler',
    name: 'Video Compiler',
    type: 'compiler' as const,
    hfModel: 'ali-vilab/i2vgen-xl',
    tasks: ['Aligning scenes with audio', 'Applying transitions', 'Rendering captions', 'Exporting final video'],
  },
];

export const SAMPLE_PROJECTS = [
  {
    id: '1',
    title: 'AI Future Documentary',
    prompt: 'A cinematic story about AI changing human civilization in 2050',
    format: 'movie' as VideoFormat,
    status: 'completed' as const,
    createdAt: '2026-08-28T10:00:00Z',
    completedAt: '2026-08-28T10:45:00Z',
    thumbnail: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&q=80',
    agents: [],
    scenes: [],
    audioAssets: [],
  },
  {
    id: '2',
    title: 'Viral Motivation Reel',
    prompt: 'Motivational short reel with fire visuals and epic music',
    format: 'reels' as VideoFormat,
    status: 'completed' as const,
    createdAt: '2026-08-29T08:00:00Z',
    completedAt: '2026-08-29T08:08:00Z',
    thumbnail: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80',
    agents: [],
    scenes: [],
    audioAssets: [],
  },
  {
    id: '3',
    title: 'Space Exploration Short',
    prompt: 'YouTube short about Mars colonization with stunning visuals',
    format: 'shorts' as VideoFormat,
    status: 'processing' as const,
    createdAt: '2026-08-30T09:00:00Z',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&q=80',
    agents: [],
    scenes: [],
    audioAssets: [],
  },
];
