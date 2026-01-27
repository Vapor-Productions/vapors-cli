import path from 'node:path';
import process from 'node:process';
import { readFile } from 'node:fs/promises';
import type { Config } from './types.js';
import { DEFAULT_CONFIG_NAME } from './constants.js';
import { fileExists, writeJsonFile } from './utils/fs.js';

export function resolveProjectRoot(flags: Record<string, string | boolean>): string {
  const projectFlag = typeof flags.project === 'string' ? flags.project : undefined;
  return projectFlag ? path.resolve(projectFlag) : process.cwd();
}

export function resolveConfigPath(
  projectRoot: string,
  flags: Record<string, string | boolean>
): string {
  const configFlag = typeof flags.config === 'string' ? flags.config : undefined;
  if (configFlag) {
    return path.resolve(configFlag);
  }
  return path.join(projectRoot, DEFAULT_CONFIG_NAME);
}

export async function loadConfig(configPath: string): Promise<Config> {
  const raw = await readFile(configPath, 'utf8');
  return JSON.parse(raw) as Config;
}

export async function ensureInitialized(configPath: string): Promise<Config> {
  if (!(await fileExists(configPath))) {
    throw new Error(
      `Config file not found at ${configPath}. Run "vapors-cli init" to initialize this project.`
    );
  }
  return loadConfig(configPath);
}

export function resolveConfigProjectRoot(configPath: string, config: Config): string {
  const baseDir = path.dirname(configPath);
  return path.resolve(baseDir, config.projectRoot || '.');
}

export async function writeConfig(configPath: string, config: Config): Promise<void> {
  await writeJsonFile(configPath, config);
}
