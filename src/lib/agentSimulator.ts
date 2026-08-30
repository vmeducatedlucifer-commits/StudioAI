import type { Agent, VideoProject, VideoFormat } from '@/types';
import { AGENT_DEFINITIONS } from '@/constants';
import { getActiveToken, markTokenUsed } from './tokenRouter';

export function createProject(prompt: string, format: VideoFormat): VideoProject {
  const agents: Agent[] = AGENT_DEFINITIONS.map(def => ({
    id: def.id,
    name: def.name,
    type: def.type,
    status: 'idle',
    progress: 0,
    hfModel: def.hfModel,
  }));

  return {
    id: crypto.randomUUID(),
    title: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''),
    prompt,
    format,
    status: 'processing',
    createdAt: new Date().toISOString(),
    agents,
    scenes: [],
    audioAssets: [],
  };
}

export function simulateAgentRun(
  agentIndex: number,
  onUpdate: (agentId: string, status: Agent['status'], progress: number, task: string) => void,
  onComplete: (agentId: string) => void
): void {
  const agentDef = AGENT_DEFINITIONS[agentIndex];
  if (!agentDef) return;

  const token = getActiveToken();
  if (token) markTokenUsed(token.id);

  let taskIndex = 0;
  let progress = 0;

  onUpdate(agentDef.id, 'running', 0, agentDef.tasks[0]);

  const interval = setInterval(() => {
    progress += Math.random() * 15 + 5;
    if (progress >= 100) progress = 100;

    const newTaskIdx = Math.min(Math.floor((progress / 100) * agentDef.tasks.length), agentDef.tasks.length - 1);
    if (newTaskIdx !== taskIndex) {
      taskIndex = newTaskIdx;
    }

    onUpdate(agentDef.id, 'running', progress, agentDef.tasks[taskIndex]);

    if (progress >= 100) {
      clearInterval(interval);
      onUpdate(agentDef.id, 'completed', 100, agentDef.tasks[agentDef.tasks.length - 1]);
      onComplete(agentDef.id);
    }
  }, 600);
}

export function getFormatThumb(format: VideoFormat): string {
  const map: Record<VideoFormat, string> = {
    shorts: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80',
    reels: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400&q=80',
    long_story: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&q=80',
    movie: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80',
  };
  return map[format];
}
