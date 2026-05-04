"use client";
import { createExtensionCollection } from "@/app/shopify/[shopId]/collections/server";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const KNOWN_BLOCS = ["Épée et Bouclier", "Écarlate et Violet", "Méga Évolution"] as const;

// Slugify aligné sur pokemon/src/lib/utils.ts (retire les accents, espaces -> tirets,
// caractères non alphanumériques fusionnés, pas de tirets en bord).
function slugify(input: string): string {
    return input
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "-")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

function buildSeoTitle(name: string): string {
    return name ? `${name} - Cartes Pokémon` : "";
}

function buildSeoDescription(name: string, bloc: string): string {
    if (!name) return "";
    const prefix = bloc ? `Cliquez ici pour explorer la collection complète ${bloc} - ${name}` : `Cliquez ici pour explorer la collection complète ${name}`;
    return `${prefix} et obtenez tous les produits exclusifs, boosters, et cartes chromatiques rares.`;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function CreateExtensionDialog({ open, onOpenChange }: Props) {
    const { shopifyBoutique, canauxBoutique } = useShopifyStore();
    const router = useRouter();

    const [extensionName, setExtensionName] = useState("");
    const [slug, setSlug] = useState("");
    const [bloc, setBloc] = useState<string>("");
    const [seoTitle, setSeoTitle] = useState("");
    const [seoDescription, setSeoDescription] = useState("");

    // Le nom de l'extension pilote les autres champs tant que l'utilisateur
    // ne les a pas édités à la main. Une fois touchés, on respecte l'override.
    const [slugTouched, setSlugTouched] = useState(false);
    const [seoTitleTouched, setSeoTitleTouched] = useState(false);
    const [seoDescTouched, setSeoDescTouched] = useState(false);

    const [submitting, setSubmitting] = useState(false);

    // Réinitialise tout à chaque (ré)ouverture.
    useEffect(() => {
        if (!open) return;
        setExtensionName("");
        setSlug("");
        setBloc("");
        setSeoTitle("");
        setSeoDescription("");
        setSlugTouched(false);
        setSeoTitleTouched(false);
        setSeoDescTouched(false);
    }, [open]);

    // Auto-pilotage des champs dérivés depuis le nom de l'extension et le bloc.
    useEffect(() => {
        if (!slugTouched) setSlug(slugify(extensionName));
        if (!seoTitleTouched) setSeoTitle(buildSeoTitle(extensionName));
        if (!seoDescTouched) setSeoDescription(buildSeoDescription(extensionName, bloc));
    }, [extensionName, bloc, slugTouched, seoTitleTouched, seoDescTouched]);

    const regenerateAll = () => {
        setSlug(slugify(extensionName));
        setSeoTitle(buildSeoTitle(extensionName));
        setSeoDescription(buildSeoDescription(extensionName, bloc));
        setSlugTouched(false);
        setSeoTitleTouched(false);
        setSeoDescTouched(false);
    };

    const handleSubmit = async () => {
        if (!shopifyBoutique?.domain) return;
        const name = extensionName.trim();
        const handle = slug.trim();
        if (!name || !handle) {
            toast.error("Le nom de l'extension et le slug sont requis");
            return;
        }
        setSubmitting(true);
        try {
            const publicationGids = canauxBoutique.map((c) => c.id);
            const res = await createExtensionCollection(
                shopifyBoutique.domain,
                {
                    title: name,
                    handle,
                    seo: { title: seoTitle.trim(), description: seoDescription.trim() },
                    ruleSet: {
                        appliedDisjunctively: false,
                        rules: [{ column: "TAG", relation: "EQUALS", condition: name }],
                    },
                },
                publicationGids,
            );
            if (res?.error) {
                toast.error(res.error);
                return;
            }
            toast.success(res?.message || "Extension créée");
            onOpenChange(false);
            router.refresh();
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors de la création de l'extension");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !submitting && onOpenChange(o)}>
            <DialogContent className="sm:max-w-[640px]">
                <DialogHeader>
                    <DialogTitle>Créer une extension</DialogTitle>
                    <DialogDescription>
                        Crée une collection automatisée (Balise = nom de l&apos;extension) publiée sur tous les canaux. Les champs dérivés se remplissent automatiquement et restent éditables.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="ext-name">Nom de l&apos;extension</Label>
                        <Input
                            id="ext-name"
                            value={extensionName}
                            onChange={(e) => setExtensionName(e.target.value)}
                            placeholder="Ex : Clash des Rebelles"
                            autoFocus
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="ext-slug">Slug</Label>
                        <Input
                            id="ext-slug"
                            value={slug}
                            onChange={(e) => {
                                setSlug(e.target.value);
                                setSlugTouched(true);
                            }}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="ext-bloc">Bloc</Label>
                        <Select value={bloc} onValueChange={setBloc}>
                            <SelectTrigger id="ext-bloc">
                                <SelectValue placeholder="Sélectionner un bloc" />
                            </SelectTrigger>
                            <SelectContent>
                                {KNOWN_BLOCS.map((b) => (
                                    <SelectItem key={b} value={b}>
                                        {b}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="ext-seo-title">Meta title</Label>
                            <Button type="button" size="sm" variant="ghost" onClick={regenerateAll} className="h-7 text-xs">
                                <Sparkles size={12} className="mr-1" />
                                Régénérer SEO
                            </Button>
                        </div>
                        <Input
                            id="ext-seo-title"
                            value={seoTitle}
                            onChange={(e) => {
                                setSeoTitle(e.target.value);
                                setSeoTitleTouched(true);
                            }}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="ext-seo-desc">Meta description</Label>
                        <Textarea
                            id="ext-seo-desc"
                            value={seoDescription}
                            onChange={(e) => {
                                setSeoDescription(e.target.value);
                                setSeoDescTouched(true);
                            }}
                            rows={3}
                        />
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Sera publiée sur {canauxBoutique.length} canal{canauxBoutique.length > 1 ? "s" : ""}. Règle automatique : produits ayant la balise <code className="rounded bg-slate-100 px-1">{extensionName.trim() || "<nom de l'extension>"}</code>.
                    </p>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
                        Annuler
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting}>
                        {submitting ? (
                            <>
                                <Loader2 size={16} className="mr-2 animate-spin" />
                                Création...
                            </>
                        ) : (
                            "Créer et publier"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
