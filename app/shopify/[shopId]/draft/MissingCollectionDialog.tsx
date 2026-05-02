"use client";
import { createExtensionCollection } from "@/app/shopify/[shopId]/collections/server";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ProductGET } from "@/library/types/graph";
import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const KNOWN_BLOCS = ["Épée et Bouclier", "Écarlate et Violet", "Méga Évolution"] as const;
type Bloc = (typeof KNOWN_BLOCS)[number];

function detectBloc(tags: string[] | undefined): Bloc | "" {
    if (!tags?.length) return "";
    for (const tag of tags) {
        const lc = tag.toLowerCase();
        for (const bloc of KNOWN_BLOCS) {
            if (lc.includes(bloc.toLowerCase())) return bloc;
        }
    }
    return "";
}

function buildSeoTitle(title: string): string {
    return title ? `${title} - Cartes Pokémon` : "";
}

function buildSeoDescription(title: string, bloc: string): string {
    if (!title) return "";
    const prefix = bloc ? `Cliquez ici pour explorer la collection complète ${bloc} - ${title}` : `Cliquez ici pour explorer la collection complète ${title}`;
    return `${prefix} et obtenez tous les produits exclusifs, boosters, et cartes chromatiques rares.`;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    handle: string;
    suggestedTitle: string;
    product: ProductGET | null;
}

export default function MissingCollectionDialog({ open, onOpenChange, handle, suggestedTitle, product }: Props) {
    const { shopifyBoutique, canauxBoutique } = useShopifyStore();
    const router = useRouter();

    const detectedBloc = useMemo(() => detectBloc(product?.tags), [product]);

    const [title, setTitle] = useState(suggestedTitle);
    const [slug, setSlug] = useState(handle);
    const [bloc, setBloc] = useState<string>(detectedBloc);
    const [seoTitle, setSeoTitle] = useState(buildSeoTitle(suggestedTitle));
    const [seoDescription, setSeoDescription] = useState(buildSeoDescription(suggestedTitle, detectedBloc));
    const [submitting, setSubmitting] = useState(false);

    // Réinitialise les champs à chaque (ré)ouverture / changement de produit ciblé.
    useEffect(() => {
        if (!open) return;
        setTitle(suggestedTitle);
        setSlug(handle);
        setBloc(detectedBloc);
        setSeoTitle(buildSeoTitle(suggestedTitle));
        setSeoDescription(buildSeoDescription(suggestedTitle, detectedBloc));
    }, [open, suggestedTitle, handle, detectedBloc]);

    const regenerateSeo = () => {
        setSeoTitle(buildSeoTitle(title));
        setSeoDescription(buildSeoDescription(title, bloc));
    };

    const handleSubmit = async () => {
        if (!shopifyBoutique?.domain) return;
        if (!title.trim() || !slug.trim()) {
            toast.error("Le titre et le slug sont requis");
            return;
        }
        setSubmitting(true);
        try {
            const publicationGids = canauxBoutique.map((c) => c.id);
            const res = await createExtensionCollection(
                shopifyBoutique.domain,
                {
                    title: title.trim(),
                    handle: slug.trim(),
                    seo: { title: seoTitle.trim(), description: seoDescription.trim() },
                },
                publicationGids
            );
            if (res?.error) {
                toast.error(res.error);
                return;
            }
            toast.success(res?.message || "Collection créée");
            onOpenChange(false);
            router.refresh();
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors de la création de la collection");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => !submitting && onOpenChange(o)}>
            <DialogContent className="sm:max-w-[640px]">
                <DialogHeader>
                    <DialogTitle>Créer la collection manquante</DialogTitle>
                    <DialogDescription>
                        La description du produit pointe vers une collection inexistante. Crée-la ici (publiée automatiquement sur tous les canaux).
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="ext-title">Titre</Label>
                            <Input id="ext-title" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="ext-slug">Slug</Label>
                            <Input id="ext-slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
                        </div>
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
                            <Button type="button" size="sm" variant="ghost" onClick={regenerateSeo} className="h-7 text-xs">
                                <Sparkles size={12} className="mr-1" />
                                Régénérer SEO
                            </Button>
                        </div>
                        <Input id="ext-seo-title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="ext-seo-desc">Meta description</Label>
                        <Textarea id="ext-seo-desc" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={3} />
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Sera publiée sur {canauxBoutique.length} canal{canauxBoutique.length > 1 ? "s" : ""}.
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
