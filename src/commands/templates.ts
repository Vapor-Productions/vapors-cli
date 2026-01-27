import type { Config } from '../types.js';
import { hasFlag } from '../cli/args.js';
import { getRegistryIndexUrl, getR2Settings, loadRegistryTemplates } from '../registry.js';

export async function runTemplatesList(config: Config, flags: Record<string, string | boolean>): Promise<void> {
  const registryInfo = getRegistryIndexUrl();
  const useR2 = hasFlag(flags, 'r2');
  const r2Settings = useR2 ? getR2Settings() : null;

  if (useR2 && !r2Settings) {
    throw new Error('Missing R2 credentials. Set VAPORS_R2_* env vars.');
  }

  const registry = await loadRegistryTemplates(
    registryInfo.indexUrl,
    registryInfo.baseUrl,
    useR2,
    r2Settings
  );
  console.log('Available templates:');
  for (const template of registry.templates) {
    const description = template.description ? ` - ${template.description}` : '';
    const version = template.version ? ` (${template.version})` : '';
    console.log(`- ${template.name}${version}${description}`);
  }
}
