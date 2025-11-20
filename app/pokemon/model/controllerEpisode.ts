import { getMongoConnectionManager } from "@/library/auth/connector";
import { EpisodeSchema, TEpisode } from "./episodeType";
import { Model } from "mongoose";

class ControllerEpisode {
    serie: string;

    constructor(serie: string) {
        this.serie = serie;
    }

    /**
     * Récupère le modèle Mongoose de l'épisode.
     */
    private async getEpisodeModel(): Promise<Model<TEpisode>> {
        const manager = await getMongoConnectionManager();
        const connection = await manager.getConnection("Pokemon");

        const modelName = "episode";
        const collectionName = `${this.serie}_episodes`;

        const existingModel = connection.models[modelName];
        if (existingModel) return existingModel;

        const episodeModel = connection.model(modelName, EpisodeSchema, collectionName);
        return episodeModel;
    }

    async addEpisode(episodeData: TEpisode): Promise<Boolean> {
        try {
            const Episode = await this.getEpisodeModel();
            const newEpisode = new Episode(episodeData);
            const savedEpisode = await newEpisode.save();
            return savedEpisode ? true : false;
        } catch (err) {
            console.error("addEpisode error:", err);
            return false;
        }
    }

    async getEpisodes(): Promise<TEpisode[]> {
        try {
            const Episode = await this.getEpisodeModel();
            const episodes = await Episode.find().lean<TEpisode>();
            return JSON.parse(JSON.stringify(episodes)) as TEpisode[];
        } catch (err) {
            console.error("getEpisodes error:", err);
            return [];
        }
    }
}
