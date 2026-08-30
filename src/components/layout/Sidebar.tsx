import { useNavigate, useLocation } from 'react-router-dom';
import { Film, LayoutDashboard, Settings, Zap, Shield, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Film, label: 'New Project', path: '/create' },
  { icon: BookOpen, label: 'My Projects', path: '/projects' },
  { icon: Zap, label: 'Agent Studio', path: '/agents' },
  { icon: Shield, label: 'Token Admin', path: '/admin/tokens' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-[220px] min-h-screen bg-surface-1 border-r border-border flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-amber-500 flex items-center justify-center">
            <Film className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-gradient">StudioAI</span>
            <div className="text-[10px] text-muted-foreground -mt-0.5">Multi-Agent Video</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-gradient-to-r from-violet-600/20 to-amber-500/10 text-white border border-violet-500/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-surface-3'
              )}
            >
              <item.icon className={cn('w-4 h-4', active && 'text-violet-400')} />
              {item.label}
              {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />}
            </button>
          );
        })}
      </nav>

      {/* HF Badge */}
      <div className="px-4 py-4 border-t border-border">
        <div className="glass rounded-lg px-3 py-2.5">
          <div className="text-[10px] text-muted-foreground mb-1">Powered by</div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-yellow-500/20 flex items-center justify-center">
              <span className="text-[8px]">🤗</span>
            </div>
            <span className="text-xs font-semibold text-foreground">Hugging Face</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
