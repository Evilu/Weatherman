import { createHmac, timingSafeEqual } from 'crypto';

/**
 * Verify Tomorrow.io-like webhook signature.
 * - Accepts header formats like "sha256=<hex>" or raw hex.
 * - Uses JSON.stringify(payload) as the canonical body when payload is an object.
 */
export function verifyTomorrowSignature(
  signatureHeader: string | undefined,
  secret: string,
  payload?: any,
): boolean {
  if (!signatureHeader || !secret) return false;

  let sig = signatureHeader.trim();
  if (sig.startsWith('sha256=')) sig = sig.slice(7);

  const body = typeof payload === 'string' ? payload : JSON.stringify(payload ?? {});

  const expected = createHmac('sha256', secret).update(body).digest('hex');

  try {
    const a = Buffer.from(expected, 'hex');
    const b = Buffer.from(sig, 'hex');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

