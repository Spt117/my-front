import { useEffect } from "react";

type Callback = () => void;

const useKeyboardShortcuts = (key: string, callback: Callback) => {
    useEffect(() => {
        const handleClickOutside = (event: KeyboardEvent) => {
            if (event.key === key) {
                callback();
            }
        };
        // Ajoute un listener pour `keydown`
        document.addEventListener("keydown", handleClickOutside);

        // Nettoie l'événement lors du démontage
        return () => {
            document.removeEventListener("keydown", handleClickOutside);
        };
    }, [callback, key]);
};

export default useKeyboardShortcuts;
