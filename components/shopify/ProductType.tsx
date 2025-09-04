import Selecteur from "../selecteur";
import useShopifyStore from "./shopifyStore";

export const productTypes = {
    toupie: { français: "Toupie", anglais: "Top", espagnol: "Trompo", allemand: "Kreisel" },
    lanceur: { français: "Lanceur", anglais: "Launcher", espagnol: "Lanzador", allemand: "Launcher" },
    arène: { français: "Arène", anglais: "Arena", espagnol: "Arena", allemand: "Arena" },
};

export type TProductType = keyof typeof productTypes;

const brandTypes = ["Hasbro", "Takara Tomy"] as const;
export type TBrand = (typeof brandTypes)[number];

export function ProductType() {
    const { selectedType, setSelectedType, selectedBrand, setSelectedBrand } = useShopifyStore();

    return (
        <div className="flex gap-4 my-4">
            <Selecteur value={selectedType} onChange={setSelectedType} array={Object.entries(productTypes).map(([key, value]) => ({ label: value.français, value: key }))} placeholder="Type de produit" />
            <Selecteur value={selectedBrand} onChange={setSelectedBrand} array={Object.entries(brandTypes).map(([key, value]) => ({ label: value, value: value }))} placeholder="Marque" />
        </div>
    );
}
