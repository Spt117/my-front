import { toast } from "sonner";

export const useCopy = () => {
    const handleCopy = async (value: string) => {
        try {
            await navigator.clipboard.writeText(value);
            toast.success("Copied to clipboard");
        } catch (err) {
            console.error(err);
        }
    };

    return {
        handleCopy,
    };
};
