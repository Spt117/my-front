"use client";

import useShopifyStore from "@/components/shopify/shopifyStore";
import { CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCopy } from "@/library/hooks/useCopy";
import { Copy } from "lucide-react";
import HeaderProduct from "./HeaderProduct";
import ImagesProduct from "./Images";
import Amazon from "./Metafields/Amazon";
import Metafields from "./Metafields/Metafields";
import Prices from "./Prices";
import Tags from "./Tags/Tags";

export default function Product() {
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
                    <div className="space-y-4 flex flex-wrap justify-start">
                        <Prices />
                        {/* SKU, stock et politique d'inventaire */}
                        <div className="text-sm text-muted-foreground flex flex-col gap-1">
                            <p className={"flex items-center gap-1 text-gray-700 " + classCopy} onClick={() => handleCopy(product.id)} title="Cliquer pour copier l'ID">
                                IdProduct: {product.id}
                                <Copy size={12} className="text-gray-500" />
                            </p>
                            <p className={"flex items-center gap-1 text-gray-700 " + classCopy} onClick={() => handleCopy(product.variants.nodes[0].id)} title="Cliquer pour copier l'ID">
                                IdProduct: {product.variants.nodes[0].id}
                                <Copy size={12} className="text-gray-500" />
                            </p>
                            <p className={"flex items-center gap-1 text-gray-700 " + classCopy} onClick={() => handleCopy(mainVariant.sku)} title="Cliquer pour copier le SKU">
                                SKU: {mainVariant.sku}
                                <Copy size={12} className="text-gray-500" />
                            </p>
                            <p>Barcode: {mainVariant?.barcode || "Non disponible"}</p>
                            <p>Stock: {mainVariant?.inventoryQuantity > 0 ? `${mainVariant.inventoryQuantity} disponibles` : "Rupture de stock"}</p>
                            <Amazon />
                        </div>

                        {/* Options */}
                        {product.options.length > 1 && (
                            <div>
                                <h3 className="text-lg font-medium">Options</h3>
                                <div className="text-sm text-muted-foreground">
                                    {product.options.map((option, index) => (
                                        <p key={index}>
                                            {option.name}: {option.values.map((v) => (typeof v === "string" ? v : v.name)).join(", ")}
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Metafields */}
                        <Metafields metafields={product.metafields.nodes} />
                        <Tags />
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
