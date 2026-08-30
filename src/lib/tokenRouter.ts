import type { HFToken, TokenStats } from '@/types';

const STORAGE_KEY = 'hf_tokens';

export function getTokens(): HFToken[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTokens(tokens: HFToken[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

export function addToken(token: string, label?: string): HFToken {
  const tokens = getTokens();
  const newToken: HFToken = {
    id: crypto.randomUUID(),
    token,
    label: label || `Token ${tokens.length + 1}`,
    isActive: true,
    usageCount: 0,
    quotaExhausted: false,
    addedAt: new Date().toISOString(),
    failCount: 0,
  };
  tokens.push(newToken);
  saveTokens(tokens);
  return newToken;
}

export function addBulkTokens(lines: string[]): HFToken[] {
  const tokens = getTokens();
  const added: HFToken[] = [];
  let count = tokens.length;

  for (const line of lines) {
    const parts = line.split(',');
    const tokenStr = parts[0]?.trim();
    const label = parts[1]?.trim();
    if (!tokenStr) continue;

    const newToken: HFToken = {
      id: crypto.randomUUID(),
      token: tokenStr,
      label: label || `Token ${count + 1}`,
      isActive: true,
      usageCount: 0,
      quotaExhausted: false,
      addedAt: new Date().toISOString(),
      failCount: 0,
    };
    tokens.push(newToken);
    added.push(newToken);
    count++;
  }

  saveTokens(tokens);
  return added;
}

export function getActiveToken(): HFToken | null {
  const tokens = getTokens();
  const available = tokens.filter(t => t.isActive && !t.quotaExhausted);
  if (available.length === 0) return null;
  // Round-robin: pick the one with least recent usage
  return available.sort((a, b) => (a.lastUsed || '') < (b.lastUsed || '') ? -1 : 1)[0];
}

export function markTokenUsed(tokenId: string): void {
  const tokens = getTokens();
  const idx = tokens.findIndex(t => t.id === tokenId);
  if (idx !== -1) {
    tokens[idx].usageCount++;
    tokens[idx].lastUsed = new Date().toISOString();
    saveTokens(tokens);
  }
}

export function markTokenExhausted(tokenId: string): void {
  const tokens = getTokens();
  const idx = tokens.findIndex(t => t.id === tokenId);
  if (idx !== -1) {
    tokens[idx].quotaExhausted = true;
    tokens[idx].failCount++;
    tokens[idx].isActive = false;
    saveTokens(tokens);
  }
}

export function markTokenFailed(tokenId: string): void {
  const tokens = getTokens();
  const idx = tokens.findIndex(t => t.id === tokenId);
  if (idx !== -1) {
    tokens[idx].failCount++;
    if (tokens[idx].failCount >= 3) {
      tokens[idx].isActive = false;
    }
    saveTokens(tokens);
  }
}

export function deleteToken(tokenId: string): void {
  const tokens = getTokens().filter(t => t.id !== tokenId);
  saveTokens(tokens);
}

export function toggleToken(tokenId: string): void {
  const tokens = getTokens();
  const idx = tokens.findIndex(t => t.id === tokenId);
  if (idx !== -1) {
    tokens[idx].isActive = !tokens[idx].isActive;
    tokens[idx].quotaExhausted = false;
    saveTokens(tokens);
  }
}

export function resetToken(tokenId: string): void {
  const tokens = getTokens();
  const idx = tokens.findIndex(t => t.id === tokenId);
  if (idx !== -1) {
    tokens[idx].isActive = true;
    tokens[idx].quotaExhausted = false;
    tokens[idx].failCount = 0;
    saveTokens(tokens);
  }
}

export function getTokenStats(): TokenStats {
  const tokens = getTokens();
  return {
    total: tokens.length,
    active: tokens.filter(t => t.isActive && !t.quotaExhausted).length,
    exhausted: tokens.filter(t => t.quotaExhausted).length,
    currentIndex: 0,
  };
}
