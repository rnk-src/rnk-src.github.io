import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
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
      // A simulation that runs in the page. The poster and a play button show first. The
      // simulation loads into an iframe only after a click. src is a built static site
      // under public/, made by scripts/sync-mortar-demo.sh. It wins over image, not youtube.
      sim: z
        .object({
          src: z.string().startsWith('/demos/'),
          poster: image(),
          alt: z.string().min(1),
          // Download size shown on the button, e.g. "about 9 MB".
          size: z.string().optional(),
        })
        .optional(),
      // Demo image shown in the media frame. A second image makes a labelled pair.
      // Alt text is required. The YouTube demo wins if both are set.
      image: z
        .object({
          src: image(),
          alt: z.string().min(1),
          label: z.string().optional(),
          // pair: show both side by side. toggle: show one, with buttons to switch.
          mode: z.enum(['pair', 'toggle']).default('pair'),
          // after: makes a before/after slider. src is the before image.
          after: z.object({ src: image(), alt: z.string().min(1) }).optional(),
          second: z
            .object({
              src: image(),
              alt: z.string().min(1),
              label: z.string().optional(),
              after: z
                .object({ src: image(), alt: z.string().min(1) })
                .optional(),
            })
            .optional(),
        })
        .optional(),
    }),
});

export const collections = { projects };
