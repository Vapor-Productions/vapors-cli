import { createInterface } from 'node:readline/promises';

export type Prompt = ReturnType<typeof createInterface>;

export function createPrompt(disabled: boolean): Prompt | null {
  if (disabled) {
    return null;
  }
  return createInterface({ input: process.stdin, output: process.stdout });
}

export async function promptInput(
  rl: Prompt,
  question: string,
  fallback?: string
): Promise<string> {
  const answer = (await rl.question(question)).trim();
  if (!answer && fallback !== undefined) {
    return fallback;
  }
  return answer;
}
