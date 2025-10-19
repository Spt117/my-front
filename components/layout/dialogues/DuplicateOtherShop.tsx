import useProductStore from "@/app/product/storeProduct";
import { ProductType } from "@/components/shopify/ProductType";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { TDomainsShopify, boutiqueFromDomain, boutiques } from "@/params/paramsShopify";
import { postServer } from "@/library/utils/fetchServer";
import { ArrowBigLeft, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function DuplicateOtherShop() {
    const { closeDialog, openDialog, shopifyBoutique, product, selectedType, selectedBrand } = useShopifyStore();
    const { idsOtherShop } = useProductStore();
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);

    const options = boutiques.filter((b) => b.domain !== shopifyBoutique?.domain && b.niche === shopifyBoutique?.niche && !idsOtherShop.find((id) => b.domain === id.domain));

    const handleValidate = async (domainDest: TDomainsShopify) => {
        setLoading(true);
        const uri = "http://localhost:9100/shopify/duplicate";
        if (!shopifyBoutique || !product || !selectedType || !selectedBrand) {
            console.log("Missing required fields");
            return;
        }
        const data = {
            domainsDest: domainDest,
            productId: product.id,
            tags: product.tags,
            domainOrigin: shopifyBoutique.domain,
            productType: selectedType,
            productBrand: selectedBrand,
        };

        const res = await postServer(uri, data);
        if (res.error) toast.error(res.error);
        if (res.message) toast.success(res.message);
        console.log(res.response);
        const newShop = boutiqueFromDomain(domainDest);
        const url = `/product?id=${res.response.id.replace("gid://shopify/Product/", "")}&shopify=${newShop.locationHome}`;
        router.push(url);
        closeDialog();
        setLoading(false);
    };

    return (
        <>
            <X className="absolute right-4 top-4 cursor-pointer" onClick={closeDialog} />
            <div className="space-y-3">
                <span className="mb-1 block text-s font-medium text-slate-600">Dupliquer {product?.title}</span>
            </div>

            <ProductType />
            <div>
                {options.map((boutique) => (
                    <Button disabled={loading || !selectedType || !selectedBrand} onClick={() => handleValidate(boutique.domain)} key={boutique.domain} variant="outline" size="sm" className="m-1">
                        <Image src={boutique.flag} alt={boutique.langue} width={20} height={20} className="inline mr-2" />
                        {boutique.vendor}
                    </Button>
                ))}
                {!loading && (
                    <Button type="button" size="sm" variant="outline" onClick={() => openDialog(34)}>
                        <ArrowBigLeft className="mr-2" />
                    </Button>
                )}
                {loading && (
                    <Button disabled type="button" size="sm" variant="outline">
                        <Spinner className="mr-2" />
                    </Button>
                )}
            </div>

            <div className="flex gap-4 my-4 justify-between"></div>
        </>
    );
}
