import { AlertTriangle } from "lucide-react";
import { ProductInOrder } from "../store";
import Image from "next/image";

export default function Product({ product }: { product: ProductInOrder }) {
    return (
        <a href={product.productUrl} target="_blank" rel="noopener noreferrer">
            <div className="w-70 flex items-center gap-4 bg-gray-50 p-2 rounded-md mb-2 hover:bg-gray-100 transition-colors">
                <div className="relative w-24 h-24 z-0">
                    <Image sizes="50" priority src={product.image} alt={product.title} fill className="object-cover rounded-md" />
                </div>
                <div>
                    <p className="text-sm font-medium">{product.title}</p>
                    <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                    {product.quantity === 1 && <p className="text-xs text-gray-500">Quantité: {product.quantity}</p>}
                    {product.quantity > 1 && (
                        <p className="text-sm text-red-500 font-bold flex items-center gap-1">
                            <AlertTriangle />
                            Quantités: {product.quantity}
                        </p>
                    )}
                </div>
            </div>
        </a>
    );
}
