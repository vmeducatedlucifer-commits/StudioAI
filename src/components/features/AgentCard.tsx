import { cn } from '@/lib/utils';
import type { Agent } from '@/types';
import { CheckCircle2, AlertCircle, Clock, Loader2, PenLine, Image, Music, Video } from 'lucide-react';

const agentIcons = {
  script: PenLine,
  image: Image,
  audio: Music,
  compiler: Video,
};

const agentColors = {
  script: 'violet',
  image: 'cyan',
  audio: 'amber',
  compiler: 'green',
};

const colorClasses = {
  violet: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    icon: 'text-violet-400',
    bar: 'bg-violet-500',
    glow: 'shadow-violet-500/20',
  },
  cyan: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    icon: 'text-cyan-400',
    bar: 'bg-cyan-500',
    glow: 'shadow-cyan-500/20',
  },
  amber: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    icon: 'text-amber-400',
    bar: 'bg-amber-500',
    glow: 'shadow-amber-500/20',
  },
  green: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    icon: 'text-green-400',
    bar: 'bg-green-500',
    glow: 'shadow-green-500/20',
  },
};

interface AgentCardProps {
  agent: Agent;
  index: number;
}

export default function AgentCard({ agent, index }: AgentCardProps) {
  const Icon = agentIcons[agent.type];
  const color = agentColors[agent.type] as keyof typeof colorClasses;
  const cls = colorClasses[color];

  const statusIcon = {
    idle: <Clock className="w-3.5 h-3.5 text-muted-foreground" />,
    waiting: <Clock className="w-3.5 h-3.5 text-muted-foreground animate-pulse" />,
    running: <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />,
    completed: <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />,
    error: <AlertCircle className="w-3.5 h-3.5 text-red-400" />,
  }[agent.status];

  return (
    <div
      className={cn(
        'glass rounded-xl p-4 border transition-all duration-300',
        agent.status === 'running' ? `${cls.border} shadow-lg ${cls.glow}` : 'border-border',
        agent.status === 'completed' ? 'opacity-80' : 'opacity-100'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', cls.bg, 'border', cls.border)}>
            <Icon className={cn('w-4 h-4', cls.icon)} />
          </div>
          <div>
            <div className="text-xs font-semibold text-foreground">Agent {index + 1}</div>
            <div className="text-[11px] text-muted-foreground">{agent.name}</div>
          </div>
        </div>
        {statusIcon}
      </div>

      {/* HF Model */}
      <div className="text-[10px] text-muted-foreground bg-surface-3 rounded px-2 py-1 mb-3 font-mono truncate">
        🤗 {agent.hfModel}
      </div>

      {/* Progress */}
      {(agent.status === 'running' || agent.status === 'completed') && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px]">
            <span className="text-muted-foreground">{agent.currentTask || 'Processing...'}</span>
            <span className={cls.icon}>{Math.round(agent.progress)}%</span>
          </div>
          <div className="h-1 bg-surface-3 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', cls.bar)}
              style={{ width: `${agent.progress}%` }}
            />
          </div>
        </div>
      )}

      {agent.status === 'idle' && (
        <div className="text-[11px] text-muted-foreground">Waiting to start...</div>
      )}

      {agent.status === 'completed' && (
        <div className="text-[11px] text-green-400 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Task completed
        </div>
      )}
    </div>
  );
}
