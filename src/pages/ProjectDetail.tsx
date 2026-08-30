import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import AgentCard from '@/components/features/AgentCard';
import { useProjects } from '@/hooks/useProjects';
import {
  runScriptAgent,
  runImageAgent,
  runAudioAgent,
  runCompilerAgent,
} from '@/lib/agentPipeline';
import { VIDEO_FORMATS } from '@/constants';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, CheckCircle2, Download, Share2,
  ChevronLeft, ChevronRight, Play, Volume2, VolumeX, Music, Mic, AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Scene, AudioAsset } from '@/types';
import { cn } from '@/lib/utils';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, updateProject, updateAgent } = useProjects();
  const hasStarted = useRef(false);
  const [activeScene, setActiveScene] = useState(0);
  const [mutedVoice, setMutedVoice] = useState(false);
  const [mutedMusic, setMutedMusic] = useState(false);
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  const project = projects.find(p => p.id === id);

  const setAgentState = useCallback(
    (agentId: string, status: any, progress: number, task: string, error?: string) => {
      updateAgent(project!.id, agentId, { status, progress, currentTask: task, error });
    },
    [project?.id, updateAgent]
  );

  useEffect(() => {
    if (!project || hasStarted.current) return;
    if (project.status !== 'processing') return;
    hasStarted.current = true;
    startPipeline();
  }, [project?.id]);

  async function startPipeline() {
    if (!project) return;
    const pid = project.id;

    try {
      // ── Agent 1: Script ──────────────────────────────────────────────────
      setAgentState('script', 'running', 5, 'Connecting to Mistral-7B...');
      updateAgent(pid, 'image', { status: 'waiting', currentTask: 'Waiting for script...' });
      updateAgent(pid, 'audio', { status: 'waiting', currentTask: 'Waiting...' });
      updateAgent(pid, 'compiler', { status: 'waiting', currentTask: 'Waiting...' });

      let script = '';
      let scenes: Scene[] = [];

      try {
        const result = await runScriptAgent(
          project,
          (progress, task) => setAgentState('script', 'running', progress, task)
        );
        script = result.script;
        scenes = result.scenes;
        setAgentState('script', 'completed', 100, `Script ready — ${scenes.length} scenes`);
        updateProject(pid, { script, scenes });
        toast.success(`Script generated — ${scenes.length} scenes`);
      } catch (err: any) {
        setAgentState('script', 'error', 0, 'Script failed', err.message);
        toast.error('Script agent failed: ' + err.message);
        updateProject(pid, { status: 'failed', error: err.message });
        return;
      }

      // ── Agent 2: Images ──────────────────────────────────────────────────
      setAgentState('image', 'running', 5, 'Connecting to SDXL...');

      let finalScenes = scenes;
      try {
        finalScenes = await runImageAgent(
          project,
          scenes,
          (progress, task) => setAgentState('image', 'running', progress, task)
        );
        setAgentState('image', 'completed', 100, `${finalScenes.length} images generated`);
        updateProject(pid, {
          scenes: finalScenes,
          thumbnail: finalScenes[0]?.imageUrl || undefined,
        });
        toast.success('Scene images generated!');
      } catch (err: any) {
        setAgentState('image', 'error', 0, 'Image agent failed', err.message);
        toast.error('Image agent failed: ' + err.message);
        // Continue with scenes without images
      }

      // ── Agent 3: Audio ───────────────────────────────────────────────────
      setAgentState('audio', 'running', 5, 'Connecting to MusicGen + TTS...');

      let audioAssets: AudioAsset[] = [];
      try {
        audioAssets = await runAudioAgent(
          project,
          finalScenes,
          (progress, task) => setAgentState('audio', 'running', progress, task)
        );
        setAgentState('audio', 'completed', 100, `${audioAssets.length} audio assets ready`);
        updateProject(pid, { audioAssets });
        toast.success('Audio production complete!');
      } catch (err: any) {
        setAgentState('audio', 'error', 0, 'Audio agent failed', err.message);
        toast.error('Audio agent failed: ' + err.message);
        // Continue without audio
      }

      // ── Agent 4: Compiler ────────────────────────────────────────────────
      setAgentState('compiler', 'running', 5, 'Assembling final output...');

      try {
        const manifest = await runCompilerAgent(
          project,
          finalScenes,
          audioAssets,
          (progress, task) => setAgentState('compiler', 'running', progress, task)
        );
        setAgentState('compiler', 'completed', 100, 'Output ready!');
        updateProject(pid, {
          status: 'completed',
          completedAt: new Date().toISOString(),
          outputManifest: manifest,
        });
        toast.success('🎬 Video project complete! Review your scenes below.', { duration: 5000 });
      } catch (err: any) {
        setAgentState('compiler', 'error', 0, 'Compiler failed', err.message);
        updateProject(pid, { status: 'failed', error: err.message });
      }
    } catch (err: any) {
      console.error('Pipeline error:', err);
      updateProject(pid, { status: 'failed', error: err.message });
      toast.error('Pipeline failed: ' + err.message);
    }
  }

  if (!project) {
    return (
      <AppLayout>
        <div className="p-6 text-center text-muted-foreground">Project not found.</div>
      </AppLayout>
    );
  }

  const format = VIDEO_FORMATS.find(f => f.value === project.format);
  const isComplete = project.status === 'completed';
  const isFailed = project.status === 'failed';
  const totalProgress = project.agents.length > 0
    ? Math.round(project.agents.reduce((sum, a) => sum + a.progress, 0) / project.agents.length)
    : 0;
  const completedAgents = project.agents.filter(a => a.status === 'completed').length;

  const scenes = project.scenes || [];
  const audioAssets = project.audioAssets || [];
  const voiceovers = audioAssets.filter(a => a.type === 'voiceover' && a.url);
  const music = audioAssets.find(a => a.type === 'music' && a.url);

  const isVertical = project.format === 'shorts' || project.format === 'reels';

  const exportData = () => {
    const data = JSON.stringify({ project, scenes, audioAssets }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.replace(/\s+/g, '_')}_data.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Project data exported!');
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-muted-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-foreground truncate">{project.title}</h1>
              <span className="text-xs bg-surface-3 border border-border text-muted-foreground px-2 py-0.5 rounded-full flex-shrink-0">
                {format?.label} · {format?.aspect}
              </span>
              {isFailed && (
                <span className="text-xs bg-red-500/10 border border-red-500/30 text-red-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Failed
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{project.prompt}</p>
          </div>
          {isComplete && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-border text-muted-foreground" onClick={exportData}>
                <Download className="w-3.5 h-3.5 mr-1.5" /> Export
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
                  <CheckCircle2 className="w-4 h-4" /> Generation Complete — {scenes.length} scenes, {audioAssets.length} audio assets
                </span>
              ) : isFailed ? (
                <span className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-4 h-4" /> Pipeline Failed
                </span>
              ) : (
                `Agent Pipeline — ${completedAgents}/4 running`
              )}
            </div>
            <span className={cn('text-sm font-bold', isComplete ? 'text-green-400' : 'text-violet-400')}>{totalProgress}%</span>
          </div>
          <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                isComplete ? 'bg-gradient-to-r from-green-500 to-emerald-400' :
                isFailed ? 'bg-red-500' :
                'bg-gradient-to-r from-violet-600 to-amber-500'
              )}
              style={{ width: `${totalProgress}%` }}
            />
          </div>
          {isFailed && project.error && (
            <p className="text-xs text-red-400 mt-2">{project.error}</p>
          )}
        </div>

        {/* Agents Grid */}
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">AI Agents Status</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {project.agents.map((agent, i) => (
              <AgentCard key={agent.id} agent={agent} index={i} />
            ))}
          </div>
        </div>

        {/* Scene Viewer — shows real generated images */}
        {scenes.length > 0 && (
          <div className="glass rounded-xl border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <div className="text-sm font-semibold text-foreground">
                Scene Viewer — {scenes.length} scenes
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveScene(Math.max(0, activeScene - 1))}
                  disabled={activeScene === 0}
                  className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {activeScene + 1} / {scenes.length}
                </span>
                <button
                  onClick={() => setActiveScene(Math.min(scenes.length - 1, activeScene + 1))}
                  disabled={activeScene === scenes.length - 1}
                  className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className={cn('flex gap-6 p-5', isVertical ? 'flex-col md:flex-row' : 'flex-col')}>
              {/* Main scene image */}
              <div className={cn(
                'relative flex-shrink-0 rounded-xl overflow-hidden bg-surface-3 flex items-center justify-center',
                isVertical ? 'w-full md:w-48 h-80' : 'w-full h-64'
              )}>
                {scenes[activeScene]?.imageUrl ? (
                  <img
                    src={scenes[activeScene].imageUrl}
                    alt={`Scene ${activeScene + 1}`}
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="text-center p-4">
                    <div className="text-3xl mb-2">🎬</div>
                    <div className="text-xs text-muted-foreground">
                      {project.status === 'processing' ? 'Generating...' : 'No image'}
                    </div>
                  </div>
                )}
                {/* Caption overlay */}
                {scenes[activeScene]?.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm px-3 py-2">
                    <p className="text-white text-xs font-semibold text-center leading-tight">
                      {scenes[activeScene].caption}
                    </p>
                  </div>
                )}
                {/* Scene number badge */}
                <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Scene {scenes[activeScene]?.index}
                </div>
              </div>

              {/* Scene details */}
              <div className="flex-1 space-y-3 min-w-0">
                <div>
                  <div className="text-xs font-semibold text-violet-400 uppercase tracking-wider mb-1">
                    {scenes[activeScene]?.title || `Scene ${activeScene + 1}`}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">{scenes[activeScene]?.description}</p>
                </div>

                {scenes[activeScene]?.narration && (
                  <div className="glass rounded-lg p-3 border border-border">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Mic className="w-3 h-3 text-amber-400" />
                      <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Narration</span>
                    </div>
                    <p className="text-sm text-muted-foreground italic leading-relaxed">"{scenes[activeScene].narration}"</p>
                  </div>
                )}

                {/* Voiceover player for this scene */}
                {(() => {
                  const vo = voiceovers.find(v => v.sceneIndex === scenes[activeScene]?.index);
                  return vo?.url ? (
                    <div className="glass rounded-lg p-3 border border-border">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Volume2 className="w-3 h-3 text-cyan-400" />
                        <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">Voiceover Audio</span>
                      </div>
                      <audio
                        ref={el => { audioRefs.current[`vo_${scenes[activeScene]?.index}`] = el; }}
                        src={vo.url}
                        controls
                        className="w-full h-8"
                        muted={mutedVoice}
                      />
                    </div>
                  ) : null;
                })()}
              </div>
            </div>

            {/* Scene thumbnails strip */}
            <div className="px-5 pb-4">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {scenes.map((scene, i) => (
                  <button
                    key={scene.id}
                    onClick={() => setActiveScene(i)}
                    className={cn(
                      'flex-shrink-0 w-16 h-10 rounded-lg overflow-hidden border-2 transition-all',
                      i === activeScene ? 'border-violet-500' : 'border-border hover:border-violet-500/40'
                    )}
                  >
                    {scene.imageUrl ? (
                      <img src={scene.imageUrl} alt={`S${i + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-surface-3 flex items-center justify-center">
                        <span className="text-[9px] text-muted-foreground">{i + 1}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Background Music Player */}
        {music?.url && (
          <div className="glass rounded-xl p-4 border border-border flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <Music className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-amber-400 mb-1">Background Music (MusicGen)</div>
              <audio
                ref={el => { audioRefs.current['music'] = el; }}
                src={music.url}
                controls
                loop
                className="w-full h-8"
                muted={mutedMusic}
              />
            </div>
            <button
              onClick={() => setMutedMusic(!mutedMusic)}
              className="text-muted-foreground hover:text-foreground p-1.5"
            >
              {mutedMusic ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Full Script View */}
        {project.script && (
          <div className="glass rounded-xl border border-border">
            <button
              className="w-full px-5 py-4 text-left flex items-center justify-between"
              onClick={e => {
                const el = e.currentTarget.nextElementSibling as HTMLElement;
                el.style.display = el.style.display === 'none' ? 'block' : 'none';
              }}
            >
              <div className="text-sm font-semibold text-foreground">Full Generated Script</div>
              <span className="text-xs text-muted-foreground">Click to expand</span>
            </button>
            <div style={{ display: 'none' }} className="px-5 pb-5">
              <pre className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap font-mono bg-surface-2 rounded-lg p-4 max-h-96 overflow-y-auto">
                {project.script}
              </pre>
            </div>
          </div>
        )}

        {/* Prompt Info */}
        <div className="glass rounded-xl p-5 border border-border">
          <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Original Prompt</div>
          <p className="text-sm text-foreground">{project.prompt}</p>
          <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground flex-wrap">
            <span>Created: {new Date(project.createdAt).toLocaleString()}</span>
            {project.completedAt && (
              <span>Completed: {new Date(project.completedAt).toLocaleString()}</span>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
