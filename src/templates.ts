import { formatCategoryLabel, toCamelCase, toKebabCase, toPascalCase } from './utils/strings.js';

export function commandTemplate(name: string, category: string): string {
  const className = toPascalCase(name);
  const commandName = toKebabCase(name);
  const categoryLabel = formatCategoryLabel(category);
  return `import { Category } from '@discordx/utilities';
import type { CommandInteraction } from 'discord.js';
import { Discord, Slash } from 'discordx';

@Discord()
@Category('${categoryLabel}')
export class ${className} {
  @Slash({ description: 'Describe what ${commandName} does' })
  async ${toCamelCase(name)}(interaction: CommandInteraction): Promise<void> {
    await interaction.reply({ content: 'TODO: implement ${commandName}' });
  }
}
`;
}

export function eventTemplate(name: string, once: boolean): string {
  const className = toPascalCase(name);
  const decorator = once ? 'Once' : 'On';
  const handlerName = toCamelCase(name);
  return `import { Discord, ${decorator} } from 'discordx';

@Discord()
export class ${className} {
  @${decorator}()
  async ${handlerName}(...args: unknown[]): Promise<void> {
    console.log('${handlerName} event received', args.length);
  }
}
`;
}

export function utilTemplate(name: string): string {
  const functionName = toCamelCase(name);
  return `/**
 * TODO: Describe what ${functionName} does.
 */
export function ${functionName}(input: string): string {
  return input;
}
`;
}
