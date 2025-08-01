import mongoose, { Model } from "mongoose";
import { UserData } from "./userModel";
import { IUserProfile, TParamUpdateUser, TUser } from "./userType";
import { getMongoConnectionManager } from "@/library/auth/connector";

/**
 * Contrôleur de gestion des utilisateurs.
 * Fournit des méthodes pour créer, récupérer, mettre à jour et supprimer des utilisateurs dans la base MongoDB.
 */
class ControllerUser {
    /**
     * Récupère le modèle Mongoose de l'utilisateur.
     */
    private async getUserModel(): Promise<Model<TUser>> {
        const manager = await getMongoConnectionManager();
        const connection = await manager.getConnection("users");
        return connection.model<TUser>("userData", UserData.schema);
    }

    /**
     * Ajoute un nouvel utilisateur à la base.
     * @param user - Données de l'utilisateur.
     */
    async addUser(user: TUser): Promise<TUser | null> {
        const UsersModel = await this.getUserModel();
        try {
            const newUser = new UsersModel(user);
            return (await newUser.save()).toObject();
        } catch (error) {
            console.error("Erreur addUser:", error);
            return null;
        }
    }

    /**
     * Récupère un utilisateur par email.
     * @param email - Email de l'utilisateur.
     */
    async getUserFromMail(email: string): Promise<TUser | null> {
        const UsersModel = await this.getUserModel();
        try {
            const user = await UsersModel.findOne({ email }).lean();
            return user ?? null;
        } catch {
            return null;
        }
    }

    /**
     * Met à jour une propriété spécifique d'un utilisateur par son email.
     * @param param - Paramètres de mise à jour.
     */
    async updateUser(param: TParamUpdateUser): Promise<void> {
        const UsersModel = await this.getUserModel();
        try {
            await UsersModel.updateOne({ email: param.user }, { [param.prop]: param.value });
        } catch (e) {
            console.error("Erreur updateUser:", e);
        }
    }

    /**
     * Met à jour le profil utilisateur (champ `profile` complet).
     * @param id - ID MongoDB de l'utilisateur.
     * @param profile - Données de profil à mettre à jour.
     */
    async updateUserProfile(id: string, profile: Partial<IUserProfile>): Promise<void> {
        const UsersModel = await this.getUserModel();
        try {
            await UsersModel.updateOne({ _id: new mongoose.Types.ObjectId(id) }, { profile });
        } catch (e) {
            console.error("Erreur updateUserProfile:", e);
        }
    }

    /**
     * Récupère le pseudo de l'utilisateur depuis son ID.
     * @param id - ID MongoDB.
     */
    async getUserPseudoFromId(id: string): Promise<string | null> {
        const UsersModel = await this.getUserModel();
        try {
            const user = await UsersModel.findById(id).lean();
            return user?.profile?.pseudo ?? null;
        } catch {
            return null;
        }
    }

    /**
     * Liste tous les utilisateurs.
     */
    async getUsers(): Promise<TUser[]> {
        const UsersModel = await this.getUserModel();
        try {
            return await UsersModel.find().select("-_id -__v").lean();
        } catch {
            return [];
        }
    }

    /**
     * Récupère un utilisateur via son ID Telegram.
     * @param id - ID utilisateur Telegram.
     */
    async getUserByTelegramId(id: string): Promise<TUser | null> {
        const UsersModel = await this.getUserModel();
        try {
            return await UsersModel.findOne({ "profile.telegramUserId": id }).select("-_id -__v").lean();
        } catch (e) {
            console.error("Erreur getUserByTelegramId:", e);
            return null;
        }
    }

    /**
     * Supprime un utilisateur via son email.
     * @param address - Email.
     */
    async deleteUser(address: string): Promise<void> {
        const UsersModel = await this.getUserModel();
        try {
            await UsersModel.deleteOne({ email: address });
        } catch (e) {
            console.error("Erreur deleteUser:", e);
        }
    }

    /**
     * Récupère un utilisateur via un code d'affiliation.
     */
    async getUserByAffiliationCode(code: string): Promise<TUser | null> {
        const UsersModel = await this.getUserModel();
        try {
            return await UsersModel.findOne({ "affiliate.code": code }).lean();
        } catch {
            return null;
        }
    }

    /**
     * Recherche des utilisateurs par nom, email, Telegram, Stripe.
     */
    async searchUsers(search: string): Promise<TUser[]> {
        const Model = await this.getUserModel();
        try {
            return await Model.find({
                $or: [{ "profile.fullName": { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }, { "profile.telegramUsername": { $regex: search, $options: "i" } }, { stripeCustomerId: { $regex: search, $options: "i" } }],
            })
                .select("-__v")
                .lean();
        } catch {
            return [];
        }
    }

    /**
     * Récupère un utilisateur via son ID MongoDB.
     */
    async getUserById(id: string): Promise<TUser | null> {
        const UsersModel = await this.getUserModel();
        try {
            return await UsersModel.findById(id).select("-__v").lean();
        } catch {
            return null;
        }
    }

    /**
     * Met à jour une propriété simple de l'utilisateur (hors sous-document).
     */
    async updateProfileUser(email: string, prop: string, value: string): Promise<void> {
        const UsersModel = await this.getUserModel();
        try {
            await UsersModel.updateOne({ email }, { [prop]: value });
        } catch (e) {
            console.error("Erreur updateProfileUser:", e);
        }
    }

    /**
     * Met à jour une préférence marketing dans les paramètres utilisateur.
     */
    async updateMarketing(id: string, prop: string, value: boolean): Promise<void> {
        const UsersModel = await this.getUserModel();
        try {
            await UsersModel.updateOne({ _id: id }, { [`settings.marketing.${prop}`]: value });
        } catch (e) {
            console.error("Erreur updateMarketing:", e);
        }
    }

    /** Singleton */
    static instance = new ControllerUser();
}

export const controllerUser = ControllerUser.instance;
