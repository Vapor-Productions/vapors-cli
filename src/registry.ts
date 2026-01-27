import { Readable } from 'node:stream';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { DEFAULT_REGISTRY_BASE_URL } from './constants.js';
import type {
  RegistryCategory,
  RegistryCategoryIndex,
  RegistryRootIndex,
  RegistryTemplate,
  R2Settings,
} from './types.js';
import { normalizeBaseUrl } from './utils/strings.js';

export function getRegistryIndexUrl(): { indexUrl: string; baseUrl: string } {
  const normalized = normalizeBaseUrl(DEFAULT_REGISTRY_BASE_URL);
  return { indexUrl: `${normalized}index.json`, baseUrl: normalized };
}

export function getR2Settings(): R2Settings | null {
  const endpoint = process.env.VAPORS_R2_ENDPOINT;
  const bucket = process.env.VAPORS_R2_BUCKET;
  const accessKeyId = process.env.VAPORS_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.VAPORS_R2_SECRET_ACCESS_KEY;
  const region = process.env.VAPORS_R2_REGION || 'auto';

  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return {
    endpoint,
    bucket,
    accessKeyId,
    secretAccessKey,
    region,
  };
}

export function urlToObjectKey(url: string): string {
  const parsed = new URL(url);
  return parsed.pathname.replace(/^\/+/, '');
}

async function streamToBuffer(body: unknown): Promise<Buffer> {
  if (!body) {
    throw new Error('Missing response body');
  }

  if (body instanceof Readable) {
    const chunks: Buffer[] = [];
    for await (const chunk of body) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  }

  if (typeof (body as ReadableStream).getReader === 'function') {
    const buffer = await new Response(body as ReadableStream).arrayBuffer();
    return Buffer.from(buffer);
  }

  if (body instanceof Uint8Array) {
    return Buffer.from(body);
  }

  throw new Error('Unsupported response body type');
}

async function fetchJsonHttp<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch registry index: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
}

async function fetchJsonR2<T>(key: string, settings: R2Settings): Promise<T> {
  const client = new S3Client({
    region: settings.region,
    endpoint: settings.endpoint,
    credentials: {
      accessKeyId: settings.accessKeyId,
      secretAccessKey: settings.secretAccessKey,
    },
  });
  const response = await client.send(
    new GetObjectCommand({
      Bucket: settings.bucket,
      Key: key,
    })
  );

  const buffer = await streamToBuffer(response.Body);
  return JSON.parse(buffer.toString('utf8')) as T;
}

async function fetchRootIndex(
  indexUrl: string,
  useR2: boolean,
  settings: R2Settings | null
): Promise<RegistryRootIndex> {
  if (useR2) {
    if (!settings) {
      throw new Error('Missing R2 credentials. Set VAPORS_R2_* env vars.');
    }
    return fetchJsonR2<RegistryRootIndex>(urlToObjectKey(indexUrl), settings);
  }

  return fetchJsonHttp<RegistryRootIndex>(indexUrl);
}

function resolveCategoryUrl(category: RegistryCategory, baseUrl: string): string {
  if (category.url) {
    return category.url;
  }
  const fileName = category.file || `${category.name}.json`;
  return new URL(fileName, baseUrl).toString();
}

async function fetchCategoryIndex(
  categoryUrl: string,
  useR2: boolean,
  settings: R2Settings | null
): Promise<RegistryCategoryIndex> {
  if (useR2) {
    if (!settings) {
      throw new Error('Missing R2 credentials. Set VAPORS_R2_* env vars.');
    }
    return fetchJsonR2<RegistryCategoryIndex>(urlToObjectKey(categoryUrl), settings);
  }

  return fetchJsonHttp<RegistryCategoryIndex>(categoryUrl);
}

export async function loadRegistryTemplates(
  indexUrl: string,
  baseUrl: string,
  useR2: boolean,
  settings: R2Settings | null,
  categoryFilter?: string
): Promise<{ templates: RegistryTemplate[]; categories: RegistryCategory[] }> {
  const root = await fetchRootIndex(indexUrl, useR2, settings);
  if (!Array.isArray(root.categories)) {
    throw new Error('Registry index is missing "categories" array.');
  }

  const categories = categoryFilter
    ? root.categories.filter((category: RegistryCategory) => category.name === categoryFilter)
    : root.categories;

  if (categoryFilter && categories.length === 0) {
    throw new Error(`Category not found in registry: ${categoryFilter}`);
  }

  const templates: RegistryTemplate[] = [];
  for (const category of categories) {
    const categoryUrl = resolveCategoryUrl(category, baseUrl);
    const categoryIndex = await fetchCategoryIndex(categoryUrl, useR2, settings);
    if (!Array.isArray(categoryIndex.templates)) {
      throw new Error(`Category index is missing "templates" array: ${categoryUrl}`);
    }
    templates.push(...categoryIndex.templates);
  }

  return { templates, categories };
}
