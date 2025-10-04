import { useEffect, useRef } from "react";

type Callback = () => void;

interface ShortcutConfig {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
}

const useKeyboardShortcuts = (shortcut: string | ShortcutConfig, callback: Callback) => {
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Si c'est une string simple
            if (typeof shortcut === "string") {
                if (event.key === shortcut) {
                    event.preventDefault();
                    callbackRef.current();
                }
                return;
            }

            // Si c'est un objet de configuration
            const { key, ctrl, shift, alt, meta } = shortcut;

            const isCtrlMatch = ctrl ? event.ctrlKey : !event.ctrlKey;
            const isShiftMatch = shift ? event.shiftKey : !event.shiftKey;
            const isAltMatch = alt ? event.altKey : !event.altKey;
            const isMetaMatch = meta ? event.metaKey : !event.metaKey;

            if (event.key === key && isCtrlMatch && isShiftMatch && isAltMatch && isMetaMatch) {
                event.preventDefault();
                callbackRef.current();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [shortcut]);
};

export default useKeyboardShortcuts;
