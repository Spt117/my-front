import Image from "next/image";
import { ProductNode } from "./shopifySearch";
import { boutiqueFromDomain } from "@/library/params/paramsShopify";

export default function ProductToClick({ product }: { product: ProductNode }) {
    const classFlag =
        "w-[50px] h-[50px] relative cursor-pointer flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm text-sm text-blue-600";
    if (!product.domain) return null;
    const boutique = boutiqueFromDomain(product.domain);
    const shopifyUrl = `https://${boutique?.domain}/admin/products/${product.id.split("/").pop()}`;
    return (
        <a href={shopifyUrl} target="_blank" rel="noopener noreferrer">
            <div className={classFlag}>
                <Image
                    src={boutique.flag || "/no_image.png"}
                    alt="Flag"
                    fill
                    sizes="20px"
                    className="object-contain absolute bottom-0 right-0 border border-white rounded-full"
                />
            </div>
        </a>
    );
}
