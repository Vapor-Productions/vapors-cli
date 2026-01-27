import { DEFAULT_STRUCTURES } from '../constants.js';
import type { Config } from '../types.js';
import { getFlagString } from '../cli/args.js';
import { createPrompt, promptInput } from '../cli/prompt.js';
import { fileExists } from '../utils/fs.js';
import { writeConfig } from '../config.js';

export async function runInit(
  configPath: string,
  flags: Record<string, string | boolean>
): Promise<void> {
  const force = Boolean(flags.force || flags.f);
  const noPrompt = Boolean(flags['no-prompt']);

  if ((await fileExists(configPath)) && !force) {
    throw new Error(`Config already exists at ${configPath}. Use --force to overwrite.`);
  }

  const rl = createPrompt(noPrompt);

  const commandsRoot =
    getFlagString(flags, 'commands-root') ||
    (rl
      ? await promptInput(
          rl,
          `Commands root [${DEFAULT_STRUCTURES.commands}]: `,
          DEFAULT_STRUCTURES.commands
        )
      : DEFAULT_STRUCTURES.commands);
  const eventsRoot =
    getFlagString(flags, 'events-root') ||
    (rl
      ? await promptInput(
          rl,
          `Events root [${DEFAULT_STRUCTURES.events}]: `,
          DEFAULT_STRUCTURES.events
        )
      : DEFAULT_STRUCTURES.events);
  const utilsRoot =
    getFlagString(flags, 'utils-root') ||
    (rl
      ? await promptInput(
          rl,
          `Utils root [${DEFAULT_STRUCTURES.utils}]: `,
          DEFAULT_STRUCTURES.utils
        )
      : DEFAULT_STRUCTURES.utils);

  if (rl) {
    await rl.close();
  }

  const config: Config = {
    version: 1,
    projectRoot: '.',
    structures: {
      commands: commandsRoot,
      events: eventsRoot,
      utils: utilsRoot,
    },
  };

  await writeConfig(configPath, config);
  console.log(`Initialized vapors-cli config at ${configPath}`);
}
