import AppLayout from '@/components/layout/AppLayout';
import { AGENT_DEFINITIONS, HF_MODELS } from '@/constants';
import { PenLine, Image, Music, Video, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

const agentIcons = { script: PenLine, image: Image, audio: Music, compiler: Video };
const agentColors = {
  script: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400' },
  image: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400' },
  audio: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400' },
  compiler: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400' },
};

export default function AgentStudio() {
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div>
          <div className="text-xs font-semibold text-violet-400 mb-1 uppercase tracking-wider">Agent Studio</div>
          <h1 className="text-2xl font-bold text-foreground">AI Agent Teams</h1>
          <p className="text-sm text-muted-foreground mt-1">
            4 specialized agents run sequentially, each powered by dedicated Hugging Face models
          </p>
        </div>

        {/* Pipeline Diagram */}
        <div className="glass rounded-xl p-6 border border-border">
          <div className="text-xs font-semibold text-muted-foreground mb-5 uppercase tracking-wider">Pipeline Flow</div>
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-2">
            {AGENT_DEFINITIONS.map((agent, i) => {
              const Icon = agentIcons[agent.type];
              const cls = agentColors[agent.type];
              return (
                <div key={agent.id} className="flex lg:flex-col items-center gap-2 lg:gap-1 flex-1">
                  <div className={cn('flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border', cls.bg, cls.border)}>
                    <Icon className={cn('w-5 h-5', cls.text)} />
                  </div>
                  {i < 3 && (
                    <div className="hidden lg:flex h-0.5 w-full bg-gradient-to-r from-border to-transparent mt-6" />
                  )}
                  <div className="hidden lg:block" />
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
            {AGENT_DEFINITIONS.map(agent => {
              const Icon = agentIcons[agent.type];
              const cls = agentColors[agent.type];
              return (
                <div key={agent.id} className={cn('rounded-xl p-4 border', cls.bg, cls.border)}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className={cn('w-4 h-4', cls.text)} />
                    <span className={cn('text-sm font-semibold', cls.text)}>{agent.name}</span>
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground bg-surface-1 rounded px-2 py-1 mb-3 truncate">
                    🤗 {agent.hfModel}
                  </div>
                  <div className="space-y-1">
                    {agent.tasks.map(task => (
                      <div key={task} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <div className={cn('w-1 h-1 rounded-full flex-shrink-0', cls.text.replace('text-', 'bg-'))} />
                        {task}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* HF Models Reference */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(HF_MODELS).map(([category, models]) => (
            <div key={category} className="glass rounded-xl p-5 border border-border">
              <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider capitalize">
                {category} Models
              </div>
              <div className="space-y-2">
                {models.map(model => (
                  <div key={model.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <div className="text-xs font-semibold text-foreground">{model.label}</div>
                      <div className="text-[10px] font-mono text-muted-foreground">{model.id}</div>
                    </div>
                    <a
                      href={`https://huggingface.co/${model.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-400 hover:text-violet-300"
                      onClick={e => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
