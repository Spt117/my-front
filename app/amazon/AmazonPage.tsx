"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IAmazonRecord, IAmazonRecordFull } from "@/library/pocketbase/AmazonService";
import { Globe, Package, Plus, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createMarketplace, toggleMarketplaceActive } from "./serverAction";

const defaultForm: IAmazonRecord = {
    marketplace: "",
    host: "",
    region: "",
    partnerTag: "",
    currency: "",
    countryCode: "",
    isActive: true,
};

export default function AmazonPage({ marketplaces }: { marketplaces: IAmazonRecordFull[] }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [togglingId, setTogglingId] = useState<string | null>(null);
    const [form, setForm] = useState<IAmazonRecord>({ ...defaultForm });

    const handleChange = (field: keyof IAmazonRecord, value: string | boolean) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!form.marketplace || !form.host || !form.region || !form.partnerTag || !form.currency || !form.countryCode) {
            toast.error("Veuillez remplir tous les champs");
            return;
        }
        setLoading(true);
        try {
            const res = await createMarketplace(form);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success(res.message);
                setForm({ ...defaultForm });
                setOpen(false);
                router.refresh();
            }
        } catch {
            toast.error("Erreur inattendue");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (mp: IAmazonRecordFull) => {
        setTogglingId(mp.id);
        try {
            const res = await toggleMarketplaceActive(mp.id, !mp.isActive);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success(res.message);
                router.refresh();
            }
        } catch {
            toast.error("Erreur inattendue");
        } finally {
            setTogglingId(null);
        }
    };

    const activeCount = marketplaces.filter((mp) => mp.isActive).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-slate-100 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/20">
                                <ShoppingCart className="h-6 w-6" />
                            </div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 bg-clip-text text-transparent">
                                Marketplaces Amazon
                            </h1>
                        </div>
                        <div className="flex items-center gap-2 ml-14">
                            <Badge variant="secondary" className="text-xs">{marketplaces.length} marketplace{marketplaces.length > 1 ? "s" : ""}</Badge>
                            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-xs">{activeCount} actif{activeCount > 1 ? "s" : ""}</Badge>
                        </div>
                    </div>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg shadow-orange-500/20 transition-all duration-300 cursor-pointer">
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter un marketplace
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Globe className="h-5 w-5 text-orange-500" />
                                    Nouveau marketplace
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3 pt-2">
                                <div className="grid grid-cols-2 gap-3">
                                    <Input placeholder="Marketplace (ex: amazon.fr)" value={form.marketplace} onChange={(e) => handleChange("marketplace", e.target.value)} className="col-span-2" />
                                    <Input placeholder="Host API" value={form.host} onChange={(e) => handleChange("host", e.target.value)} className="col-span-2" />
                                    <Input placeholder="Région (ex: eu-west-1)" value={form.region} onChange={(e) => handleChange("region", e.target.value)} />
                                    <Input placeholder="Partner Tag" value={form.partnerTag} onChange={(e) => handleChange("partnerTag", e.target.value)} />
                                    <Input placeholder="Devise (ex: €)" value={form.currency} onChange={(e) => handleChange("currency", e.target.value)} />
                                    <Input placeholder="Code pays (ex: fr)" value={form.countryCode} onChange={(e) => handleChange("countryCode", e.target.value)} />
                                </div>
                                <div className="flex items-center gap-3 py-1">
                                    <Switch checked={form.isActive} onCheckedChange={(checked) => handleChange("isActive", checked)} />
                                    <span className="text-sm text-muted-foreground">Activer le marketplace</span>
                                </div>
                                <Separator />
                                <Button onClick={handleSubmit} disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 cursor-pointer">
                                    {loading ? "Création..." : "Créer le marketplace"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Table */}
                <div className="rounded-xl border border-slate-200/80 bg-white/80 backdrop-blur-sm shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                                <TableHead className="font-semibold text-slate-600">Marketplace</TableHead>
                                <TableHead className="font-semibold text-slate-600">Host</TableHead>
                                <TableHead className="font-semibold text-slate-600">Région</TableHead>
                                <TableHead className="font-semibold text-slate-600">Partner Tag</TableHead>
                                <TableHead className="font-semibold text-slate-600">Devise</TableHead>
                                <TableHead className="font-semibold text-slate-600">Pays</TableHead>
                                <TableHead className="font-semibold text-slate-600 text-center">Statut</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {marketplaces.map((mp) => (
                                <TableRow key={mp.id} className="hover:bg-gradient-to-r hover:from-orange-50/50 hover:to-amber-50/50 transition-all duration-200 group">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-1.5 rounded-lg bg-orange-100 text-orange-600 group-hover:bg-orange-200 transition-colors">
                                                <Globe className="h-3.5 w-3.5" />
                                            </div>
                                            {mp.marketplace}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-600 text-sm font-mono">{mp.host}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-mono text-xs">{mp.region}</Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-600 text-sm">{mp.partnerTag}</TableCell>
                                    <TableCell className="text-center text-lg">{mp.currency}</TableCell>
                                    <TableCell>
                                        <span className="uppercase font-semibold text-xs tracking-wider text-slate-500">{mp.countryCode}</span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Switch
                                            checked={mp.isActive}
                                            onCheckedChange={() => handleToggleActive(mp)}
                                            disabled={togglingId === mp.id}
                                            className="cursor-pointer"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {marketplaces.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-16">
                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                            <Package className="h-10 w-10 text-slate-300" />
                                            <p className="text-sm">Aucun marketplace configuré</p>
                                            <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="cursor-pointer">
                                                <Plus className="h-3.5 w-3.5 mr-1.5" />
                                                Ajouter le premier
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
