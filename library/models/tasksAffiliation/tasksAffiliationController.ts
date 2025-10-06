import { getMongoConnectionManager } from "@/library/auth/connector";
import { Connection, Model } from "mongoose";
import { createAffiliationTaskSchema, TAffiliationTask } from "./tasksAffiliation";

class CTasksAffiliationController {
    private async getModel(): Promise<Model<TAffiliationTask>> {
        const manager = await getMongoConnectionManager();
        const connection: Connection = await manager.getConnection("Pokemon");
        const collectionName = "tasks_affiliation";
        if (connection.models[collectionName]) return connection.models[collectionName];
        const schema = createAffiliationTaskSchema(collectionName);
        return connection.model<TAffiliationTask>(collectionName, schema);
    }

    async create(data: TAffiliationTask): Promise<TAffiliationTask | null> {
        const model = await this.getModel();
        const newTask = new model(data);
        return newTask.save();
    }

    async getAllPending(): Promise<TAffiliationTask[]> {
        try {
            const model = await this.getModel();
            const data = await model.find({ status: "pending" }).sort({ createdAt: -1 }).exec();
            return JSON.parse(JSON.stringify(data));
        } catch (err) {
            console.error("Error in getAllPending:", err);
            return [];
        }
    }

    static instance: CTasksAffiliationController;

    public static getInstance(): CTasksAffiliationController {
        if (!CTasksAffiliationController.instance) {
            CTasksAffiliationController.instance = new CTasksAffiliationController();
        }
        return CTasksAffiliationController.instance;
    }
}

export const tasksAffiliationController = CTasksAffiliationController.getInstance();
