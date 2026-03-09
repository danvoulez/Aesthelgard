import { z } from 'zod';

// Enums and Invariants
export const FactionEnum = z.enum(['Cloud-Catchers', 'Silt-Dwellers', 'Guardians of Flow']);
export type Faction = z.infer<typeof FactionEnum>;

export const EraEnum = z.enum(['Before the Fall', 'The 250-Year Peace', 'The Shattering']);
export type Era = z.infer<typeof EraEnum>;

export const ProductTypeEnum = z.enum(['PHYSICAL_MERCH', 'DIGITAL_ASSET', 'EXTRA_CONTENT', 'LIVE_EVENT']);
export type ProductType = z.infer<typeof ProductTypeEnum>;

// Base Entities
export const TimelineBoundarySchema = z.object({
  startYear: z.number(),
  endYear: z.number().nullable(), // null means present/ongoing
});

export const LocationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  controllingFaction: FactionEnum.nullable(),
});
export type Location = z.infer<typeof LocationSchema>;

export const CharacterSchema = z.object({
  id: z.string(),
  name: z.string(),
  faction: FactionEnum,
  timelineBoundary: TimelineBoundarySchema,
  isAlive: z.boolean(),
  description: z.string(),
});
export type Character = z.infer<typeof CharacterSchema>;

export const ArtifactSchema = z.object({
  id: z.string(),
  name: z.string(),
  originEra: EraEnum,
  currentLocationId: z.string().nullable(),
  powerLevel: z.number().min(1).max(10),
  description: z.string(),
});
export type Artifact = z.infer<typeof ArtifactSchema>;

export const HistoricalEventSchema = z.object({
  id: z.string(),
  name: z.string(),
  date: z.number(), // Year
  era: EraEnum,
  locationId: z.string(),
  involvedFactions: z.array(FactionEnum),
  description: z.string(),
});
export type HistoricalEvent = z.infer<typeof HistoricalEventSchema>;

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: ProductTypeEnum,
  price: z.number(),
  imageUrl: z.string(),
  loreDescription: z.string(),
  realWorldDescription: z.string(),
  unlocksArtifactId: z.string().optional(), // For DIGITAL_ASSET or EXTRA_CONTENT
});
export type Product = z.infer<typeof ProductSchema>;

export const SessionTypeEnum = z.enum(['work', 'assist', 'deliberate', 'research']);
export type SessionType = z.infer<typeof SessionTypeEnum>;

// AI Response Validator Schema
export const AIResponseSchema = z.object({
  narrativeText: z.string(),
  handover_note: z.string().describe("A summary, open threads, and observations for the next LLM instance. Keep it concise."),
  updatedStateVariables: z.object({
    // Example state variables that the AI is allowed to modify
    discoveredArtifacts: z.array(z.string()).optional(),
    playerReputation: z.record(FactionEnum, z.number().min(-100).max(100)).optional(),
    // The AI cannot modify core canon facts (like the duration of the 250-Year Peace)
    // because they are not included in this mutable state schema.
  }).optional(),
});
export type AIResponse = z.infer<typeof AIResponseSchema>;
