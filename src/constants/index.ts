import type { VideoFormat } from '@/types';

export const VIDEO_FORMATS: { value: VideoFormat; label: string; aspect: string; duration: string; icon: string }[] = [
  { value: 'shorts', label: 'YouTube Shorts', aspect: '9:16', duration: '15–60s', icon: '▶' },
  { value: 'reels', label: 'Instagram Reels', aspect: '9:16', duration: '30–90s', icon: '◉' },
  { value: 'long_story', label: 'Long Story Video', aspect: '16:9', duration: '5–15min', icon: '◈' },
  { value: 'movie', label: 'Movie Maker', aspect: '16:9', duration: '15min+', icon: '◆' },
];

export const HF_MODELS = {
  image: [
    { id: 'stabilityai/stable-diffusion-xl-base-1.0', label: 'SDXL Base 1.0 (Primary)' },
    { id: 'runwayml/stable-diffusion-v1-5', label: 'SD v1.5 (Fallback)' },
    { id: 'black-forest-labs/FLUX.1-dev', label: 'FLUX.1 Dev (Pro)' },
  ],
  video: [
    { id: 'ali-vilab/i2vgen-xl', label: 'I2VGen-XL (Scene Animation)' },
    { id: 'stabilityai/stable-video-diffusion-img2vid', label: 'SVD Img2Vid' },
  ],
  audio: [
    { id: 'facebook/musicgen-small', label: 'MusicGen Small (Primary)' },
    { id: 'facebook/musicgen-medium', label: 'MusicGen Medium (Fallback)' },
    { id: 'facebook/fastspeech2-en-ljspeech', label: 'FastSpeech2 TTS (Primary)' },
    { id: 'espnet/kan-bayashi_ljspeech_vits', label: 'VITS TTS (Fallback)' },
  ],
  text: [
    { id: 'mistralai/Mistral-7B-Instruct-v0.2', label: 'Mistral 7B Instruct (Primary)' },
    { id: 'HuggingFaceH4/zephyr-7b-beta', label: 'Zephyr 7B Beta (Fallback)' },
  ],
};

export const AGENT_DEFINITIONS = [
  {
    id: 'script',
    name: 'Script Writer',
    type: 'script' as const,
    hfModel: 'mistralai/Mistral-7B-Instruct-v0.2',
    tasks: ['Analyzing prompt', 'Generating story structure', 'Writing scene scripts', 'Parsing scenes'],
  },
  {
    id: 'image',
    name: 'Scene Visualizer',
    type: 'image' as const,
    hfModel: 'stabilityai/stable-diffusion-xl-base-1.0',
    tasks: ['Loading SDXL model', 'Generating visual prompts', 'Rendering scene images', 'Applying style consistency'],
  },
  {
    id: 'audio',
    name: 'Audio Producer',
    type: 'audio' as const,
    hfModel: 'facebook/fastspeech2-en-ljspeech',
    tasks: ['Preparing narration scripts', 'Synthesizing voiceover', 'Composing background music', 'Mixing audio layers'],
  },
  {
    id: 'compiler',
    name: 'Video Compiler',
    type: 'compiler' as const,
    hfModel: 'ali-vilab/i2vgen-xl',
    tasks: ['Aligning scenes with audio', 'Applying transitions', 'Rendering captions', 'Finalizing output manifest'],
  },
];

export const SAMPLE_PROJECTS = [
  {
    id: 'sample-1',
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
    id: 'sample-2',
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
];
