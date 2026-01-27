export type TemplateType = 'command' | 'event' | 'util';

export type Config = {
  version: number;
  projectRoot: string;
  structures: {
    commands?: string;
    events?: string;
    utils?: string;
  };
};

export type RegistryTemplate = {
  name: string;
  description?: string;
  archiveUrl: string;
  objectKey?: string;
  version?: string;
};

export type RegistryCategory = {
  name: string;
  url?: string;
  file?: string;
};

export type RegistryRootIndex = {
  categories: RegistryCategory[];
};

export type RegistryCategoryIndex = {
  category: string;
  templates: RegistryTemplate[];
};

export type ParsedArgs = {
  command?: string;
  subcommand?: string;
  positionals: string[];
  flags: Record<string, string | boolean>;
};

export type R2Settings = {
  endpoint: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
};
