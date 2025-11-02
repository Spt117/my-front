import useReviewStore from "@/app/beyblade/review/storeReview";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useBeybladeStore from "../beybladeStore";
import { deleteBeybladeById } from "../model/product/middlewareProduct";
import { IBeybladeProduct } from "../model/typesBeyblade";

export default function ProductBeyblade({ product }: { product: IBeybladeProduct }) {
    const { generation } = useBeybladeStore();
    const { setItem } = useReviewStore();
    const router = useRouter();

    const handleDelete = async (e: any) => {
        e.stopPropagation();
        const res = await deleteBeybladeById(product._id!, generation);
        if (res.success) toast.success(res.message || "Beyblade deleted");
        if (res.error) toast.error(res.error);
        router.refresh();
    };

    const handleClick = () => {
        setItem(product);
        const url = `/beyblade/review/${product._id}`;
        router.push(url);
    };

    return (
        <Card className="mb-4 p-4 cursor-pointer" onClick={handleClick}>
            <div className="flex items-center ">
                <Image src={product.images[0]} alt={product.title} width={100} height={100} />
                <div>
                    <p className="text-lg font-semibold ">{product.productCode}</p>
                    <p className="text-sm text-gray-600">{product.title}</p>
                </div>
                <Trash2 onClick={(e) => handleDelete(e)} className="ml-auto text-red-500" />
            </div>
        </Card>
    );
}
