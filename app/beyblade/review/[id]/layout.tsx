"use client";

import useBeybladeStore from "@/app/beyblade/beybladeStore";
import { getBeybladeProductById } from "@/app/beyblade/model/product/middlewareProduct";
import { IBeybladeProduct } from "@/app/beyblade/model/typesBeyblade";
import useReviewStore from "@/app/beyblade/review/storeReview";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const path = usePathname();
    const { item, setItem } = useReviewStore();
    const { generation } = useBeybladeStore();

    const handleGetReviewItem = async () => {
        const id = path.split("/").pop();
        if (!item && id) {
            const item = await getBeybladeProductById(generation, id);
            if (!item) {
                toast.error("Beyblade product not found.");
                return;
            }
            const itemUpdated: IBeybladeProduct = { ...item, generation: generation };
            setItem(itemUpdated);
        }
    };

    useEffect(() => {
        handleGetReviewItem();
    }, [path]);

    return <>{children}</>;
}
