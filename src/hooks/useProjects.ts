import { useState, useEffect } from 'react';
import type { VideoProject, Agent } from '@/types';
import { SAMPLE_PROJECTS } from '@/constants';

const STORAGE_KEY = 'video_projects';

export function useProjects() {
  const [projects, setProjects] = useState<VideoProject[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_PROJECTS));
      return SAMPLE_PROJECTS;
    } catch {
      return SAMPLE_PROJECTS;
    }
  });

  const saveProjects = (updated: VideoProject[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setProjects(updated);
  };

  const addProject = (project: VideoProject) => {
    const updated = [project, ...projects];
    saveProjects(updated);
  };

  const updateProject = (id: string, updates: Partial<VideoProject>) => {
    const updated = projects.map(p => p.id === id ? { ...p, ...updates } : p);
    saveProjects(updated);
  };

  const updateAgent = (projectId: string, agentId: string, updates: Partial<Agent>) => {
    const updated = projects.map(p => {
      if (p.id !== projectId) return p;
      return {
        ...p,
        agents: p.agents.map(a => a.id === agentId ? { ...a, ...updates } : a),
      };
    });
    saveProjects(updated);
  };

  const deleteProject = (id: string) => {
    saveProjects(projects.filter(p => p.id !== id));
  };

  return { projects, addProject, updateProject, updateAgent, deleteProject };
}
