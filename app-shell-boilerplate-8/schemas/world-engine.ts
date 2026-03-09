import { z } from 'zod';

export const NavigationPillarSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.string(),
});

export const WorldCartridgeSchema = z.object({
  world_id: z.string(),
  meta: z.object({
    title: z.string(),
    version: z.string(),
    description: z.string(),
  }),
  theme: z.object({
    css_variables: z.record(z.string(), z.string()),
    typography: z.object({
      headings: z.string(),
      body: z.string(),
    }),
  }),
  ai_invariants: z.object({
    system_prompt: z.string(),
    hard_boundaries: z.array(z.string()),
  }),
  navigation_pillars: z.array(NavigationPillarSchema),
  onboarding_hook: z.object({
    media_type: z.string(),
    content: z.string(),
    starting_inventory: z.array(z.string()),
  }),
});

export type WorldCartridge = z.infer<typeof WorldCartridgeSchema>;
export type NavigationPillar = z.infer<typeof NavigationPillarSchema>;
