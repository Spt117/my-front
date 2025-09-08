import { IOrdersDomains } from "@/library/shopify/orders";
import { getServer } from "@/library/utils/fetchServer";
import { pokeUriServer } from "@/library/utils/uri";
import MapOrdersDomains from "./mapOrdersDomains";
import { ProductInOrder } from "./store";
import Products from "./ModeProducts/Products";

export default async function Page() {
    const url = `${pokeUriServer}/shopify/orders`;
    const response = await getServer(url);
    if (!response || !response.response) return <div>Erreur lors de la récupération des commandes</div>;

    const data: IOrdersDomains[] = response.response;

    const products: ProductInOrder[] = data.flatMap((domain) =>
        domain.orders.flatMap((order) =>
            order.lineItems.edges.map(({ node }) => {
                return {
                    title: node.title,
                    image: node.variant.product.featuredImage.url,
                    productUrl: `https://${domain.shop}/admin/products/${node.variant.product.id.split("/").pop()}`,
                    quantity: node.quantity,
                    shop: domain.shop,
                    sku: node.sku,
                };
            })
        )
    );

    // Regroupement par SKU avec addition des quantités
    const groupedProducts: ProductInOrder[] = products.reduce((acc: ProductInOrder[], product) => {
        const existingProduct = acc.find((p) => p.sku === product.sku);

        if (existingProduct) {
            // Si le SKU existe déjà, on additionne la quantité
            existingProduct.quantity += product.quantity;
        } else {
            // Sinon on ajoute le produit à l'accumulateur
            acc.push({ ...product });
        }

        return acc;
    }, []);

    return (
        <div className="container flex flex-col justify-center items-center ">
            <MapOrdersDomains ordersDomains={data} />
            <Products products={groupedProducts} />
        </div>
    );
}
