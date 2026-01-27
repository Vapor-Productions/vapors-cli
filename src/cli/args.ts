import type { ParsedArgs } from '../types.js';

export function parseArgs(args: string[]): ParsedArgs {
  const flags: Record<string, string | boolean> = {};
  const positionals: string[] = [];
  const booleanFlags = new Set(['help', 'h', 'force', 'f', 'once', 'no-prompt', 'r2']);

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      if (booleanFlags.has(key)) {
        flags[key] = true;
      } else {
        const value = args[i + 1];
        if (!value || value.startsWith('-')) {
          flags[key] = '';
        } else {
          flags[key] = value;
          i += 1;
        }
      }
    } else if (arg.startsWith('-')) {
      const key = arg.slice(1);
      if (booleanFlags.has(key)) {
        flags[key] = true;
      } else {
        const value = args[i + 1];
        if (!value || value.startsWith('-')) {
          flags[key] = '';
        } else {
          flags[key] = value;
          i += 1;
        }
      }
    } else {
      positionals.push(arg);
    }
  }

  const [command, subcommand, ...rest] = positionals;
  return { command, subcommand, positionals: rest, flags };
}

export function getFlagString(
  flags: Record<string, string | boolean>,
  key: string
): string | undefined {
  const value = flags[key];
  if (typeof value === 'string') {
    return value.trim() || undefined;
  }
  return undefined;
}

export function hasFlag(flags: Record<string, string | boolean>, key: string): boolean {
  return Boolean(flags[key]);
}
