import { randomInt } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { get } from '@vercel/global-config';

const MAX_TARGETS = 1000;
const MAX_BYTES = 750_000;

export function normalizeTargets(value) {
  if (!Array.isArray(value) || value.length < 1 || value.length > MAX_TARGETS) {
    throw new Error('需要 1 到 1000 条网址');
  }
  const urls = [];
  const seen = new Set();
  for (const candidate of value) {
    if (typeof candidate !== 'string' || candidate.length > 2048) {
      throw new Error('网址必须是长度不超过 2048 的文本');
    }
    const raw = candidate.trim();
    let parsed;
    try { parsed = new URL(raw); } catch { throw new Error(`无效网址：${raw.slice(0, 80)}`); }
    if (!['http:', 'https:'].includes(parsed.protocol) || !parsed.hostname || parsed.username || parsed.password) {
      throw new Error(`只接受不带账号密码的 HTTP(S) 网址：${raw.slice(0, 80)}`);
    }
    if (!seen.has(raw)) {
      seen.add(raw);
      urls.push(raw);
    }
  }
  if (Buffer.byteLength(JSON.stringify(urls)) > MAX_BYTES) {
    throw new Error('网址列表超过存储大小限制');
  }
  return urls;
}

export function selectTarget(urls) {
  return urls[randomInt(urls.length)];
}

function storageKey() {
  const key = process.env.GLOBAL_CONFIG_KEY || 'newnew_targets';
  if (!/^[A-Za-z0-9_-]{1,256}$/.test(key)) throw new Error('GLOBAL_CONFIG_KEY 无效');
  return key;
}

export async function readTargets() {
  if (process.env.LOCAL_TARGETS_FILE) {
    const data = JSON.parse(await readFile(process.env.LOCAL_TARGETS_FILE, 'utf8'));
    return normalizeTargets(data.urls);
  }
  if (!process.env.GLOBAL_CONFIG) throw new Error('Target storage is not configured');
  const data = await get(storageKey());
  if (data == null) throw new Error('Target list is missing');
  return normalizeTargets(data.urls);
}
