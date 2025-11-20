import { getMongoConnectionManager } from "@/library/auth/connector";
import { TPublicDomainsShopify } from "@/params/paramsShopify";
import { TDomainWordpress } from "@/params/paramsWordpress";
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
            const dataError = await model.find({ status: "error" }).sort({ createdAt: -1 }).exec();
            return JSON.parse(JSON.stringify(data.concat(dataError)));
        } catch (err) {
            console.error("Error in getAllPending:", err);
            return [];
        }
    }

    async updateStatus(asin: string, website: string, status: "pending" | "done" | "error"): Promise<boolean> {
        try {
            const model = await this.getModel();
            const result = await model.updateMany({ asin, website }, { status }).exec();
            return result !== null;
        } catch (err) {
            console.error("Error in updateStatus:", err);
            return false;
        }
    }

    async archiveTask(asin: string, website: TDomainWordpress | TPublicDomainsShopify) {
        console.log("Archiving task for ASIN:", asin, "on website:", website);

        const model = await this.getModel();
        const res = await model.updateMany({ asin, website }, { status: "done" });
        console.log("Archive result:", res);
        return res;
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
