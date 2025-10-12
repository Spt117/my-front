import { MenuProps } from "@/components/menu/menu";

export const menuItems: MenuProps[] = [
    { path: "/", label: "Commandes" },
    { path: "/stock", label: "Stock" },
    { path: "/tasks", label: "Tâches" },
    { path: "/create", label: "Créer une fiche produit" },
    { path: "/product-duplicate", label: "Dupliquer une fiche produit" },
    { path: "/product", label: "Produit" },
    { path: "/bulk", label: "Édition en masse" },
    { path: "/stats", label: "Statistiques" },
    { path: "/wordpress", label: "WordPress" },
    { path: "/server", label: "Serveur" },
];

export const modes = [
    { label: "Standard", description: "Recherche Standard", value: "standard" },
    { label: "Tags", description: "Recherche par Tags", value: "tags" },
    { label: "Collections", description: "Recherche par Collections", value: "collections" },
    { label: "Description", description: "Recherche par Description", value: "description" },
    { label: "Canaux de publication", description: "Recherche par Canaux de publication", value: "channels" },
] as const;

export type TSearchMode = (typeof modes)[number]["value"];
