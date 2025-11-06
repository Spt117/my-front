import { TAffiliationTask } from "@/library/models/tasksAffiliation/tasksAffiliation";
import { pokemonProducts, TPokemonProducts } from "@/params/paramsCreateAffiliation";
import { boutiqueFromPublicDomain, TPublicDomainsShopify } from "@/params/paramsShopify";
import { useRouter } from "next/navigation";
import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "sonner";
import { createProductTask } from "../serverTasksAffiliation";
import { ICreateAffiliationProduct } from "../util";

interface AffiliationTaskContextType {
    task: TAffiliationTask;
    productType: TPokemonProducts;
    setProductType: (type: TPokemonProducts) => void;
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
    const router = useRouter();
    const [productType, setProductType] = useState<TPokemonProducts>(task.productType);
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
            asin: task.asin.trim(),
            data: productType === "peluche pokémon" ? { size, namePokemon: namePokemon.trim() } : {},
        };
        try {
            const res = await createProductTask(data);
            if (res.error) toast.error(res.error);
            if (res.message) toast.success(res.message);
            const id = res.response;
            if (id) {
                const boutique = boutiqueFromPublicDomain(task.website as TPublicDomainsShopify);
                const url = `/shopify/${boutique.id}/products/${id.replace("gid://shopify/Product/", "")}`;
                window.open(url, "_blank");
                router.refresh();
            } else toast.error("Erreur lors de la création du produit: ID manquant");
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
