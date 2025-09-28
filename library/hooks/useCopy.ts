import { toast } from "sonner";

export const useCopy = () => {
    const handleCopy = async (value: string, msg?: string) => {
        try {
            await navigator.clipboard.writeText(value);
            const message = msg || `${value} copié !`;
            toast.success(message, {
                duration: 2000,
                className: "toast-centered",
                style: {
                    textAlign: "center",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "fit-content",
                },
            });
        } catch (err) {
            console.error(err);
        }
    };

    return {
        handleCopy,
    };
};
