import AppLayout from '@/components/layout/AppLayout';
import { HF_MODELS } from '@/constants';
import { Info } from 'lucide-react';

export default function Settings() {
  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Platform configuration and model preferences</p>
        </div>

        <div className="glass rounded-xl p-5 border border-border">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-400 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-foreground mb-1">Backend Required for Full Functionality</div>
              <div className="text-xs text-muted-foreground leading-relaxed">
                Actual Hugging Face API calls, video rendering, and file storage require OnSpace Cloud backend.
                V1.0 simulates the agent pipeline. Enable backend to connect real HF Spaces.
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-5 border border-border space-y-4">
          <div className="text-sm font-semibold text-foreground">Hugging Face Integration</div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <div className="text-sm text-foreground">Token Router Mode</div>
                <div className="text-xs text-muted-foreground">Auto-rotate tokens on quota exhaustion</div>
              </div>
              <div className="text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/30 px-2 py-1 rounded">
                Enabled
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-border">
              <div>
                <div className="text-sm text-foreground">Fail Threshold</div>
                <div className="text-xs text-muted-foreground">Auto-disable token after N failures</div>
              </div>
              <div className="text-xs font-semibold text-foreground bg-surface-3 px-3 py-1 rounded border border-border">
                3 failures
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm text-foreground">Routing Strategy</div>
                <div className="text-xs text-muted-foreground">How to select the next token</div>
              </div>
              <div className="text-xs font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/30 px-2 py-1 rounded">
                Round-Robin + LRU
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-5 border border-border">
          <div className="text-sm font-semibold text-foreground mb-4">Model Registry</div>
          <div className="space-y-3">
            {Object.entries(HF_MODELS).map(([cat, models]) => (
              <div key={cat}>
                <div className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">{cat}</div>
                <div className="space-y-1">
                  {models.map(m => (
                    <div key={m.id} className="flex items-center justify-between text-xs py-1">
                      <span className="text-foreground font-medium">{m.label}</span>
                      <span className="font-mono text-muted-foreground">{m.id}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
