import { Button } from "@/components/ui/button";
import { CardAction } from "@/components/ui/card";
import { pokemonProducts } from "@/params/paramsCreateAffiliation";
import { boutiqueFromPublicDomain, TPublicDomainsShopify } from "@/params/paramsShopify";
import router from "next/router";
import { useState } from "react";
import { toast } from "sonner";
import { createProductTask } from "../serverTasksAffiliation";
import useAffiliationStore from "../storeTasksAffiliation";
import { ICreateAffiliationProduct } from "../util";
import useCreateStore from "./storeCreate";

export default function AddProduct() {
    const { selectedNiche, selectedProduct, payloadPeluche, asin } = useCreateStore();
    const { websiteFilter } = useAffiliationStore();
    const [loading, setLoading] = useState(false);
    if (!selectedNiche || !selectedProduct) return null;

    const disableAdd = selectedProduct === "peluche pokémon" && (!payloadPeluche.namePokemon || !payloadPeluche.size || !asin);

    const handleCreateProduct = async () => {
        if (!selectedProduct) {
            alert("Veuillez sélectionner un type de produit.");
            return;
        }
        if (pokemonProducts.includes(selectedProduct as any) === false) {
            alert("Type de produit non valide.");
            return;
        }
        if (!websiteFilter) {
            alert("Veuillez sélectionner un site d'affiliation.");
            return;
        }
        setLoading(true);

        const data: ICreateAffiliationProduct<any> = {
            website: websiteFilter,
            marketplace: "Amazon.fr",
            product: selectedProduct,
            asin: asin,
            data: selectedProduct === "peluche pokémon" ? { ...payloadPeluche } : {},
        };
        try {
            const res = await createProductTask(data);
            if (res.error) toast.error(res.error);
            if (res.message) toast.success(res.message);
            const id = res.response;
            if (id) {
                const boutique = boutiqueFromPublicDomain(data.website as TPublicDomainsShopify);
                const url = `/shopify/${boutique.id}/products/${id.replace("gid://shopify/Product/", "")}`;
                router.push(url);
            } else toast.error("Erreur lors de la création du produit: ID manquant");
        } catch (error) {
            console.error("Error creating product:", error);
            toast.error("Erreur lors de la création du produit");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CardAction className="flex justify-end">
            <Button disabled={disableAdd}>Ajouter</Button>
        </CardAction>
    );
}
