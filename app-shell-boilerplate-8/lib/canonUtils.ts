import { canonStore } from './canonStore';
import { AIResponseSchema, AIResponse } from '@/schemas/canon';
import { UserState } from './narrative-context';
import canonData from '@/config/canon.json';

/**
 * Retrieves the AI invariants from the canon.json cartridge.
 * This includes the system prompt and hard boundaries.
 */
export function getAIInvariants(): string {
  const { system_prompt, hard_boundaries } = canonData.ai_invariants;
  
  let invariantsString = `[WORLD ENGINE INVARIANTS]\n`;
  invariantsString += `${system_prompt}\n\n`;
  invariantsString += `HARD BOUNDARIES (DO NOT VIOLATE):\n`;
  hard_boundaries.forEach((boundary) => {
    invariantsString += `- ${boundary}\n`;
  });
  invariantsString += `[END WORLD ENGINE INVARIANTS]\n\n`;
  
  return invariantsString;
}

/**
 * Builds a deterministic context string based on the current location, year, and user state.
 * This is prepended to the AI prompt to enforce canon.
 */
export function buildDeterministicContext(
  currentLocationId: string,
  currentYear: number,
  userState: UserState
): string {
  const location = canonStore.locations.find((l) => l.id === currentLocationId);
  
  const relevantEvents = canonStore.events.filter(
    (e) => e.locationId === currentLocationId || Math.abs(e.date - currentYear) <= 50
  );

  const presentCharacters = canonStore.characters.filter(
    (c) => 
      c.timelineBoundary.startYear <= currentYear && 
      (c.timelineBoundary.endYear === null || c.timelineBoundary.endYear >= currentYear)
  );

  const localArtifacts = canonStore.artifacts.filter(
    (a) => a.currentLocationId === currentLocationId
  );

  let contextString = `[SYSTEM CANON ENFORCEMENT]\n`;
  contextString += `Current Year: ${currentYear}\n`;
  
  if (location) {
    contextString += `Current Location: ${location.name} (Controlled by: ${location.controllingFaction || 'None'})\n`;
    contextString += `Location Description: ${location.description}\n`;
  }

  if (relevantEvents.length > 0) {
    contextString += `\nRelevant Historical Events:\n`;
    relevantEvents.forEach((e) => {
      contextString += `- Year ${e.date} (${e.era}): ${e.name}. ${e.description} Involved Factions: ${e.involvedFactions.join(', ')}\n`;
    });
  }

  if (presentCharacters.length > 0) {
    contextString += `\nKnown Characters Alive in this Era:\n`;
    presentCharacters.forEach((c) => {
      contextString += `- ${c.name} (Faction: ${c.faction}): ${c.description}\n`;
    });
  }

  if (localArtifacts.length > 0) {
    contextString += `\nArtifacts Known to be in this Location:\n`;
    localArtifacts.forEach((a) => {
      contextString += `- ${a.name} (Origin: ${a.originEra}, Power: ${a.powerLevel}/10): ${a.description}\n`;
    });
  }

  contextString += `\nUser State:\n`;
  contextString += `- Inventory: ${userState.inventory.length > 0 ? userState.inventory.join(', ') : 'Empty'}\n`;
  
  const choicesKeys = Object.keys(userState.choices);
  if (choicesKeys.length > 0) {
    contextString += `- Previous Choices:\n`;
    choicesKeys.forEach((key) => {
      contextString += `  * ${key}: ${userState.choices[key]}\n`;
    });
  }
  
  contextString += `\n[END CANON ENFORCEMENT]\n`;
  contextString += `You must strictly adhere to these facts. Do not invent new factions, change historical dates, or resurrect dead characters.\n\n`;

  return contextString;
}

/**
 * Wrapper utility for validating LLM responses against the strict Zod schema.
 */
export function validateAIResponse(rawJsonString: string): AIResponse {
  try {
    const parsedData = JSON.parse(rawJsonString);
    // This will throw a ZodError if the data violates the schema (e.g., invalid faction, wrong types)
    const validatedData = AIResponseSchema.parse(parsedData);
    return validatedData;
  } catch (error) {
    console.error('AI Response Validation Failed:', error);
    throw new Error('The AI generated a response that violates the canon schema or is malformed JSON.');
  }
}
