"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/authOption";
import { getUserFromHeader } from "../../auth/secureServer";
import { controllerUser } from "./userController";
import { IUserProfile, Language, TParamUpdateUser, TUser } from "./userType";

/**
 * Retrieves a user from the database by email address
 * @param address - The email address to search for
 * @returns Promise resolving to the user object or null if not found
 * @throws Error if email address is invalid or database query fails
 */
export async function getUserFromMail(address: string): Promise<TUser | null> {
    if (!address?.trim()) {
        throw new Error("Email address is required");
    }

    try {
        return await controllerUser.getUserFromMail(address);
    } catch (error) {
        console.error(`Error fetching user by email: ${address}`, error);
        throw new Error("Failed to fetch user by email");
    }
}

/**
 * Retrieves a user from the database by affiliation code
 * @param code - The affiliation code to search for
 * @returns Promise resolving to the user object or null if not found
 * @throws Error if affiliation code is invalid or database query fails
 */
export async function getUserByAffiliationCode(code: string): Promise<TUser | null> {
    if (!code?.trim()) {
        throw new Error("Affiliation code is required");
    }

    try {
        return await controllerUser.getUserByAffiliationCode(code);
    } catch (error) {
        console.error(`Error fetching user by affiliation code: ${code}`, error);
        throw new Error("Failed to fetch user by affiliation code");
    }
}

/**
 * Retrieves a user from the database by user ID
 * @param id - The user ID to search for
 * @returns Promise resolving to the user object or null if not found
 * @throws Error if user ID is invalid or database query fails
 */
export async function getUserById(id: string): Promise<TUser | null> {
    if (!id?.trim()) {
        throw new Error("User ID is required");
    }

    try {
        return await controllerUser.getUserById(id);
    } catch (error) {
        console.error(`Error fetching user by ID: ${id}`, error);
        throw new Error("Failed to fetch user by ID");
    }
}

/**
 * Retrieves a user's pseudonym from the database by user ID
 * @param id - The user ID to search for
 * @returns Promise resolving to the user's pseudonym or "Incognito" if not found or error occurs
 */
export async function getUserPseudoFromId(id: string): Promise<string> {
    if (!id?.trim()) {
        return "Incognito";
    }

    try {
        const user = await controllerUser.getUserPseudoFromId(id);
        return user ?? "Incognito";
    } catch (error) {
        console.error(`Error fetching user pseudo by ID: ${id}`, error);
        return "Incognito";
    }
}

/**
 * Creates a new user object with default settings
 * @param email - The user's email address
 * @param language - The user's preferred language
 * @returns A new user object with default values
 * @throws Error if email is invalid
 */
const createNewUser = (email: string, language: Language): TUser => {
    if (!email?.trim()) {
        throw new Error("Email is required to create a new user");
    }

    return {
        role: "user",
        email: email.toLowerCase().trim(),
        timestampcreatedAt: Date.now(),
        profile: {
            fullName: "",
            avatarUrl: "",
            lastName: "",
            firstName: "",
        },
        settings: {
            language: language || "fr", // Valeur par défaut
            marketing: {
                telegram: true,
                email: true,
            },
        },
    };
};

/**
 * Creates or retrieves a user using NextAuth session data
 * @param language - The user's preferred language
 * @returns Promise resolving to the user object or null if session is invalid
 * @throws Error if user creation fails or database operations fail
 */
export async function setUserWithNextAuth(language: Language): Promise<TUser | null> {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            console.log("Invalid session: no user email found");
            return null;
        }

        const existingUser = await getUserFromMail(session.user.email);
        if (existingUser) {
            console.log("Existing user found");
            return existingUser;
        }

        // Créer un nouvel utilisateur
        const newUserData = createNewUser(session.user.email, language);
        newUserData.profile.fullName = session.user.name?.trim() || "";

        await controllerUser.addUser(newUserData);
        const createdUser = await getUserFromMail(session.user.email);

        if (!createdUser) {
            throw new Error("Failed to create user");
        }

        console.log("New user created successfully");
        return createdUser;
    } catch (error) {
        console.error("Error in setUserWithNextAuth:", error);
        throw new Error("Failed to set user with NextAuth");
    }
}

/**
 * Updates user data with security validation
 * @param param - The update parameters containing user email and data to update
 * @throws Error if user is not authenticated, unauthorized, or update fails
 */
export async function updateUser(param: TParamUpdateUser): Promise<void> {
    if (!param?.user?.trim()) {
        throw new Error("User parameter is required");
    }

    try {
        const currentUser = await getUserFromHeader();
        if (!currentUser) {
            throw new Error("User not authenticated");
        }

        if (param.user !== currentUser.email) {
            throw new Error("Unauthorized: cannot update another user's data");
        }

        await controllerUser.updateUser(param);
    } catch (error) {
        console.error("Error updating user:", error);
        throw new Error("Failed to update user");
    }
}

/**
 * Updates the profile information for the authenticated user
 * @param userProfile - The profile data to update
 * @throws Error if user is not authenticated or profile update fails
 */
export async function updateUserProfile(userProfile: IUserProfile): Promise<void> {
    if (!userProfile) {
        throw new Error("User profile data is required");
    }

    try {
        const currentUser = await getUserFromHeader();
        if (!currentUser?._id) {
            throw new Error("User not authenticated or missing ID");
        }

        const updatedProfile = { ...currentUser.profile, ...userProfile };
        await controllerUser.updateUserProfile(currentUser._id, updatedProfile);
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw new Error("Failed to update user profile");
    }
}

/**
 * Updates marketing preferences for the authenticated user
 * @param prop - The marketing property to update (e.g., 'email', 'telegram')
 * @param value - The boolean value to set for the marketing preference
 * @throws Error if user is not authenticated, parameters are invalid, or update fails
 */
export async function updateMarketingUser(prop: string, value: boolean): Promise<void> {
    if (!prop?.trim()) {
        throw new Error("Marketing property is required");
    }
    if (typeof value !== "boolean") {
        throw new Error("Marketing value must be a boolean");
    }

    try {
        const currentUser = await getUserFromHeader();
        if (!currentUser?._id) {
            throw new Error("User not authenticated or missing ID");
        }

        await controllerUser.updateMarketing(currentUser._id, prop, value);
    } catch (error) {
        console.error("Error updating user marketing preferences:", error);
        throw new Error("Failed to update marketing preferences");
    }
}

/**
 * Deletes a user account (admin only operation)
 * @param email - The email address of the user to delete
 * @throws Error if user is not authenticated, not an admin, or deletion fails
 */
export async function deleteAUser(email: string): Promise<void> {
    if (!email?.trim()) {
        throw new Error("Email is required");
    }

    try {
        const currentUser = await getUserFromHeader();
        if (!currentUser) {
            throw new Error("User not authenticated");
        }

        if (currentUser.role !== "admin") {
            throw new Error("Unauthorized: admin role required");
        }

        await controllerUser.deleteUser(email);
    } catch (error) {
        console.error(`Error deleting user: ${email}`, error);
        throw new Error("Failed to delete user");
    }
}
