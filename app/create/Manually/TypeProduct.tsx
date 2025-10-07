import Selecteur from "@/components/selecteur";
import { allProducts, pokemonProducts } from "@/library/params/paramsCreateAffiliation";
import useCreateStore from "./storeCreate";

export default function TypeProduct() {
    const { selectedNiche, setSelectedNiche, selectedProduct, setSelectedProduct } = useCreateStore();
    if (!selectedNiche) return null;

    const optionsProducts = allProducts[selectedNiche].map((product) => ({ label: product, value: product }));

    return (
        <Selecteur
            placeholder="Select a product type"
            array={optionsProducts}
            value={selectedProduct}
            onChange={setSelectedProduct}
        />
    );
}
