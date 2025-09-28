import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { getStockVariant } from "@/library/models/produits/middlewareVariants";
import { postServer } from "@/library/utils/fetchServer";
import { sleep } from "@/library/utils/helpers";
import { useState } from "react";
import { toast } from "sonner";

interface IUpdateStockProps {
    sku: string;
    quantity: number;
    domain: string;
}

export default function UpdateStock({ params, action }: { params: IUpdateStockProps; action?: (data: any) => Promise<void> }) {
    const [numberInput, setNumberInput] = useState<number>(0);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleUpdateVariantStock = async () => {
        if (!params.quantity) {
            toast.error("Quantité actuelle invalide");
            return;
        }
        setIsLoading(true);
        const url = `http://localhost:9100/shopify/update-stock`;

        const data = {
            domain: params.domain,
            sku: params.sku,
            quantity: numberInput + params.quantity,
        };
        const res = await postServer(url, data);
        const vUpdated = await getStockVariant();
        if (res.error) toast.error("Erreur lors de la mise à jour du stock");
        if (res.message) {
            toast.success(res.message);
            await sleep(500);
        }
        if (action) await action(vUpdated);
        setIsLoading(false);
        setNumberInput(0);
    };
    return (
        <>
            <p className="text-sm text-gray-600">
                Quantité en stock: {params.quantity}
                {numberInput !== 0 && params.quantity && (
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
                {!isLoading && <Button onClick={handleUpdateVariantStock}>Ajuster</Button>}
                {isLoading && <Spinner className="h-6 w-6" />}{" "}
            </div>
        </>
    );
}
