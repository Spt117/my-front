import { ProductType } from "@/components/shopify/ProductType";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { TDomainsShopify, boutiques } from "@/library/params/paramsShopify";
import { postServer } from "@/library/utils/fetchServer";
import { sleep } from "@/library/utils/helpers";
import { ArrowBigLeft, X } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";
import { MultiSelect, MultiSelectOption } from "../../Multiselect";
import { useRouter } from "next/navigation";

export default function DuplicateOtherShop() {
    const { closeDialog, openDialog } = useShopifyStore();
    const [loading, setLoading] = useState<boolean>(false);
    const { shopifyBoutique, product, selectedType, selectedBrand } = useShopifyStore();
    const [domainsDest, setDomainsDest] = useState<TDomainsShopify[]>([]);
    const router = useRouter();

    const options = boutiques.filter((b) => b.domain !== shopifyBoutique?.domain);
    // .map((boutique) => ({
    //     label: (
    //         <React.Fragment key={boutique.domain}>
    //             <Image src={boutique.flag} alt={boutique.langue} width={20} height={20} className="inline mr-2" />
    //             {boutique.vendor}
    //         </React.Fragment>
    //     ),
    //     value: boutique.domain,
    //     disabled: boutique.domain === shopifyBoutique?.domain,
    //     key: boutique.domain,
    // })) as unknown as MultiSelectOption[];

    const handleSelectDest = (selectedOptions: string[]) => {
        setDomainsDest(selectedOptions as TDomainsShopify[]);
    };

    const handleValidate = async (domainDest: TDomainsShopify) => {
        setLoading(true);
        const uri = "http://localhost:9100/shopify/duplicate";
        if (!shopifyBoutique || !product || !selectedType || !selectedBrand) {
            console.log("Missing required fields");
            return;
        }
        const data = {
            domainsDest: [domainDest],
            productId: product.id,
            tags: product.tags,
            domainOrigin: shopifyBoutique.domain,
            productType: selectedType,
            productBrand: selectedBrand,
        };
        interface IResponseDuplicate {
            response: { messages?: string[]; errors?: string[] } | null;
            error?: string;
            message?: string;
        }
        const res = (await postServer(uri, data)) as IResponseDuplicate;
        if (res.error) toast.error(res.error);
        if (res.message) toast.success(res.message);
        if (res.response?.messages && res.response.messages.length > 0) {
            for (const message of res.response.messages) {
                toast.success(message);
                await sleep(2000);
            }
        }
        if (res.response?.errors && res.response.errors.length > 0) {
            for (const error of res.response.errors) {
                toast.error(error);
                await sleep(2000);
            }
        }
        closeDialog();
        router.refresh();
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
                    <Button
                        onClick={() => handleValidate(boutique.domain)}
                        key={boutique.domain}
                        variant="outline"
                        size="sm"
                        className="m-1"
                    >
                        <Image src={boutique.flag} alt={boutique.langue} width={20} height={20} className="inline mr-2" />
                        {boutique.vendor}
                    </Button>
                ))}
                <Button disabled={loading} type="button" size="sm" variant="outline" onClick={() => openDialog(34)}>
                    <ArrowBigLeft className="mr-2" />
                </Button>
            </div>

            <div className="flex gap-4 my-4 justify-between"></div>
        </>
    );
}
