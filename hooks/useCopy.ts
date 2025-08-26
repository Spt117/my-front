import useNotificationStore from "@/library/stores/NotificationStore";

export const useCopy = () => {
    const { addMessage } = useNotificationStore();

    const handleCopy = async (value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            addMessage("Copied to clipboard");
        } catch (err) {
            console.error(err);
        }
    };

    return {
        handleCopy,
    };
};
