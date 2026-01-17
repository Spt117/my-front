import { MenuProps } from "@/components/menu/menu";

export const menuItems: MenuProps[] = [
    { path: "/beyblade", label: "Beyblade" },
    { path: "/stock", label: "Stock" },
    { path: "/supabase", label: "Supabase" },
    { path: "/tasks", label: "Tâches" },
    { path: "/create", label: "Créer une fiche produit" },
    { path: "/pokemon", label: "Pokémon" },
    { path: "/wordpress", label: "WordPress" },
    { path: "/server", label: "Serveur" },
];

export const menuShopify = (id?: number): MenuProps[] => {
    return [
        { path: `/shopify/${id}`, label: "Analytics", disabled: !id },
        { path: `/shopify/${id}/orders`, label: "Commandes", disabled: !id },
        { path: `/shopify/${id}/products`, label: "Produits", disabled: !id },
        { path: `/shopify/${id}/bulk`, label: "Édition en masse", disabled: !id },
        { path: `/shopify/${id}/collections`, label: "Collections", disabled: !id },
        { path: `/shopify/${id}/clients`, label: "Clients", disabled: !id },
        { path: `/shopify/${id}/boutique`, label: "Boutique", disabled: !id },
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
