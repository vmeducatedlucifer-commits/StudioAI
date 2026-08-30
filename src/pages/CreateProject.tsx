import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { useProjects } from '@/hooks/useProjects';
import { createProject } from '@/lib/agentPipeline';
import { VIDEO_FORMATS, HF_MODELS } from '@/constants';
import { getActiveToken } from '@/lib/tokenRouter';
import type { VideoFormat } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Sparkles, ArrowRight, AlertTriangle, Info } from 'lucide-react';
import { toast } from 'sonner';

const EXAMPLE_PROMPTS = [
  'A cinematic story about a robot discovering emotions in a futuristic neon city, dramatic lighting',
  'Viral motivation reel — fire quotes, mountain climbers, sunrise over ocean, epic orchestral music',
  'Short documentary about deep ocean mysteries: glowing creatures, haunting ambient music, 4K underwater',
  'Fantasy movie: young wizard battles ancient stone dragon, magical forest, lightning effects, cinematic score',
];

export default function CreateProject() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { addProject } = useProjects();

  const [prompt, setPrompt] = useState('');
  const [format, setFormat] = useState<VideoFormat>(
    (params.get('format') as VideoFormat) || 'shorts'
  );

  const hasToken = !!getActiveToken();

  const handleCreate = () => {
    if (!prompt.trim()) {
      toast.error('Enter a video idea or prompt first');
      return;
    }
    if (prompt.trim().length < 10) {
      toast.error('Prompt is too short — add more detail for better results');
      return;
    }
    if (!hasToken) {
      toast.error('No active HF tokens! Add tokens in Admin → Token Manager', {
        action: { label: 'Add Tokens →', onClick: () => navigate('/admin/tokens') },
        duration: 6000,
      });
      return;
    }
    const project = createProject(prompt.trim(), format);
    addProject(project);
    toast.info('Pipeline started! Agents are running real HF API calls...', { duration: 4000 });
    navigate(`/projects/${project.id}`);
  };

  const fmt = VIDEO_FORMATS.find(f => f.value === format)!;

  return (
    <AppLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-7">
        {/* Header */}
        <div>
          <div className="text-xs font-semibold text-violet-400 mb-1 tracking-wider uppercase">New Project</div>
          <h1 className="text-3xl font-bold text-foreground">Create AI Video</h1>
          <p className="text-muted-foreground text-sm mt-1">
            4 real AI agents call Hugging Face APIs sequentially to produce your video
          </p>
        </div>

        {/* Token Warning */}
        {!hasToken && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-amber-400">No Active HF Tokens</div>
              <div className="text-xs text-amber-400/70 mt-0.5">
                Add your Hugging Face API tokens in the Admin panel.{' '}
                <button onClick={() => navigate('/admin/tokens')} className="underline">Add tokens →</button>
              </div>
            </div>
          </div>
        )}

        {/* HF Info */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
          <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-300/80 leading-relaxed">
            <strong className="text-blue-300">Real API calls:</strong> Script → Mistral-7B Instruct · Images → SDXL 1.0 (+ SD 1.5 fallback) ·
            Voice → FastSpeech2 TTS · Music → MusicGen Small. HF free tier may be slow (model loading ~20s).
            Add your <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="underline">HF token</a> for faster access.
          </div>
        </div>

        {/* Format Selection */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-3 block">Output Format</label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {VIDEO_FORMATS.map(f => (
              <button
                key={f.value}
                onClick={() => setFormat(f.value)}
                className={cn(
                  'rounded-xl p-4 border text-left transition-all duration-200',
                  format === f.value
                    ? 'border-violet-500/60 bg-violet-500/10 shadow-lg shadow-violet-500/10'
                    : 'border-border glass hover:border-violet-500/30'
                )}
              >
                <div className="text-xl mb-1">{f.icon}</div>
                <div className="text-xs font-semibold text-foreground">{f.label}</div>
                <div className="text-[10px] text-muted-foreground">{f.aspect}</div>
                <div className="text-[10px] text-muted-foreground">{f.duration}</div>
              </button>
            ))}
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            Selected: <span className="text-violet-400 font-medium">{fmt.label}</span> · {fmt.aspect} · {fmt.duration} ·{' '}
            {format === 'shorts' || format === 'reels' ? '3 scenes' : format === 'long_story' ? '6 scenes' : '8 scenes'}
          </div>
        </div>

        {/* Prompt */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">
            Video Idea / Prompt
            <span className="text-muted-foreground font-normal ml-2 text-xs">— describe story, style, mood, setting</span>
          </label>
          <Textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value.slice(0, 500))}
            placeholder="e.g. A lone astronaut discovers an alien signal on Mars. Cinematic, atmospheric, orchestral soundtrack, 4K quality..."
            className="h-36 bg-surface-2 border-border text-foreground placeholder:text-muted-foreground resize-none focus:border-violet-500/60"
          />
          <div className="flex justify-between mt-1.5">
            <span className="text-[11px] text-muted-foreground">More detail = better AI output</span>
            <span className={cn('text-[11px]', prompt.length > 450 ? 'text-amber-400' : 'text-muted-foreground')}>
              {prompt.length} / 500
            </span>
          </div>
        </div>

        {/* Examples */}
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-2">Try an example prompt:</div>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_PROMPTS.map(ex => (
              <button
                key={ex}
                onClick={() => setPrompt(ex)}
                className="text-[11px] glass rounded-lg px-3 py-1.5 border border-border hover:border-violet-500/30 text-muted-foreground hover:text-foreground transition-all text-left max-w-xs"
              >
                {ex.slice(0, 65)}...
              </button>
            ))}
          </div>
        </div>

        {/* Pipeline Preview */}
        <div className="glass rounded-xl p-5 border border-border">
          <div className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">
            Agent Pipeline — What will run
          </div>
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {[
              { label: 'Script Writer', model: 'Mistral-7B', color: 'violet', api: 'Text Gen' },
              { label: 'Scene Visualizer', model: 'SDXL 1.0', color: 'cyan', api: 'Image Gen' },
              { label: 'Audio Producer', model: 'FastSpeech2 + MusicGen', color: 'amber', api: 'TTS + Music' },
              { label: 'Video Compiler', model: 'Manifest Builder', color: 'green', api: 'Assembler' },
            ].map((agent, i) => (
              <div key={i} className="flex items-center gap-1 flex-shrink-0">
                <div className={cn(
                  'rounded-lg px-3 py-2 border text-center min-w-[110px]',
                  agent.color === 'violet' && 'bg-violet-500/10 border-violet-500/30',
                  agent.color === 'cyan' && 'bg-cyan-500/10 border-cyan-500/30',
                  agent.color === 'amber' && 'bg-amber-500/10 border-amber-500/30',
                  agent.color === 'green' && 'bg-green-500/10 border-green-500/30',
                )}>
                  <div className="text-xs font-semibold text-foreground">{agent.label}</div>
                  <div className="text-[9px] text-muted-foreground font-mono mt-0.5">{agent.model}</div>
                  <div className={cn('text-[9px] font-semibold mt-0.5',
                    agent.color === 'violet' ? 'text-violet-400' :
                    agent.color === 'cyan' ? 'text-cyan-400' :
                    agent.color === 'amber' ? 'text-amber-400' : 'text-green-400'
                  )}>{agent.api}</div>
                </div>
                {i < 3 && <ArrowRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-muted-foreground">
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!prompt.trim() || prompt.trim().length < 10}
            className="bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white border-0 px-8 h-11"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Launch AI Agents
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
