import Selecteur from "@/components/selecteur";
import { allProducts, pokemonProducts } from "@/params/paramsCreateAffiliation";
import useCreateStore from "./storeCreate";
import { useEffect } from "react";

export default function TypeProduct() {
    const { selectedNiche, setSelectedNiche, selectedProduct, setSelectedProduct } = useCreateStore();

    useEffect(() => {
        setSelectedProduct(null);
    }, [selectedNiche, setSelectedProduct]);

    if (!selectedNiche) return null;
    const optionsProducts = allProducts[selectedNiche].map((product) => ({ label: product, value: product }));

    return <Selecteur placeholder="Select a product type" array={optionsProducts} value={selectedProduct} onChange={setSelectedProduct} />;
}
