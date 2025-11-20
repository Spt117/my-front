import { toast } from "sonner";

export const useCopy = () => {
    const handleCopy = async (value: string, msg?: string, error?: boolean) => {
        try {
            await navigator.clipboard.writeText(value);
            const message = msg || `${value} copié !`;
            if (error) {
                toast.error("Erreur lors de la copie", {
                    style: {
                        textAlign: "center",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "fit-content",
                    },
                });
                return;
            }
            toast.success(message, {
                duration: 2000,
                style: {
                    textAlign: "center",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "fit-content",
                },
            });
        } catch (err) {
            toast.error("Erreur lors de la copie", {
                duration: 2000,
                style: {
                    textAlign: "center",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "fit-content",
                },
            });
            console.error(err);
        }
    };

    return {
        handleCopy,
    };
};
