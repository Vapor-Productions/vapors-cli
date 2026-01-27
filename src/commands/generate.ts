import path from 'node:path';
import type { Config, TemplateType } from '../types.js';
import { createPrompt, promptInput } from '../cli/prompt.js';
import { getFlagString, hasFlag } from '../cli/args.js';
import { writeFileSafely } from '../utils/fs.js';
import { toKebabCase } from '../utils/strings.js';
import { commandTemplate, eventTemplate, utilTemplate } from '../templates.js';

export async function runGenerate(
  config: Config,
  projectRoot: string,
  flags: Record<string, string | boolean>
): Promise<void> {
  const force = hasFlag(flags, 'force') || hasFlag(flags, 'f');
  const noPrompt = hasFlag(flags, 'no-prompt');

  const rl = createPrompt(noPrompt);

  const typeValue =
    getFlagString(flags, 'type') ||
    (rl ? await promptInput(rl, 'Template type (command/event/util): ') : undefined);

  if (!typeValue) {
    throw new Error('Missing template type. Use --type or enable prompts.');
  }

  const type = typeValue.toLowerCase() as TemplateType;
  if (!['command', 'event', 'util'].includes(type)) {
    throw new Error(`Unsupported template type: ${typeValue}`);
  }

  const nameValue =
    getFlagString(flags, 'name') || (rl ? await promptInput(rl, 'Name: ') : undefined);
  if (!nameValue) {
    throw new Error('Missing name. Use --name or enable prompts.');
  }

  let categoryValue: string | undefined;
  if (type === 'command') {
    categoryValue =
      getFlagString(flags, 'category') ||
      (rl ? await promptInput(rl, 'Category: ') : undefined);
    if (!categoryValue) {
      throw new Error('Missing category. Use --category or enable prompts.');
    }
  }

  if (rl) {
    await rl.close();
  }

  if (type === 'command') {
    const commandsRoot = config.structures.commands;
    if (!commandsRoot) {
      console.warn('Command structure is not configured. Skipping command generation.');
      return;
    }
    const commandCategory = categoryValue;
    if (!commandCategory) {
      throw new Error('Missing category. Use --category or enable prompts.');
    }
    const categoryDir = path.join(projectRoot, commandsRoot, toKebabCase(commandCategory));
    const fileName = `${toKebabCase(nameValue)}.ts`;
    const filePath = path.join(categoryDir, fileName);
    await writeFileSafely(filePath, commandTemplate(nameValue, commandCategory), force);
    console.log(`Command template created at ${filePath}`);
    return;
  }

  if (type === 'event') {
    const eventsRoot = config.structures.events;
    if (!eventsRoot) {
      console.warn('Event structure is not configured. Skipping event generation.');
      return;
    }
    const fileName = `${toKebabCase(nameValue)}.ts`;
    const filePath = path.join(projectRoot, eventsRoot, fileName);
    const once = hasFlag(flags, 'once');
    await writeFileSafely(filePath, eventTemplate(nameValue, once), force);
    console.log(`Event template created at ${filePath}`);
    return;
  }

  const utilsRoot = config.structures.utils;
  if (!utilsRoot) {
    console.warn('Utility structure is not configured. Skipping utility generation.');
    return;
  }
  const fileName = `${toKebabCase(nameValue)}.ts`;
  const filePath = path.join(projectRoot, utilsRoot, fileName);
  await writeFileSafely(filePath, utilTemplate(nameValue), force);
  console.log(`Utility template created at ${filePath}`);
}
