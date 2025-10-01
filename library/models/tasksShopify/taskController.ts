import { Model } from "mongoose";
import { TaskSchema, TStatusTask, TTaskShopifyProducts } from "./taskType";
import { getMongoConnectionManager } from "@/library/auth/connector";

class ControllerTaskShopify {
    private async getTaskModel(): Promise<Model<TTaskShopifyProducts>> {
        const manager = await getMongoConnectionManager();
        const connection = await manager.getConnection("Shopify");

        const modelName = "TaskShopify";
        const collectionName = "tasksShopifyProducts";

        const existingModel = connection.models[modelName];
        if (existingModel) return existingModel as Model<TTaskShopifyProducts>;

        const taskModel = connection.model<TTaskShopifyProducts>(modelName, TaskSchema, collectionName);
        return taskModel;
    }

    async createTask(payload: TTaskShopifyProducts): Promise<TTaskShopifyProducts | null> {
        try {
            const Task = await this.getTaskModel();
            const doc = await Task.create(payload);
            return doc as TTaskShopifyProducts;
        } catch (err) {
            console.error("createTask error:", err);
            return null;
        }
    }

    async updateTaskStatus(id: string, status: TStatusTask): Promise<Boolean> {
        try {
            const Task = await this.getTaskModel();
            const doc = await Task.findByIdAndUpdate(id, { $set: { status: status } }, { new: true });
            return doc ? true : false;
        } catch (err) {
            console.error("updateTaskStatus error:", err);
            return false;
        }
    }

    async getPendingTasks(): Promise<TTaskShopifyProducts[]> {
        try {
            const Task = await this.getTaskModel();
            const docs = await Task.find({ status: "scheduled" }).lean<TTaskShopifyProducts[]>();
            return docs;
        } catch (err) {
            console.error("getPendingTasks error:", err);
            return [];
        }
    }

    async getTaskBySkuAndStockActivation(sku: string): Promise<TTaskShopifyProducts | null> {
        try {
            const Task = await this.getTaskModel();
            const doc = await Task.findOne({ sku, activation: "stock", status: "scheduled" }).lean<TTaskShopifyProducts>();
            return doc;
        } catch (err) {
            console.error("getTaskBySkuAndStockActivation error:", err);
            return null;
        }
    }

    async getTaskNextMinute(): Promise<TTaskShopifyProducts[]> {
        const TaskModel = await this.getTaskModel();
        try {
            const nextMinute = (Date.now() + 60 * 1000) / 1000;
            const tasks = await TaskModel.find({
                activation: "timestamp",
                status: "scheduled",
                timestampActivation: { $lt: nextMinute },
            }).lean<TTaskShopifyProducts[]>();
            return tasks;
        } catch (e) {
            console.error("Error getting tasks. ControllerTaskShopify ", e);
            return [];
        }
    }
}

export const TaskShopifyController = new ControllerTaskShopify();
