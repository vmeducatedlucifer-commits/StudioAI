/**
 * Real Hugging Face Inference API Client
 * With automatic token rotation & failover
 */

import {
  getActiveToken,
  markTokenUsed,
  markTokenFailed,
  markTokenExhausted,
} from './tokenRouter';

const HF_API = 'https://api-inference.huggingface.co/models';

export class HFApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public tokenId?: string
  ) {
    super(message);
    this.name = 'HFApiError';
  }
}

async function callWithRetry<T>(
  fn: (token: string, tokenId: string) => Promise<T>,
  maxRetries = 5
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    const tokenObj = getActiveToken();
    if (!tokenObj) {
      throw new HFApiError('No active HF tokens available. Please add tokens in Admin panel.', 401);
    }

    try {
      markTokenUsed(tokenObj.id);
      const result = await fn(tokenObj.token, tokenObj.id);
      return result;
    } catch (err: any) {
      lastError = err;
      console.error(`HF API attempt ${i + 1} failed:`, err.message);

      if (err.status === 429 || err.message?.includes('quota')) {
        console.warn(`Token ${tokenObj.label} quota exhausted, rotating...`);
        markTokenExhausted(tokenObj.id);
      } else if (err.status >= 500) {
        markTokenFailed(tokenObj.id);
      } else if (err.status === 503) {
        // Model loading — wait and retry same token
        console.log('Model loading, waiting 20s...');
        await sleep(20000);
        continue;
      } else if (err.status === 401 || err.status === 403) {
        markTokenFailed(tokenObj.id);
      }

      await sleep(Math.min(2000 * (i + 1), 10000));
    }
  }

  throw lastError || new HFApiError('Max retries exceeded', 500);
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ─── TEXT GENERATION (Script Writing) ────────────────────────────────────────

export async function generateText(
  model: string,
  prompt: string,
  params: {
    max_new_tokens?: number;
    temperature?: number;
    top_p?: number;
    repetition_penalty?: number;
  } = {}
): Promise<string> {
  return callWithRetry(async (token) => {
    const res = await fetch(`${HF_API}/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: params.max_new_tokens ?? 512,
          temperature: params.temperature ?? 0.7,
          top_p: params.top_p ?? 0.9,
          repetition_penalty: params.repetition_penalty ?? 1.1,
          return_full_text: false,
        },
        options: { wait_for_model: true, use_cache: false },
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new HFApiError(`Text gen failed: ${res.status} ${body}`, res.status);
    }

    const data = await res.json();
    if (Array.isArray(data) && data[0]?.generated_text) {
      return data[0].generated_text.trim();
    }
    if (data?.generated_text) return data.generated_text.trim();
    if (typeof data === 'string') return data.trim();
    throw new HFApiError('Unexpected text response format', 500);
  });
}

// ─── IMAGE GENERATION ─────────────────────────────────────────────────────────

export async function generateImage(
  model: string,
  prompt: string,
  negativePrompt = 'blurry, low quality, distorted, watermark',
  width = 512,
  height = 512
): Promise<string> {
  return callWithRetry(async (token) => {
    const res = await fetch(`${HF_API}/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          negative_prompt: negativePrompt,
          width,
          height,
          num_inference_steps: 25,
          guidance_scale: 7.5,
        },
        options: { wait_for_model: true },
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new HFApiError(`Image gen failed: ${res.status} ${body}`, res.status);
    }

    const blob = await res.blob();
    return URL.createObjectURL(blob);
  });
}

// ─── TEXT-TO-SPEECH (Voiceover) ───────────────────────────────────────────────

export async function generateSpeech(
  model: string,
  text: string
): Promise<string> {
  return callWithRetry(async (token) => {
    const res = await fetch(`${HF_API}/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: text,
        options: { wait_for_model: true },
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new HFApiError(`TTS failed: ${res.status} ${body}`, res.status);
    }

    const blob = await res.blob();
    return URL.createObjectURL(blob);
  });
}

// ─── MUSIC GENERATION ────────────────────────────────────────────────────────

export async function generateMusic(
  model: string,
  description: string
): Promise<string> {
  return callWithRetry(async (token) => {
    const res = await fetch(`${HF_API}/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: description,
        options: { wait_for_model: true },
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new HFApiError(`Music gen failed: ${res.status} ${body}`, res.status);
    }

    const blob = await res.blob();
    return URL.createObjectURL(blob);
  });
}

// ─── ZERO-SHOT CLASSIFICATION (scene tagging) ─────────────────────────────────

export async function classifyText(
  model: string,
  text: string,
  labels: string[]
): Promise<string> {
  return callWithRetry(async (token) => {
    const res = await fetch(`${HF_API}/${model}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: text,
        parameters: { candidate_labels: labels },
        options: { wait_for_model: true },
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new HFApiError(`Classification failed: ${res.status} ${body}`, res.status);
    }

    const data = await res.json();
    return data?.labels?.[0] ?? labels[0];
  });
}
