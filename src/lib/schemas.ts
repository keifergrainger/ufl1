import { z } from 'zod';

export const playerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    bio: z.string().optional(),
    stats: z.record(z.string(), z.any()).optional(), // JSONB, can refine later
    image_url: z.string().url().optional().or(z.literal('')),
    number: z.string().optional(),
    position: z.string().optional(),
    height: z.string().optional(),
    weight: z.string().optional(),
    college: z.string().optional(),
    hometown: z.string().optional(),
    age_info: z.string().optional(),
});

export const homeContentSchema = z.object({
    hero: z.object({
        title: z.string().min(1),
        highlight: z.string().min(1),
        subtitle: z.string().min(1),
    }),
    stats: z.object({
        record: z.string(),
        championships: z.union([z.string(), z.number()]),
        capacity: z.union([z.string(), z.number()]),
    }),
    news: z.array(z.object({
        id: z.string().optional(),
        title: z.string().min(1),
        category: z.string(),
    })).optional(),
});

export const leagueSchema = z.object({
    name: z.string().min(3, "League name must be at least 3 characters").max(50),
    teamName: z.string().min(3, "Team name must be at least 3 characters").max(30),
    teams: z.coerce.number().min(4).max(32),
    visibility: z.enum(['public', 'private']),
    customCode: z.string().length(6).regex(/^[A-Z0-9]+$/, "Code must be alphanumeric").optional().or(z.literal('')),
});

export const joinLeagueSchema = z.object({
    code: z.string().length(6),
    teamName: z.string().min(1, "Team Name is required"),
});

export const subscriptionSchema = z.object({
    email: z.string().email("Invalid email address"),
    source: z.string().optional(),
});

export const updateLeagueSchema = z.object({
    name: z.string().min(3).max(50),
    visibility: z.enum(['public', 'private']),
});
