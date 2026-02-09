"use client";

import { useEffect } from "react";
import useCollectionStore from "../storeCollections";
import { ShopifyCollectionWithProducts } from "../utils";
import { toast } from "sonner";

interface CollectionLayoutClientProps {
    data: ShopifyCollectionWithProducts | null;
    children: React.ReactNode;
    error: string | null;
}

export default function CollectionLayoutClient({ data, children, error }: CollectionLayoutClientProps) {
    const { setDataCollection } = useCollectionStore();

    useEffect(() => {
        if (data) setDataCollection(data);
        if (error) toast.error(error);
    }, [data, error]);

    if (!data && !error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <p className="text-center text-gray-600">Chargement de la collection...</p>
            </div>
        );
    }

    if (!data && error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <p className="text-center text-red-600 font-semibold">Une erreur est survenue lors du chargement.</p>
            </div>
        );
    }

    return <>{children}</>;
}
