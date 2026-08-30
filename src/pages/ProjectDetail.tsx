import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import AgentCard from '@/components/features/AgentCard';
import { useProjects } from '@/hooks/useProjects';
import { simulateAgentRun } from '@/lib/agentSimulator';
import { VIDEO_FORMATS } from '@/constants';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, updateProject, updateAgent } = useProjects();
  const [currentAgentIndex, setCurrentAgentIndex] = useState<number>(-1);
  const hasStarted = useRef(false);

  const project = projects.find(p => p.id === id);

  useEffect(() => {
    if (!project || hasStarted.current) return;
    if (project.status !== 'processing') return;
    hasStarted.current = true;

    console.log('Starting agent pipeline for project:', project.id);
    runAgentPipeline(0);
  }, [project?.id]);

  const runAgentPipeline = (agentIndex: number) => {
    if (!project) return;
    if (agentIndex >= 4) {
      // All agents done
      updateProject(project.id, { status: 'completed', completedAt: new Date().toISOString() });
      toast.success('Video generation completed!');
      return;
    }

    setCurrentAgentIndex(agentIndex);

    // Set agent to running
    const agentDef = project.agents[agentIndex];
    if (!agentDef) return;

    simulateAgentRun(
      agentIndex,
      (agentId, status, progress, task) => {
        updateAgent(project.id, agentId, { status, progress, currentTask: task });
      },
      () => {
        // This agent is done, start next
        setTimeout(() => runAgentPipeline(agentIndex + 1), 500);
      }
    );
  };

  if (!project) {
    return (
      <AppLayout>
        <div className="p-6 text-center text-muted-foreground">Project not found.</div>
      </AppLayout>
    );
  }

  const format = VIDEO_FORMATS.find(f => f.value === project.format);
  const isComplete = project.status === 'completed';
  const completedAgents = project.agents.filter(a => a.status === 'completed').length;
  const totalProgress = project.agents.length > 0
    ? (project.agents.reduce((sum, a) => sum + a.progress, 0) / project.agents.length)
    : 0;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground truncate">{project.title}</h1>
              <span className="text-xs bg-surface-3 border border-border text-muted-foreground px-2 py-0.5 rounded-full flex-shrink-0">
                {format?.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{project.prompt}</p>
          </div>
          {isComplete && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-border text-muted-foreground">
                <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share
              </Button>
              <Button size="sm" className="bg-violet-600 hover:bg-violet-700 text-white">
                <Download className="w-3.5 h-3.5 mr-1.5" /> Download
              </Button>
            </div>
          )}
        </div>

        {/* Overall Progress */}
        <div className="glass rounded-xl p-5 border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-foreground">
              {isComplete ? (
                <span className="flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="w-4 h-4" /> Generation Complete
                </span>
              ) : (
                `Agent Pipeline — ${completedAgents}/4 Agents`
              )}
            </div>
            <span className="text-sm font-bold text-violet-400">{Math.round(totalProgress)}%</span>
          </div>
          <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isComplete
                  ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                  : 'bg-gradient-to-r from-violet-600 to-amber-500'
              }`}
              style={{ width: `${Math.round(totalProgress)}%` }}
            />
          </div>
        </div>

        {/* Agents Grid */}
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">AI Agents</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {project.agents.map((agent, i) => (
              <AgentCard key={agent.id} agent={agent} index={i} />
            ))}
          </div>
        </div>

        {/* Output Preview */}
        {isComplete && (
          <div className="glass rounded-xl p-6 border border-green-500/20">
            <div className="text-sm font-semibold text-green-400 mb-4">Output Preview</div>
            <div
              className={`mx-auto bg-surface-3 rounded-xl overflow-hidden border border-border flex items-center justify-center ${
                project.format === 'shorts' || project.format === 'reels'
                  ? 'w-48 h-80'
                  : 'w-full h-56'
              }`}
            >
              <div className="text-center p-6">
                <div className="text-5xl mb-4">🎬</div>
                <div className="text-sm font-semibold text-foreground">Video Ready</div>
                <div className="text-xs text-muted-foreground mt-1">{format?.label} · {format?.aspect}</div>
                <div className="text-[11px] text-muted-foreground mt-2">
                  Backend integration required to display actual HF-generated video
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Prompt */}
        <div className="glass rounded-xl p-5 border border-border">
          <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Original Prompt</div>
          <p className="text-sm text-foreground">{project.prompt}</p>
          <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground">
            <span>Created: {new Date(project.createdAt).toLocaleString()}</span>
            {project.completedAt && <span>Completed: {new Date(project.completedAt).toLocaleString()}</span>}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
