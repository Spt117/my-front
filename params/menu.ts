import { MenuProps } from "@/components/menu/menu";

export const menuItems: MenuProps[] = [
    { path: "/shopify", label: "Boutiques" },
    { path: "/stock", label: "Stock" },
    { path: "/tasks", label: "Tâches" },
    { path: "/create", label: "Créer une fiche produit" },
    { path: "/product", label: "Produit" },
    { path: "/collections", label: "Collections" },
    { path: "/bulk", label: "Édition en masse" },
    { path: "/pokemon", label: "Pokémon" },
    { path: "/stats", label: "Statistiques" },
    { path: "/wordpress", label: "WordPress" },
    { path: "/server", label: "Serveur" },
];

export const menuShopify = (id?: number): MenuProps[] => {
    return [
        { path: "/shopify/orders", label: "Commandes" },
        { path: `/shopify/${id}/products`, label: "Produits", disabled: !id },
        { path: `/shopify/${id}/collections`, label: "Collections", disabled: !id },
        { path: `/shopify/${id}/customers`, label: "Clients", disabled: !id },
        { path: `/shopify/${id}/discounts`, label: "Réductions", disabled: !id },
        { path: `/shopify/${id}/settings`, label: "Réglages", disabled: !id },
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
