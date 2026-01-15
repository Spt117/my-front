import { useEffect } from "react";
import Selecteur from "../selecteur";
import useShopifyStore from "./shopifyStore";

export const productTypes = {
    toupie: { français: "Toupie", anglais: "Top", espagnol: "Trompo", allemand: "Kreisel" },
    lanceur: { français: "Lanceur", anglais: "Launcher", espagnol: "Lanzador", allemand: "Launcher" },
    arène: { français: "Arène", anglais: "Arena", espagnol: "Arena", allemand: "Arena" },
};

export type TProductType = keyof typeof productTypes;

// Fonction pour mapper les valeurs de productType (dans toutes les langues) vers les clés
export function getProductTypeKey(value: string | undefined): TProductType | null {
    if (!value) return null;
    const lowerValue = value.toLowerCase();
    
    // Vérifier d'abord si c'est déjà une clé valide
    if (lowerValue in productTypes) {
        return lowerValue as TProductType;
    }
    
    // Sinon, chercher dans les valeurs traduites
    for (const [key, translations] of Object.entries(productTypes)) {
        const allTranslations = Object.values(translations).map(t => t.toLowerCase());
        if (allTranslations.includes(lowerValue)) {
            return key as TProductType;
        }
    }
    
    return null;
}

export const brandTypes = ["Hasbro", "Takara Tomy"] as const;
export type TBrand = (typeof brandTypes)[number];

export function ProductType() {
    const { selectedType, setSelectedType, selectedBrand, setSelectedBrand, product } = useShopifyStore();

    useEffect(() => {
        const brand = brandTypes.find((b) => product?.tags.includes(b));
        if (brand) setSelectedBrand(brand);
        setSelectedType(getProductTypeKey(product?.productType));
    }, [product?.tags, product?.productType]);

    return (
        <div className="flex gap-2">
            <Selecteur
                value={selectedType}
                onChange={setSelectedType}
                array={Object.entries(productTypes).map(([key, value]) => ({ label: value.français, value: key }))}
                placeholder="Type de produit"
            />
            <Selecteur
                value={selectedBrand}
                onChange={setSelectedBrand}
                array={Object.entries(brandTypes).map(([key, value]) => ({ label: value, value: value }))}
                placeholder="Marque"
            />
        </div>
    );
}
