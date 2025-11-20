"use client";

import { useEffect } from "react";
import useCollectionStore from "../storeCollections";
import { ShopifyCollectionWithProducts } from "../utils";
import { toast } from "sonner";

interface CollectionLayoutClientProps {
    data: ShopifyCollectionWithProducts;
    children: React.ReactNode;
    error: string | null;
}

export default function CollectionLayoutClient({ data, children, error }: CollectionLayoutClientProps) {
    const { setDataCollection } = useCollectionStore();

    useEffect(() => {
        setDataCollection(data);
        if (error) toast.error(error);
    }, [data]);

    return <>{children}</>;
}
