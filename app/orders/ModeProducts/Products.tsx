import useOrdersStore, { ProductInOrder } from "../store";
import Product from "./Product";

export default function Products({ products }: { products: ProductInOrder[] }) {
    const { mode } = useOrdersStore();

    const countProducts = products.map((p) => p.sku).filter((value, index, self) => self.indexOf(value) === index).length;

    if (mode !== "products") return null;
    return (
        <>
            <h1 className="text-2xl font-bold m-3">{countProducts} produits</h1>
            <div className="flex gap-4 flex-wrap ">
                {products.map((product) => (
                    <Product key={product.sku} product={product} />
                ))}
            </div>
        </>
    );
}
