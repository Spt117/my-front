import { useState } from "react";
import { setUserWithNextAuth } from "../models/user/middlewareUser";
import useUserStore from "../stores/UserStore";
import { Language, languages } from "../models/user/userType";

export const useGetUser = () => {
    const [loading, setLoading] = useState(false);
    const { setUser } = useUserStore();

    const getUser = async () => {
        setLoading(true);
        try {
            const browserLanguages = navigator.languages || [];
            let langue: Language = "en";
            for (const browserLang of browserLanguages) {
                // Extraire le code de langue principal (ex: "fr-FR" -> "fr")
                const langCode = browserLang.split("-")[0];

                // Vérifier si ce code de langue est dans notre liste de langues supportées
                if (languages.includes(langCode as any)) {
                    langue = langCode as Language;
                    break;
                }
            }
            const dataUser = await setUserWithNextAuth(langue);
            setUser(dataUser);
        } catch (error: any) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return {
        getUser,
        loading,
    };
};
