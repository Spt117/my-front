"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IAmazonRecord, IAmazonRecordFull } from "@/library/pocketbase/AmazonService";
import { Globe, Plus, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createMarketplace } from "./serverAction";

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

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ShoppingCart className="h-7 w-7 text-orange-500" />
                    <h1 className="text-2xl font-bold">Marketplaces Amazon</h1>
                    <Badge variant="secondary">{marketplaces.length}</Badge>
                </div>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Ajouter un marketplace</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                            <Input placeholder="Marketplace (ex: amazon.fr)" value={form.marketplace} onChange={(e) => handleChange("marketplace", e.target.value)} />
                            <Input placeholder="Host (ex: webservices.amazon.fr)" value={form.host} onChange={(e) => handleChange("host", e.target.value)} />
                            <Input placeholder="Région (ex: eu-west-1)" value={form.region} onChange={(e) => handleChange("region", e.target.value)} />
                            <Input placeholder="Partner Tag" value={form.partnerTag} onChange={(e) => handleChange("partnerTag", e.target.value)} />
                            <Input placeholder="Devise (ex: €)" value={form.currency} onChange={(e) => handleChange("currency", e.target.value)} />
                            <Input placeholder="Code pays (ex: fr)" value={form.countryCode} onChange={(e) => handleChange("countryCode", e.target.value)} />
                            <div className="flex items-center gap-3">
                                <Switch checked={form.isActive} onCheckedChange={(checked) => handleChange("isActive", checked)} />
                                <span className="text-sm">Actif</span>
                            </div>
                            <Separator />
                            <Button onClick={handleSubmit} disabled={loading} className="w-full">
                                {loading ? "Création..." : "Créer le marketplace"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Separator />

            {/* Table */}
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Marketplace</TableHead>
                        <TableHead>Host</TableHead>
                        <TableHead>Région</TableHead>
                        <TableHead>Partner Tag</TableHead>
                        <TableHead>Devise</TableHead>
                        <TableHead>Code pays</TableHead>
                        <TableHead>Statut</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {marketplaces.map((mp) => (
                        <TableRow key={mp.id}>
                            <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    {mp.marketplace}
                                </div>
                            </TableCell>
                            <TableCell>{mp.host}</TableCell>
                            <TableCell>{mp.region}</TableCell>
                            <TableCell>{mp.partnerTag}</TableCell>
                            <TableCell>{mp.currency}</TableCell>
                            <TableCell>{mp.countryCode}</TableCell>
                            <TableCell>
                                <Badge variant={mp.isActive ? "default" : "destructive"}>
                                    {mp.isActive ? "Actif" : "Inactif"}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                    {marketplaces.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                                Aucun marketplace configuré
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
