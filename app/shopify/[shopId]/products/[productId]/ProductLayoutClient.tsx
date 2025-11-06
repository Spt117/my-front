"use client";

import useShopifyStore from "@/components/shopify/shopifyStore";
import { useEventListener } from "@/library/hooks/useEvent/useEvents";
import { TTaskShopifyProducts } from "@/library/models/tasksShopify/taskType";
import { useRouter } from "next/navigation";
import { useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import useTaskStore from "./Tasks/storeTasks";
import { fetchVariant } from "./serverAction";
import useProductStore from "./storeProduct";

interface ProductLayoutClientProps {
    children: React.ReactNode;
    product: any;
    tasks: TTaskShopifyProducts[];
    boutique: any;
    productId: string;
    error: string | null;
}

export default function ProductLayoutClient({ children, product, tasks, boutique, productId, error }: ProductLayoutClientProps) {
    const { setProduct, setVariant, setShopifyBoutique } = useShopifyStore();
    const { setTasks } = useTaskStore();
    const { setPrice, setCompareAtPrice } = useProductStore();
    const router = useRouter();

    // Mémoïsation de l'ID du produit pour éviter les conversions répétées
    const numericProductId = useMemo(() => Number(productId), [productId]);

    // Callback optimisé pour l'event listener
    const handleProductUpdate = useCallback(
        (data: any) => {
            const updatedProductId = Number(data.productId);

            if (updatedProductId === numericProductId) {
                console.log("Product updated, refreshing...");
                router.refresh();
            }
        },
        [numericProductId, router]
    );

    useEventListener("products/update", handleProductUpdate);

    // ✅ Initialisation initiale - une seule fois
    useEffect(() => {
        if (error) {
            toast.error(error);
            return;
        }

        // Initialisation groupée pour éviter les re-renders
        const initializeStores = () => {
            if (boutique) setShopifyBoutique(boutique);
            if (product) setProduct(product);
            if (tasks) setTasks(tasks);
        };

        initializeStores();
    }, [product]); // Dépend uniquement de productId pour éviter les recharges inutiles

    // ✅ Gestion des prix - optimisée
    useEffect(() => {
        const firstVariant = product?.variants?.nodes?.[0];

        if (!firstVariant) return;

        const price = firstVariant.price || "0";
        const comparePrice = firstVariant.compareAtPrice || "0";

        // Mise à jour groupée si possible, sinon séparée
        setPrice(price);
        setCompareAtPrice(comparePrice);
    }, [product?.variants?.nodes, setPrice, setCompareAtPrice]);

    // ✅ Chargement des variants - avec gestion d'erreur améliorée
    useEffect(() => {
        let isMounted = true; // Évite les mises à jour sur un composant démonté

        const loadVariants = async () => {
            if (!product?.id || !boutique?.domain) return;

            try {
                const variantData = await fetchVariant(product, boutique.domain);

                if (isMounted) {
                    setVariant(variantData);
                }
            } catch (err) {
                if (isMounted) {
                    console.error("Error fetching variants:", err);
                    toast.error("Erreur lors du chargement des variantes");
                }
            }
        };

        loadVariants();

        return () => {
            isMounted = false;
        };
    }, [product, boutique?.domain, setVariant]);

    return <>{children}</>;
}
