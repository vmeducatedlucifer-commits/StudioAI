import type { Agent } from '@/types';
import { cn } from '@/lib/utils';
import { PenLine, Image, Music, Video, CheckCircle2, AlertCircle, Loader2, Clock } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
  index: number;
}

const agentIcons = {
  script: PenLine,
  image: Image,
  audio: Music,
  compiler: Video,
};

const agentColors = {
  script: {
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    text: 'text-violet-400',
    glow: 'shadow-violet-500/20',
    bar: 'bg-violet-500',
  },
  image: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    text: 'text-cyan-400',
    glow: 'shadow-cyan-500/20',
    bar: 'bg-cyan-500',
  },
  audio: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/20',
    bar: 'bg-amber-500',
  },
  compiler: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-400',
    glow: 'shadow-green-500/20',
    bar: 'bg-green-500',
  },
};

export default function AgentCard({ agent, index }: AgentCardProps) {
  const Icon = agentIcons[agent.type];
  const cls = agentColors[agent.type];
  const isRunning = agent.status === 'running';
  const isComplete = agent.status === 'completed';
  const isError = agent.status === 'error';
  const isWaiting = agent.status === 'waiting' || agent.status === 'idle';

  return (
    <div
      className={cn(
        'rounded-xl p-4 border transition-all duration-300',
        cls.bg,
        cls.border,
        isRunning && `shadow-lg ${cls.glow}`,
        isError && 'border-red-500/30 bg-red-500/5'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', cls.bg, cls.border, 'border')}>
          <Icon className={cn('w-4 h-4', isError ? 'text-red-400' : cls.text)} />
        </div>
        <div className="flex-shrink-0">
          {isRunning && (
            <Loader2 className={cn('w-4 h-4 animate-spin', cls.text)} />
          )}
          {isComplete && (
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          )}
          {isError && (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          {isWaiting && (
            <Clock className="w-4 h-4 text-muted-foreground opacity-40" />
          )}
        </div>
      </div>

      {/* Name & Model */}
      <div className="mb-3">
        <div className={cn('text-sm font-semibold mb-0.5', isError ? 'text-red-400' : cls.text)}>
          {agent.name}
        </div>
        <div className="text-[10px] font-mono text-muted-foreground truncate" title={agent.hfModel}>
          🤗 {agent.hfModel?.split('/')[1] || agent.hfModel}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="h-1.5 bg-surface-1 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              isError ? 'bg-red-500' : isComplete ? 'bg-green-500' : cls.bar
            )}
            style={{ width: `${agent.progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-muted-foreground truncate flex-1 mr-2">
            {agent.error ? (
              <span className="text-red-400">{agent.error.slice(0, 50)}</span>
            ) : (
              agent.currentTask || (isWaiting ? 'Waiting...' : '')
            )}
          </span>
          <span className={cn(
            'text-[10px] font-bold flex-shrink-0',
            isError ? 'text-red-400' : isComplete ? 'text-green-400' : cls.text
          )}>
            {isError ? 'ERR' : `${agent.progress}%`}
          </span>
        </div>
      </div>

      {/* Status Pill */}
      <div className={cn(
        'text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit',
        isRunning && `${cls.bg} ${cls.text} border ${cls.border}`,
        isComplete && 'bg-green-500/10 text-green-400 border border-green-500/30',
        isError && 'bg-red-500/10 text-red-400 border border-red-500/30',
        isWaiting && 'bg-surface-3 text-muted-foreground border border-border',
      )}>
        {isRunning && '⚡ Running'}
        {isComplete && '✓ Done'}
        {isError && '✕ Error'}
        {isWaiting && '○ Waiting'}
      </div>
    </div>
  );
}
