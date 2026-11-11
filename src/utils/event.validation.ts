import { z } from "zod";

export const createEventSchema = z.object({
    title: z
        .string()
        .trim()
        .min(5, "Title must be at least 5 characters"),

    description: z
        .string()
        .trim()
        .min(20, "Description must be at least 20 characters"),

    date: z
        .string()
        .refine((value) => {
            const eventDate = new Date(value);

            return (
                !Number.isNaN(eventDate.getTime()) &&
                eventDate.getTime() > Date.now()
            );
        }, "Event date must be in the future"),

    location: z
        .string()
        .trim()
        .min(3, "Location must be at least 3 characters"),

    category: z
        .string()
        .trim()
        .min(2, "Category is required"),

    imageUrl: z
        .string()
        .url("Please provide a valid image URL")
        .optional()
        .or(z.literal("")),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;