"use client";

import { Card } from "@/components/ui/card";
import useReviewStore from "./storeReview";
import ProductBeyblade from "./ProductBeyblade";

export default function Page() {
    const { reviewItems } = useReviewStore();

    return (
        <div className="p-4">
            {reviewItems.map((item, index) => (
                <ProductBeyblade key={index} product={item} />
            ))}
        </div>
    );
}
