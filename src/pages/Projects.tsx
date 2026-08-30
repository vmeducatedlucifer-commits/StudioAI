import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useProjects } from '@/hooks/useProjects';
import ProjectCard from '@/components/features/ProjectCard';
import { VIDEO_FORMATS } from '@/constants';
import type { VideoFormat } from '@/types';
import { Film, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function Projects() {
  const { projects, deleteProject } = useProjects();
  const [search, setSearch] = useState('');
  const [filterFormat, setFilterFormat] = useState<VideoFormat | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = projects.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.prompt.toLowerCase().includes(search.toLowerCase());
    const matchFormat = filterFormat === 'all' || p.format === filterFormat;
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchFormat && matchStatus;
  });

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{projects.length} total projects</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="pl-9 bg-surface-2 border-border"
            />
          </div>

          <div className="flex gap-2">
            {(['all', ...VIDEO_FORMATS.map(f => f.value)] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilterFormat(f as VideoFormat | 'all')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                  filterFormat === f
                    ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                    : 'glass border-border text-muted-foreground hover:text-foreground'
                )}
              >
                {f === 'all' ? 'All' : VIDEO_FORMATS.find(v => v.value === f)?.label || f}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {['all', 'processing', 'completed', 'failed'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all border capitalize',
                  filterStatus === s
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'glass border-border text-muted-foreground hover:text-foreground'
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="glass rounded-xl p-16 border border-border text-center">
            <Film className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No projects found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(p => (
              <ProjectCard key={p.id} project={p} onDelete={deleteProject} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
