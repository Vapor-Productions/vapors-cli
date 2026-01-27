import { DEFAULT_STRUCTURES } from '../constants.js';

export function printHelp(): void {
  console.log(`vapors-cli

Usage:
  vapors-cli help
  vapors-cli init [--project <path>] [--config <path>] [--force]
  vapors-cli generate --type <command|event|util> --name <name> [--category <name>]
  vapors-cli templates list

Common options:
  --project <path>     Project root (defaults to current directory)
  --config <path>      Path to vapors.config.json (defaults to project root)
  --force              Overwrite existing files/directories
  --no-prompt          Disable interactive prompts
  --once               For events, generate @Once handler
  --r2                 Use R2 S3-auth instead of public HTTP

Init options:
  --commands-root <path>  Commands root (default: ${DEFAULT_STRUCTURES.commands})
  --events-root <path>    Events root (default: ${DEFAULT_STRUCTURES.events})
  --utils-root <path>     Utils root (default: ${DEFAULT_STRUCTURES.utils})
`);
}
