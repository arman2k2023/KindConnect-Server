import type { ObjectId } from "mongodb";

export interface CreateEventInput {
    title: string;
    description: string;
    date: string;
    location: string;
    category: string;
    imageUrl?: string;
}

export interface EventDocument extends CreateEventInput {
    _id?: ObjectId;
    organizerId: string;
    participants: string[];
    createdAt: Date;
    updatedAt: Date;
}