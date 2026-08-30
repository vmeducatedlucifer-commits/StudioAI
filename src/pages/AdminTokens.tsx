import { useState, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useTokens } from '@/hooks/useTokens';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Plus, Trash2, RefreshCw, Power, Upload, Shield, Zap, AlertTriangle, CheckCircle2, Eye, EyeOff
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { HFToken } from '@/types';

export default function AdminTokens() {
  const { tokens, stats, addToken, addBulkTokens, deleteToken, toggleToken, resetToken } = useTokens();
  const [newToken, setNewToken] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [showBulk, setShowBulk] = useState(false);
  const [showTokens, setShowTokens] = useState<Record<string, boolean>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    if (!newToken.trim()) {
      toast.error('Please enter a token');
      return;
    }
    addToken(newToken.trim(), newLabel.trim() || undefined);
    setNewToken('');
    setNewLabel('');
    toast.success('Token added successfully');
  };

  const handleBulk = () => {
    const lines = bulkText.split('\n').filter(l => l.trim());
    if (!lines.length) {
      toast.error('No tokens found in input');
      return;
    }
    addBulkTokens(lines);
    setBulkText('');
    toast.success(`${lines.length} tokens imported`);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      addBulkTokens(lines);
      toast.success(`${lines.length} tokens imported from CSV`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const toggleShowToken = (id: string) => {
    setShowTokens(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const maskToken = (token: string) => {
    if (token.length < 8) return '••••••••';
    return token.slice(0, 6) + '••••••••' + token.slice(-4);
  };

  const statusColor = (t: HFToken) => {
    if (t.quotaExhausted) return 'text-red-400';
    if (!t.isActive) return 'text-muted-foreground';
    return 'text-green-400';
  };

  const statusLabel = (t: HFToken) => {
    if (t.quotaExhausted) return 'Quota Exhausted';
    if (!t.isActive) return 'Disabled';
    return 'Active';
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-violet-400" />
              <div className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Admin Panel</div>
            </div>
            <h1 className="text-2xl font-bold text-foreground">HF Token Manager</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage Hugging Face API tokens with automatic failover routing
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Tokens', value: stats.total, icon: Shield, color: 'text-foreground' },
            { label: 'Active', value: stats.active, icon: CheckCircle2, color: 'text-green-400' },
            { label: 'Exhausted', value: stats.exhausted, icon: AlertTriangle, color: 'text-red-400' },
            { label: 'Disabled', value: stats.total - stats.active - stats.exhausted, icon: Power, color: 'text-muted-foreground' },
          ].map(stat => (
            <div key={stat.label} className="glass rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <stat.icon className={cn('w-4 h-4', stat.color)} />
              </div>
              <div className={cn('text-2xl font-bold', stat.color)}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Token Router Info */}
        <div className="glass rounded-xl p-4 border border-violet-500/20 bg-violet-500/5">
          <div className="flex items-start gap-3">
            <Zap className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-violet-300 mb-1">Auto Token Router</div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                Tokens are used in round-robin order. When a token's quota is exhausted or fails 3+ times,
                it's automatically disabled and the next available token is selected. Tokens with least
                recent usage are prioritized for load balancing.
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Single Token */}
          <div className="glass rounded-xl p-5 border border-border space-y-4">
            <div className="text-sm font-semibold text-foreground">Add Single Token</div>
            <div className="space-y-3">
              <Input
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                placeholder="Label (optional, e.g. Token-Production)"
                className="bg-surface-2 border-border text-foreground"
              />
              <Input
                value={newToken}
                onChange={e => setNewToken(e.target.value)}
                placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxx"
                type="password"
                className="bg-surface-2 border-border text-foreground font-mono"
              />
              <Button
                onClick={handleAdd}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Token
              </Button>
            </div>
          </div>

          {/* Bulk Import */}
          <div className="glass rounded-xl p-5 border border-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-foreground">Bulk Import</div>
              <button
                onClick={() => setShowBulk(!showBulk)}
                className="text-xs text-violet-400 hover:text-violet-300"
              >
                {showBulk ? 'Hide' : 'Paste Text'}
              </button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => fileRef.current?.click()}
                className="flex-1 border-border text-muted-foreground hover:text-foreground"
              >
                <Upload className="w-4 h-4 mr-2" /> Upload CSV
              </Button>
              <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleCSVUpload} />
            </div>

            <div className="text-[11px] text-muted-foreground">
              CSV format: <code className="text-violet-400">token,label</code> (one per line)
            </div>

            {showBulk && (
              <div className="space-y-2">
                <Textarea
                  value={bulkText}
                  onChange={e => setBulkText(e.target.value)}
                  placeholder={"hf_token1,Label 1\nhf_token2,Label 2\nhf_token3"}
                  className="h-28 bg-surface-2 border-border text-foreground font-mono text-xs resize-none"
                />
                <Button
                  onClick={handleBulk}
                  className="w-full bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30"
                >
                  Import {bulkText.split('\n').filter(l => l.trim()).length} Tokens
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Token List */}
        <div className="glass rounded-xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="text-sm font-semibold text-foreground">Token List ({tokens.length})</div>
          </div>

          {tokens.length === 0 ? (
            <div className="p-12 text-center">
              <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No tokens added yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {tokens.map((token, idx) => (
                <div key={token.id} className={cn(
                  'flex items-center gap-4 px-5 py-3 hover:bg-surface-3 transition-colors',
                  !token.isActive && 'opacity-60'
                )}>
                  <div className="text-xs text-muted-foreground w-5 text-center">{idx + 1}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">{token.label}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] px-1.5 py-0 border',
                          token.quotaExhausted ? 'border-red-500/30 text-red-400' :
                          !token.isActive ? 'border-border text-muted-foreground' :
                          'border-green-500/30 text-green-400'
                        )}
                      >
                        {statusLabel(token)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <code className="text-[11px] text-muted-foreground font-mono">
                        {showTokens[token.id] ? token.token : maskToken(token.token)}
                      </code>
                      <button onClick={() => toggleShowToken(token.id)} className="text-muted-foreground hover:text-foreground">
                        {showTokens[token.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>

                  <div className="text-[11px] text-muted-foreground text-right flex-shrink-0">
                    <div>Used: {token.usageCount}×</div>
                    {token.failCount > 0 && <div className="text-red-400">Fails: {token.failCount}</div>}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { resetToken(token.id); toast.success('Token reset'); }}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-amber-400"
                      title="Reset token"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleToken(token.id)}
                      className={cn('h-7 w-7 p-0', token.isActive ? 'text-green-400 hover:text-muted-foreground' : 'text-muted-foreground hover:text-green-400')}
                      title={token.isActive ? 'Disable token' : 'Enable token'}
                    >
                      <Power className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { deleteToken(token.id); toast.success('Token deleted'); }}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-red-400"
                      title="Delete token"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
