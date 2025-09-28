import { TMetafield } from "@/library/types/graph";
import React from "react";
import useShopifyStore from "../../shopifyStore";
import Amazon from "./Amazon";

export default function Metafields({ metafields }: { metafields: TMetafield[] }) {
    const { product, shopifyBoutique } = useShopifyStore();

    const keys = ["id_video_youtube", "url_video", "amazon_activate", "asin"];
    const filteredMetafields = metafields.filter((mf) => !keys.includes(mf.key));

    if (filteredMetafields.length === 0) return null;

    return (
        <div className="bg-green-500">
            <h3 className="text-lg font-medium mb-">Metafields supplémentaires</h3>
            <div className="text-sm text-muted-foreground">
                <ul className="list-disc list-inside flex flex-col gap-1">
                    {filteredMetafields.map((metafield: TMetafield) => (
                        <li key={metafield.id}>
                            {metafield.key}: {metafield.value}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
