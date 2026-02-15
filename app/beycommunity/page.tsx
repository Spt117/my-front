import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { IconBolt, IconBuildingStore, IconDatabase, IconPackage, IconSettings, IconShield, IconSword, IconTools } from "@tabler/icons-react";
import Link from "next/link";

const categories = [
    {
        title: "Core collection",
        description: "Gérez les produits principaux et les combinaisons",
        icon: <IconPackage className="w-6 h-6 text-blue-400" />,
        tables: [
            { name: "x_products", label: "Produits", description: "Catalogue principal des produits", icon: <IconBuildingStore className="w-5 h-5" />, color: "bg-blue-500/10 text-blue-400 border-blue-500/30" },
            { name: "x_combos", label: "Combos", description: "Combinaisons de pièces", icon: <IconSword className="w-5 h-5" />, color: "bg-purple-500/10 text-purple-400 border-purple-500/30" },
            { name: "asins", label: "ASINs", description: "Liaisons Amazon et prix", icon: <IconDatabase className="w-5 h-5" />, color: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
            { name: "user_profiles", label: "Utilisateurs", description: "Gestion des comptes utilisateurs", icon: <IconShield className="w-5 h-5" />, color: "bg-rose-500/10 text-rose-400 border-rose-500/30" },
        ],
    },
    {
        title: "Pièces standard",
        description: "Lames, cliquets et pointes",
        icon: <IconSettings className="w-6 h-6 text-emerald-400" />,
        tables: [
            { name: "x_blades", label: "Blades", description: "Lames supérieures", icon: <IconShield className="w-5 h-5" />, color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" },
            { name: "x_ratchets", label: "Ratchets", description: "Cliquets de hauteur", icon: <IconSettings className="w-5 h-5" />, color: "bg-teal-500/10 text-teal-400 border-teal-500/30" },
            { name: "x_bits", label: "Bits", description: "Pointes de performance", icon: <IconBolt className="w-5 h-5" />, color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30" },
            { name: "x_lock_chips", label: "Lock Chips", description: "Jetons de verrouillage", icon: <IconTools className="w-5 h-5" />, color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30" },
        ],
    },
    {
        title: "Accessoires",
        description: "Lanceurs et équipements",
        icon: <IconTools className="w-6 h-6 text-amber-400" />,
        tables: [
            { name: "x_launchers", label: "Lanceurs", description: "Systèmes de propulsion", icon: <IconBolt className="w-5 h-5" />, color: "bg-amber-500/10 text-amber-400 border-amber-500/30" },
            { name: "x_arenas", label: "Arènes", description: "Stades de combat", icon: <IconShield className="w-5 h-5" />, color: "bg-orange-500/10 text-orange-400 border-orange-500/30" },
            { name: "x_grips", label: "Grips", description: "Poignées de maintien", icon: <IconTools className="w-5 h-5" />, color: "bg-red-500/10 text-red-400 border-red-500/30" },
            { name: "x_cases", label: "Boîtes", description: "Rangements et mallettes", icon: <IconPackage className="w-5 h-5" />, color: "bg-rose-500/10 text-rose-400 border-rose-500/30" },
        ],
    },
    {
        title: "Pièces avancées",
        description: "Composants techniques spécifiques",
        icon: <IconSettings className="w-6 h-6 text-fuchsia-400" />,
        tables: [
            { name: "x_main_blades", label: "Main Blades", description: "Lames principales", icon: <IconShield className="w-5 h-5" />, color: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30" },
            { name: "x_assist_blades", label: "Assist Blades", description: "Lames de soutien", icon: <IconTools className="w-5 h-5" />, color: "bg-pink-500/10 text-pink-400 border-pink-500/30" },
            { name: "x_over_blades", label: "Over Blades", description: "Lames supérieures", icon: <IconSettings className="w-5 h-5" />, color: "bg-violet-500/10 text-violet-400 border-violet-500/30" },
            { name: "x_metal_blades", label: "Metal Blades", description: "Lames métalliques", icon: <IconShield className="w-5 h-5" />, color: "bg-slate-500/10 text-slate-400 border-slate-500/30" },
            { name: "x_ribs", label: "Ribs", description: "Renforts de structure", icon: <IconTools className="w-5 h-5" />, color: "bg-zinc-500/10 text-zinc-400 border-zinc-500/30" },
        ],
    },
];

export default function BeycommunityPage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-12">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-900/40">
                            <IconDatabase className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-white">Beycommunity Admin</h1>
                            <p className="text-slate-300">Gestion de la base de données Beyblade X</p>
                        </div>
                    </div>
                </header>

                <div className="space-y-12">
                    {categories.map((category, idx) => (
                        <section key={idx}>
                            <div className="flex items-center gap-3 mb-6">
                                {category.icon}
                                <div>
                                    <h2 className="text-xl font-bold text-slate-100">{category.title}</h2>
                                    <p className="text-sm text-slate-400">{category.description}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {category.tables.map((table) => (
                                    <Link key={table.name} href={`/beycommunity/tables/${table.name}`} className="group outline-none">
                                        <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-500 transition-all duration-300 overflow-hidden relative">
                                            <div className={`absolute top-0 left-0 w-1 h-full ${table.color.split(" ")[0]}`} />
                                            <CardHeader className="pb-3">
                                                <div className="flex items-start justify-between">
                                                    <div className={`p-2 rounded-lg ${table.color} border mb-2`}>{table.icon}</div>
                                                    <Badge variant="outline" className="text-[10px] text-slate-300 border-slate-700 bg-slate-950/50 opacity-80 group-hover:opacity-100 transition-opacity">
                                                        {table.name}
                                                    </Badge>
                                                </div>
                                                <CardTitle className="text-lg group-hover:text-blue-400 transition-colors text-white">{table.label}</CardTitle>
                                                <CardDescription className="text-slate-400 text-xs">{table.description}</CardDescription>
                                            </CardHeader>
                                            <CardContent className="text-right pb-4">
                                                <span className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors">Gérer →</span>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
}
