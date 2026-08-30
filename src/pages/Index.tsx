import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { useProjects } from '@/hooks/useProjects';
import { getTokenStats } from '@/lib/tokenRouter';
import { VIDEO_FORMATS } from '@/constants';
import ProjectCard from '@/components/features/ProjectCard';
import TokenBadge from '@/components/features/TokenBadge';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, Film, Zap, Clock } from 'lucide-react';
import heroBanner from '@/assets/hero-banner.jpg';

export default function Index() {
  const navigate = useNavigate();
  const { projects, deleteProject } = useProjects();
  const stats = getTokenStats();

  const completed = projects.filter(p => p.status === 'completed').length;
  const processing = projects.filter(p => p.status === 'processing').length;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">AI-powered multi-agent video studio</p>
          </div>
          <div className="flex items-center gap-3">
            <TokenBadge />
            <Button
              onClick={() => navigate('/create')}
              className="bg-gradient-to-r from-violet-600 to-violet-700 hover:from-violet-500 hover:to-violet-600 text-white border-0"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* Hero Banner */}
        <div
          className="relative h-52 rounded-2xl overflow-hidden border border-border"
          style={{ backgroundImage: `url(${heroBanner})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 flex items-center px-8">
            <div>
              <div className="text-xs font-semibold text-violet-400 mb-2 tracking-wider uppercase">Multi-Agent Pipeline</div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Text → <span className="text-gradient">AI Video</span>
              </h2>
              <p className="text-sm text-white/70 max-w-xs">
                4 specialized AI agents working in parallel using 🤗 Hugging Face models
              </p>
              <Button
                onClick={() => navigate('/create')}
                className="mt-4 bg-white text-black hover:bg-white/90 font-semibold text-sm h-9"
              >
                Start Creating
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Projects', value: projects.length, icon: Film, color: 'text-violet-400' },
            { label: 'Completed', value: completed, icon: TrendingUp, color: 'text-green-400' },
            { label: 'Processing', value: processing, icon: Zap, color: 'text-blue-400' },
            { label: 'Active Tokens', value: stats.active, icon: Clock, color: 'text-amber-400' },
          ].map(stat => (
            <div key={stat.label} className="glass rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Video Formats */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-3">Quick Create</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {VIDEO_FORMATS.map(fmt => (
              <button
                key={fmt.value}
                onClick={() => navigate(`/create?format=${fmt.value}`)}
                className="glass rounded-xl p-4 border border-border hover:border-violet-500/40 hover:bg-violet-500/5 transition-all duration-200 text-left group"
              >
                <div className="text-2xl mb-2">{fmt.icon}</div>
                <div className="text-sm font-semibold text-foreground">{fmt.label}</div>
                <div className="text-[11px] text-muted-foreground mt-1">{fmt.aspect} · {fmt.duration}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Recent Projects</h2>
            <button
              onClick={() => navigate('/projects')}
              className="text-xs text-violet-400 hover:text-violet-300"
            >
              View all →
            </button>
          </div>
          {projects.length === 0 ? (
            <div className="glass rounded-xl p-12 border border-border text-center">
              <Film className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No projects yet. Create your first AI video!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.slice(0, 3).map(p => (
                <ProjectCard key={p.id} project={p} onDelete={deleteProject} />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
