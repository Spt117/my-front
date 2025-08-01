"use server";

import { getServerSession } from "next-auth";
import { controllerUser } from "../models/user/userController";
import { authOptions } from "./authOption";

export async function getUserFromHeader() {
    try {
        const session = await getServerSession(authOptions);
        if (session && session.user && session.user.email) {
            const user = await controllerUser.getUserFromMail(session.user.email);
            if (!user) return null;
            return user;
        } else {
            return null;
        }
    } catch (error: any) {
        console.error("Error in getUserFromHeader:", error.message);
        return null;
    }
}
