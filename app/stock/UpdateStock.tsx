import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { TDomainsShopify } from "@/params/paramsShopify";
import { useState } from "react";
import { toast } from "sonner";
import { updateVariantStock } from "../shopify/[shopId]/products/[productId]/serverAction";

interface IUpdateStockProps {
    variantGid: string;
    quantity: number;
    domain: TDomainsShopify;
}

export default function UpdateStock({ params }: { params: IUpdateStockProps }) {
    const [numberInput, setNumberInput] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleUpdateVariantStock = async () => {
        setIsLoading(true);

        try {
            const res = await updateVariantStock(params.domain, params.variantGid, numberInput + params.quantity);
            if (res.error) toast.error(res.error);
        } catch (error) {
            toast.error("Erreur serveur lors de la mise à jour du stock");
        } finally {
            setIsLoading(false);
            setNumberInput(0);
        }
    };

    return (
        <>
            <p className="text-sm text-gray-600">
                Quantité en stock: {params.quantity}
                {numberInput !== 0 && (
                    <span className="font-bold">
                        {"  -> "}
                        {numberInput + params.quantity}
                    </span>
                )}{" "}
            </p>
            <div className="flex space-x-2">
                <Input
                    value={numberInput}
                    placeholder="Quantité"
                    type="number"
                    onChange={(e) => {
                        setNumberInput(Number(e.target.value));
                    }}
                />
                {!isLoading && (
                    <Button disabled={!numberInput} onClick={handleUpdateVariantStock}>
                        Ajuster
                    </Button>
                )}
                {isLoading && <Spinner className="h-6 w-6" />}{" "}
            </div>
        </>
    );
}
