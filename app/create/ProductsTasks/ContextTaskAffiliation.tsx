import { TAffiliationTask } from "@/library/models/tasksAffiliation/tasksAffiliation";
import { createContext, ReactNode, useContext, useState } from "react";
import { ICreateAffiliationProduct } from "../util";
import { createProduct } from "../serverTasksAffiliation";
import { toast } from "sonner";
import { pokemonProducts } from "@/library/params/paramsCreateAffiliation";

interface AffiliationTaskContextType {
    task: TAffiliationTask;
    productType: string;
    setProductType: (type: string) => void;
    size: number | null;
    setSize: (size: number | null) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
    handleCreateProduct: () => Promise<void>;
    namePokemon: string;
    setNamePokemon: (name: string) => void;
    disabledPush: boolean;
}

const AffiliationTaskContext = createContext<AffiliationTaskContextType | undefined>(undefined);

export function AffiliationTaskProvider({ children, task }: { children: ReactNode; task: TAffiliationTask }) {
    const [loading, setLoading] = useState(false);
    const [productType, setProductType] = useState<string>(task.productType || "");
    const [size, setSize] = useState<number | null>(null);
    const [namePokemon, setNamePokemon] = useState<string>("");

    const disabledPush = !productType || (productType === "peluche pokémon" && (!size || !namePokemon));

    const handleCreateProduct = async () => {
        if (!productType) {
            alert("Veuillez sélectionner un type de produit.");
            return;
        }
        if (pokemonProducts.includes(productType as any) === false) {
            alert("Type de produit non valide.");
            return;
        }
        setLoading(true);
        const data: ICreateAffiliationProduct<any> = {
            idTask: task._id!,
            website: task.website,
            marketplace: task.marketplace,
            product: productType,
            asin: task.asin,
            data: productType === "peluche pokémon" ? { size, namePokemon } : {},
        };
        try {
            const res = await createProduct([data]);
            if (res.error) toast.error(res.error);
            if (res.message) toast.success(res.message);
        } catch (error) {
            console.error("Error creating product:", error);
            toast.error("Erreur lors de la création du produit");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AffiliationTaskContext.Provider
            value={{
                task,
                productType,
                setProductType,
                size,
                setSize,
                loading,
                disabledPush,
                namePokemon,
                setNamePokemon,
                setLoading,
                handleCreateProduct,
            }}
        >
            {children}
        </AffiliationTaskContext.Provider>
    );
}

export function useAffiliationTask() {
    const context = useContext(AffiliationTaskContext);
    if (!context) {
        throw new Error("useAffiliationTask doit être utilisé dans AffiliationTaskProvider");
    }
    return context;
}
