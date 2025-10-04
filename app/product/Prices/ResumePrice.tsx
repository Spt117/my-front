"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Badge } from "@/components/ui/badge";
import { useEffect } from "react";
import useTaskStore from "../Tasks/storeTasks";
import Task from "../Tasks/Task";
import useProductStore from "../storeProduct";

export default function ResumePrice() {
    const { product, shopifyBoutique } = useShopifyStore();
    const { price, compareAtPrice, setPrice, setCompareAtPrice } = useProductStore();
    const { tasks } = useTaskStore();

    useEffect(() => {
        if (!product) return;
        setPrice(product.variants.nodes[0].price);
        setCompareAtPrice(product.variants.nodes[0].compareAtPrice || "0");
    }, [product?.variants.nodes[0].price, product?.variants.nodes[0].compareAtPrice]);

    if (!product || !shopifyBoutique) return null;

    if (compareAtPrice && price && Number(compareAtPrice) > Number(price))
        return (
            <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-4 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Économie client</span>
                    <div className="flex items-center gap-2">
                        <span className="line-through text-slate-400">
                            {compareAtPrice}
                            {shopifyBoutique.devise}
                        </span>
                        <span className="font-semibold text-emerald-700">
                            {price}
                            {shopifyBoutique.devise}
                        </span>
                        <Badge variant="destructive" className="bg-red-100 text-red-700">
                            -{(parseFloat(compareAtPrice) - parseFloat(price)).toFixed(2)}
                            {shopifyBoutique.devise}
                        </Badge>
                    </div>
                </div>
                {tasks.length > 0 && (
                    <div className="flex flex-col w-full w-min">
                        {tasks.map((task, index) => (
                            <Task key={index} task={task} index={index} />
                        ))}
                    </div>
                )}
            </div>
        );
}
