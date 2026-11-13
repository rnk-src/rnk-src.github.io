import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    role: z.string().optional(),
    tags: z.array(z.string()).min(1),
    dates: z.string(),
    order: z.number(),
    // GitHub repo URL. Leave out until the repo is public.
    repo: z.string().url().optional(),
    // YouTube video ID of a demo. Leave out to show the "Demo coming soon" placeholder.
    youtube: z
      .string()
      .regex(/^[\w-]{11}$/)
      .optional(),
  }),
});

export const collections = { projects };
