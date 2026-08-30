import { useState, useCallback } from 'react';
import type { HFToken } from '@/types';
import {
  getTokens,
  addToken,
  addBulkTokens,
  deleteToken,
  toggleToken,
  resetToken,
  getTokenStats,
} from '@/lib/tokenRouter';

export function useTokens() {
  const [tokens, setTokens] = useState<HFToken[]>(() => getTokens());

  const refresh = useCallback(() => {
    setTokens(getTokens());
  }, []);

  const handleAdd = useCallback((token: string, label?: string) => {
    addToken(token, label);
    refresh();
  }, [refresh]);

  const handleBulkAdd = useCallback((lines: string[]) => {
    addBulkTokens(lines);
    refresh();
  }, [refresh]);

  const handleDelete = useCallback((id: string) => {
    deleteToken(id);
    refresh();
  }, [refresh]);

  const handleToggle = useCallback((id: string) => {
    toggleToken(id);
    refresh();
  }, [refresh]);

  const handleReset = useCallback((id: string) => {
    resetToken(id);
    refresh();
  }, [refresh]);

  const stats = getTokenStats();

  return {
    tokens,
    stats,
    addToken: handleAdd,
    addBulkTokens: handleBulkAdd,
    deleteToken: handleDelete,
    toggleToken: handleToggle,
    resetToken: handleReset,
    refresh,
  };
}
