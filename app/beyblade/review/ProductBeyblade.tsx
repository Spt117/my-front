import { Card } from "@/components/ui/card";
import { IBeybladeProduct } from "../model/typesBeyblade";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { deleteBeybladeById } from "../model/product/middlewareProduct";
import useBeybladeStore from "../beybladeStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ProductBeyblade({ product }: { product: IBeybladeProduct }) {
    const { generation } = useBeybladeStore();
    const router = useRouter();

    const handleDelete = async () => {
        const res = await deleteBeybladeById(product._id!, generation);
        if (res.success) toast.success(res.message || "Beyblade deleted");
        if (res.error) toast.error(res.error);
        router.refresh();
    };

    return (
        <Card className="mb-4 p-4">
            <div className="flex items-center ">
                <Image src={product.images[0]} alt={product.title} width={100} height={100} />
                <div>
                    <p className="text-lg font-semibold ">{product.productCode}</p>
                    <p className="text-sm text-gray-600">{product.title}</p>
                </div>
                <Trash2 onClick={handleDelete} className="ml-auto text-red-500 cursor-pointer" />
            </div>
        </Card>
    );
}
