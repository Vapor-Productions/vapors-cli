#!/usr/bin/env node

import { parseArgs, hasFlag } from './cli/args.js';
import { printHelp } from './cli/help.js';
import { ensureInitialized, resolveConfigPath, resolveConfigProjectRoot, resolveProjectRoot } from './config.js';
import { runInit } from './commands/init.js';
import { runGenerate } from './commands/generate.js';
import { runTemplatesList } from './commands/templates.js';

async function main(): Promise<void> {
  const parsed = parseArgs(process.argv.slice(2));

  if (
    !parsed.command ||
    parsed.command === 'help' ||
    hasFlag(parsed.flags, 'help') ||
    hasFlag(parsed.flags, 'h')
  ) {
    printHelp();
    return;
  }

  switch (parsed.command) {
    case 'init': {
      const projectRoot = resolveProjectRoot(parsed.flags);
      const configPath = resolveConfigPath(projectRoot, parsed.flags);
      await runInit(configPath, parsed.flags);
      return;
    }
    case 'generate':
    case 'gen': {
      const projectRoot = resolveProjectRoot(parsed.flags);
      const configPath = resolveConfigPath(projectRoot, parsed.flags);
      const config = await ensureInitialized(configPath);
      const resolvedRoot = resolveConfigProjectRoot(configPath, config);
      await runGenerate(config, resolvedRoot, parsed.flags);
      return;
    }
    case 'templates': {
      if (parsed.subcommand === 'list') {
        const projectRoot = resolveProjectRoot(parsed.flags);
        const configPath = resolveConfigPath(projectRoot, parsed.flags);
        const config = await ensureInitialized(configPath);
        await runTemplatesList(config, parsed.flags);
        return;
      }
      throw new Error('Unknown templates subcommand. Use "templates list".');
    }
    default:
      throw new Error(`Unknown command: ${parsed.command}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
