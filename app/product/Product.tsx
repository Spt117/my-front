"use client";

import useShopifyStore from "@/components/shopify/shopifyStore";
import { CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCopy } from "@/library/hooks/useCopy";
import { TVariant } from "@/library/models/produits/Variant";
import { Copy } from "lucide-react";
import HeaderProduct from "../../components/shopify/Product/HeaderProduct";
import ImagesProduct from "../../components/shopify/Product/Images";
import Amazon from "../../components/shopify/Product/Metafields/Amazon";
import Metafields from "../../components/shopify/Product/Metafields/Metafields";
import Tags from "../../components/shopify/Product/Tags/Tags";
import { VariantStock } from "../stock/VariantStock";
import Prices from "./Prices";
import LinkToShops from "@/components/shopify/Product/LinkToShops";

export default function Product({ variantStock }: { variantStock: TVariant | null }) {
    const { product, shopifyBoutique } = useShopifyStore();
    const { handleCopy } = useCopy();

    if (!product || !shopifyBoutique) {
        return <div className="text-center py-8 text-muted-foreground">Aucun produit sélectionné</div>;
    }

    const mainVariant = product.variants.nodes[0];
    const classCopy = "cursor-pointer transition-transform duration-500 ease-out active:scale-93";

    if (product)
        return (
            <div>
                <HeaderProduct />

                <CardContent className="grid flex gap-6 flex-wrap md:flex-nowrap md:grid-cols-2">
                    {/* Carrousel d'images */}
                    <ImagesProduct />
                    {/* Détails du produit */}
                    <div className="grid gap-6 mb-4">
                        <Prices />
                        {variantStock && <VariantStock variant={variantStock} />}
                        <Tags />

                        <LinkToShops variant={variantStock} />

                        {/* Options */}
                        {/* {product.options.length > 1 && (
                            <div>
                                <h3 className="text-lg font-medium">Options</h3>
                                <div className="text-sm text-muted-foreground">
                                    {product.options.map((option, index) => (
                                        <p key={index}>
                                            {option.name}:{" "}
                                            {option.values.map((v) => (typeof v === "string" ? v : v.name)).join(", ")}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )} */}

                        {/* Metafields */}
                        <Metafields metafields={product.metafields.nodes} />
                    </div>
                </CardContent>
                <Separator />
                <CardContent className="pt-4 space-y-4">
                    {/* Description */}
                    <div>
                        <h3 className="text-lg font-medium">Description</h3>
                        <div
                            className="text-sm text-muted-foreground"
                            dangerouslySetInnerHTML={{
                                __html: product.descriptionHtml || "<p>Aucune description disponible</p>",
                            }}
                        />
                    </div>

                    {/* Informations supplémentaires */}
                    <div className="text-sm text-muted-foreground">
                        <p>Type de produit: {product.productType || "Non spécifié"}</p>
                        <p>Statut: {product.status}</p>
                        <p>Créé le: {new Date(product.createdAt).toLocaleDateString("fr-FR")}</p>
                        <p>Mis à jour le: {new Date(product.updatedAt).toLocaleDateString("fr-FR")}</p>
                    </div>
                </CardContent>
            </div>
        );
}
