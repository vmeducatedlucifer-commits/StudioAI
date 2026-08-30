import { useNavigate } from 'react-router-dom';
import { Zap, AlertTriangle } from 'lucide-react';
import { getTokenStats } from '@/lib/tokenRouter';

export default function TokenBadge() {
  const navigate = useNavigate();
  const stats = getTokenStats();
  const isLow = stats.active < 2;

  return (
    <button
      onClick={() => navigate('/admin/tokens')}
      className="flex items-center gap-2 glass rounded-lg px-3 py-1.5 border border-border hover:border-violet-500/30 transition-all"
    >
      {isLow ? (
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
      ) : (
        <Zap className="w-3.5 h-3.5 text-violet-400" />
      )}
      <span className="text-xs">
        <span className={isLow ? 'text-amber-400 font-semibold' : 'text-green-400 font-semibold'}>
          {stats.active}
        </span>
        <span className="text-muted-foreground">/{stats.total} tokens active</span>
      </span>
    </button>
  );
}
