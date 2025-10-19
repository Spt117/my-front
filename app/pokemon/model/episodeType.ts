import { Schema } from "mongoose";

export type TEpisode = {
    title: string;
    episodeNumber: number;
    seasonNumber: number;
    seasonTitle?: string;
    id: string;
};

export const EpisodeSchema = new Schema<TEpisode>(
    {
        title: { type: String, required: true },
        episodeNumber: { type: Number, required: true },
        seasonNumber: { type: Number, required: true },
        seasonTitle: { type: String, required: false },
        id: { type: String, required: true, unique: true },
    },
    {
        versionKey: false,
        timestamps: true,
        _id: false,
    }
);
