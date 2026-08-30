import { useNavigate } from 'react-router-dom';
import type { VideoProject } from '@/types';
import { VIDEO_FORMATS } from '@/constants';
import { Clock, CheckCircle2, Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ProjectCardProps {
  project: VideoProject;
  onDelete?: (id: string) => void;
}

const statusConfig = {
  draft: { icon: Clock, color: 'text-muted-foreground', label: 'Draft', bg: 'bg-surface-3' },
  processing: { icon: Loader2, color: 'text-blue-400', label: 'Processing', bg: 'bg-blue-500/10', spin: true },
  completed: { icon: CheckCircle2, color: 'text-green-400', label: 'Completed', bg: 'bg-green-500/10' },
  failed: { icon: AlertCircle, color: 'text-red-400', label: 'Failed', bg: 'bg-red-500/10' },
};

export default function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const navigate = useNavigate();
  const format = VIDEO_FORMATS.find(f => f.value === project.format);
  const status = statusConfig[project.status];
  const StatusIcon = status.icon;

  return (
    <div
      className="glass rounded-xl overflow-hidden border border-border hover:border-violet-500/30 transition-all duration-200 cursor-pointer group"
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      {/* Thumbnail */}
      <div className="relative h-44 overflow-hidden">
        {project.thumbnail ? (
          <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full bg-surface-3 flex items-center justify-center">
            <span className="text-4xl text-muted-foreground">◈</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Format badge */}
        <div className="absolute top-2 left-2">
          <span className="text-[10px] font-semibold bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full border border-white/10">
            {format?.label} · {format?.aspect}
          </span>
        </div>

        {/* Status */}
        <div className={cn('absolute top-2 right-2 flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full', status.bg)}>
          <StatusIcon className={cn('w-3 h-3', status.color, (status as any).spin && 'animate-spin')} />
          <span className={status.color}>{status.label}</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-sm text-foreground mb-1 truncate">{project.title}</h3>
        <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3">{project.prompt}</p>

        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">
            {new Date(project.createdAt).toLocaleDateString()}
          </span>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-400"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(project.id);
              }}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
