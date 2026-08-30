import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { useProjects } from '@/hooks/useProjects';
import { createProject } from '@/lib/agentSimulator';
import { VIDEO_FORMATS } from '@/constants';
import { getActiveToken } from '@/lib/tokenRouter';
import type { VideoFormat } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Sparkles, ArrowRight, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

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
      toast.error('Please enter a video idea or prompt');
      return;
    }
    if (!hasToken) {
      toast.error('No active HF tokens! Add tokens in Admin → Token Manager', {
        action: { label: 'Go to Admin', onClick: () => navigate('/admin/tokens') },
      });
      return;
    }
    const project = createProject(prompt, format);
    addProject(project);
    navigate(`/projects/${project.id}`);
  };

  const examples = [
    'A cinematic story about a robot discovering emotions in a futuristic city',
    'Viral motivation reel with fire quotes and epic mountain scenery',
    'Short documentary about deep ocean mysteries with haunting music',
    'Movie-style fantasy adventure: a young wizard battles ancient dragons',
  ];

  return (
    <AppLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <div className="text-xs font-semibold text-violet-400 mb-1 tracking-wider uppercase">New Project</div>
          <h1 className="text-3xl font-bold text-foreground">Create AI Video</h1>
          <p className="text-muted-foreground text-sm mt-1">4 AI agents will work in sequence to produce your video</p>
        </div>

        {/* Token Warning */}
        {!hasToken && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-amber-400">No Active HF Tokens</div>
              <div className="text-xs text-amber-400/70 mt-0.5">
                Add Hugging Face API tokens in Admin panel to use AI features.{' '}
                <button onClick={() => navigate('/admin/tokens')} className="underline">Add tokens →</button>
              </div>
            </div>
          </div>
        )}

        {/* Format Selection */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-3 block">Output Format</label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {VIDEO_FORMATS.map(fmt => (
              <button
                key={fmt.value}
                onClick={() => setFormat(fmt.value)}
                className={cn(
                  'rounded-xl p-4 border text-left transition-all duration-200',
                  format === fmt.value
                    ? 'border-violet-500/60 bg-violet-500/10 shadow-lg shadow-violet-500/10'
                    : 'border-border glass hover:border-violet-500/30'
                )}
              >
                <div className="text-xl mb-1">{fmt.icon}</div>
                <div className="text-xs font-semibold text-foreground">{fmt.label}</div>
                <div className="text-[10px] text-muted-foreground">{fmt.aspect}</div>
                <div className="text-[10px] text-muted-foreground">{fmt.duration}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Prompt */}
        <div>
          <label className="text-sm font-semibold text-foreground mb-3 block">
            Video Idea / Prompt
            <span className="text-muted-foreground font-normal ml-2">— describe your story, style, mood</span>
          </label>
          <Textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="e.g. A cinematic short about a lone astronaut discovering an alien signal on Mars..."
            className="h-36 bg-surface-2 border-border text-foreground placeholder:text-muted-foreground resize-none focus:border-violet-500/60"
          />
          <div className="flex justify-end mt-1.5">
            <span className="text-[11px] text-muted-foreground">{prompt.length} / 500</span>
          </div>
        </div>

        {/* Examples */}
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-2">Try an example:</div>
          <div className="flex flex-wrap gap-2">
            {examples.map(ex => (
              <button
                key={ex}
                onClick={() => setPrompt(ex)}
                className="text-[11px] glass rounded-lg px-3 py-1.5 border border-border hover:border-violet-500/30 text-muted-foreground hover:text-foreground transition-all max-w-xs text-left"
              >
                {ex.slice(0, 60)}...
              </button>
            ))}
          </div>
        </div>

        {/* Agent Pipeline Preview */}
        <div className="glass rounded-xl p-5 border border-border">
          <div className="text-xs font-semibold text-muted-foreground mb-4 uppercase tracking-wider">Agent Pipeline</div>
          <div className="flex items-center gap-1 overflow-x-auto">
            {[
              { label: 'Script Writer', model: 'Mistral-7B', color: 'violet' },
              { label: 'Scene Visualizer', model: 'FLUX.1-dev', color: 'cyan' },
              { label: 'Audio Producer', model: 'Bark + MusicGen', color: 'amber' },
              { label: 'Video Compiler', model: 'I2VGen-XL', color: 'green' },
            ].map((agent, i) => (
              <div key={i} className="flex items-center gap-1 flex-shrink-0">
                <div className={cn(
                  'rounded-lg px-3 py-2 border text-center min-w-[100px]',
                  agent.color === 'violet' && 'bg-violet-500/10 border-violet-500/30',
                  agent.color === 'cyan' && 'bg-cyan-500/10 border-cyan-500/30',
                  agent.color === 'amber' && 'bg-amber-500/10 border-amber-500/30',
                  agent.color === 'green' && 'bg-green-500/10 border-green-500/30',
                )}>
                  <div className="text-xs font-semibold text-foreground">{agent.label}</div>
                  <div className="text-[9px] text-muted-foreground font-mono mt-0.5">{agent.model}</div>
                </div>
                {i < 3 && <ArrowRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-muted-foreground">
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!prompt.trim()}
            className="bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white border-0 px-8"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Launch AI Agents
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
