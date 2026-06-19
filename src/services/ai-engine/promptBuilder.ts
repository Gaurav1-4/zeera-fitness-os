import { COACH_PERSONA } from './coachPersona';
import { SAFETY_RULES } from './safetyRules';

export function buildSystemPrompt(userContext: string): string {
  return `
${COACH_PERSONA}

${SAFETY_RULES}

Here is the real-time data for the user you are coaching right now. You must adapt your advice to fit their specific profile, targets, and history. Do not give generic advice if it contradicts their data.

${userContext}
  `.trim();
}
