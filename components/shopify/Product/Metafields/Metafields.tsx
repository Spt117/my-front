import { TMetafield } from "@/library/types/graph";
import React from "react";
import useShopifyStore from "../../shopifyStore";
import Amazon from "./Amazon";

export default function Metafields({ metafields }: { metafields: TMetafield[] }) {
    const { product, shopifyBoutique } = useShopifyStore();

    return (
        <div>
            <h3 className="text-lg font-medium">Informations supplémentaires</h3>
            <div className="text-sm text-muted-foreground">
                <ul>
                    {metafields.map((metafield: TMetafield) => (
                        <React.Fragment key={metafield.id}>
                            {metafield.key === "amazon_activate" ? (
                                <Amazon metafield={metafield} />
                            ) : metafield.key === "id_video_youtube" ? (
                                <li>
                                    <iframe
                                        src={`https://www.youtube.com/embed/${metafield.value}`}
                                        allow="autoplay; encrypted-media"
                                        loading="lazy"
                                        title={`Vidéo de présentation de ${product?.title}`}
                                    ></iframe>
                                </li>
                            ) : metafield.key === "url_video" ? (
                                <video
                                    src={metafield.value}
                                    muted
                                    controls
                                    title={`Vidéo de présentation de ${product?.title}`}
                                ></video>
                            ) : (
                                <li>
                                    {metafield.key}: {metafield.value}
                                </li>
                            )}
                            <br />
                        </React.Fragment>
                    ))}
                </ul>
            </div>
        </div>
    );
}
