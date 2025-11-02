import { MenuProps } from "@/components/menu/menu";

export const menuItems: MenuProps[] = [
    { path: "/beyblade", label: "Beyblade" },
    { path: "/stock", label: "Stock" },
    { path: "/tasks", label: "Tâches" },
    { path: "/create", label: "Créer une fiche produit" },
    { path: "/pokemon", label: "Pokémon" },
    { path: "/wordpress", label: "WordPress" },
    { path: "/server", label: "Serveur" },
];

export const menuShopify = (id?: number): MenuProps[] => {
    return [
        { path: "/shopify/orders", label: "Commandes" },
        { path: `/shopify/${id}/products`, label: "Produits", disabled: !id },
        { path: `/shopify/${id}/bulk`, label: "Édition en masse", disabled: !id },
        { path: `/shopify/${id}/collections`, label: "Collections", disabled: !id },
    ];
};

export const modes = [
    { label: "Standard", description: "Recherche Standard", value: "standard" },
    { label: "Tags", description: "Recherche par Tags", value: "tags" },
    { label: "Collections", description: "Recherche par Collections", value: "collections" },
    { label: "Description", description: "Recherche par Description", value: "description" },
    { label: "Produits non publiés", description: "Recherche par Produits non publiés", value: "productsMissingChannels" },
] as const;

export type TSearchMode = (typeof modes)[number]["value"];
