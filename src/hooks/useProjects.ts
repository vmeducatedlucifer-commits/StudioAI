import { useState, useCallback } from 'react';
import type { VideoProject, Agent } from '@/types';
import { SAMPLE_PROJECTS } from '@/constants';

const STORAGE_KEY = 'video_projects';

function loadProjects(): VideoProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Reset any "processing" projects on reload (they won't auto-resume)
      return parsed.map((p: VideoProject) =>
        p.status === 'processing'
          ? { ...p, status: 'failed', error: 'Session interrupted — please recreate this project' }
          : p
      );
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_PROJECTS));
    return SAMPLE_PROJECTS;
  } catch {
    return SAMPLE_PROJECTS;
  }
}

export function useProjects() {
  const [projects, setProjects] = useState<VideoProject[]>(loadProjects);

  const saveProjects = useCallback((updated: VideoProject[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setProjects(updated);
  }, []);

  const addProject = useCallback((project: VideoProject) => {
    setProjects(prev => {
      const updated = [project, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<VideoProject>) => {
    setProjects(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updates } : p);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateAgent = useCallback((projectId: string, agentId: string, updates: Partial<Agent>) => {
    setProjects(prev => {
      const updated = prev.map(p => {
        if (p.id !== projectId) return p;
        return {
          ...p,
          agents: p.agents.map(a =>
            a.id === agentId ? { ...a, ...updates } : a
          ),
        };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => {
      const updated = prev.filter(p => p.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { projects, addProject, updateProject, updateAgent, deleteProject };
}
