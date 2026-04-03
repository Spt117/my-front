"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { addYoutubeChannel, IYoutubeChannel, removeYoutubeChannel, toggleYoutubeChannel } from "./actions";

interface Props {
    initialChannels: IYoutubeChannel[];
}

export default function YouTubeChannels({ initialChannels }: Props) {
    const [channels, setChannels] = useState(initialChannels);
    const [url, setUrl] = useState("");
    const [channelName, setChannelName] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleAdd = () => {
        if (!url.trim()) {
            toast.error("URL YouTube requise");
            return;
        }

        startTransition(async () => {
            const res = await addYoutubeChannel(url, channelName || undefined);
            if (res.success) {
                toast.success("Chaine ajoutee");
                setUrl("");
                setChannelName("");
                // Force page reload to get fresh data from PocketBase
                window.location.reload();
            } else {
                toast.error(res.error || "Erreur");
            }
        });
    };

    const handleRemove = (recordId: string, chId: string) => {
        startTransition(async () => {
            const res = await removeYoutubeChannel(recordId, chId);
            if (res.success) {
                toast.success("Chaine supprimee");
                setChannels((prev) => prev.filter((c) => c.id !== recordId));
            } else {
                toast.error(res.error || "Erreur");
            }
        });
    };

    const handleToggle = (recordId: string, chId: string, newState: boolean) => {
        startTransition(async () => {
            const res = await toggleYoutubeChannel(recordId, chId, newState);
            if (res.success) {
                setChannels((prev) => prev.map((c) => (c.id === recordId ? { ...c, is_active: newState } : c)));
                toast.success(newState ? "Chaine activee" : "Chaine desactivee");
            } else {
                toast.error(res.error || "Erreur");
            }
        });
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "-";
        return new Date(dateStr).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="flex flex-col gap-6 p-4">
            <h1 className="text-2xl font-bold">Veille YouTube</h1>

            {/* Add channel form */}
            <Card>
                <CardContent className="flex flex-col gap-4 pt-6">
                    <h2 className="text-lg font-semibold">Ajouter une chaine</h2>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <Input
                            placeholder="URL, @handle ou nom (ex: ledevultime)"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="flex-1"
                        />
                        <Input
                            placeholder="Nom (optionnel, auto-detecte)"
                            value={channelName}
                            onChange={(e) => setChannelName(e.target.value)}
                            className="flex-1"
                        />
                        <Button onClick={handleAdd} disabled={isPending}>
                            {isPending ? "..." : "Ajouter"}
                        </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Collez l&apos;URL de la chaine YouTube (ex: youtube.com/@BeybladeAcademy). Le nom et le Channel ID sont detectes automatiquement.
                    </p>
                </CardContent>
            </Card>

            {/* Channels table */}
            <Card>
                <CardContent className="pt-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Chaine</TableHead>
                                <TableHead>Channel ID</TableHead>
                                <TableHead>Actif</TableHead>
                                <TableHead>Dernier envoi</TableHead>
                                <TableHead>Lease expire</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {channels.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        Aucune chaine surveillee
                                    </TableCell>
                                </TableRow>
                            )}
                            {channels.map((ch) => (
                                <TableRow key={ch.id}>
                                    <TableCell className="font-medium">{ch.channel_name}</TableCell>
                                    <TableCell className="font-mono text-xs">{ch.channel_id}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={ch.is_active}
                                            onCheckedChange={(checked) => handleToggle(ch.id, ch.channel_id, checked)}
                                            disabled={isPending}
                                        />
                                    </TableCell>
                                    <TableCell className="text-sm">{formatDate(ch.last_notified_at)}</TableCell>
                                    <TableCell className="text-sm">{formatDate(ch.lease_expires_at)}</TableCell>
                                    <TableCell>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleRemove(ch.id, ch.channel_id)}
                                            disabled={isPending}
                                        >
                                            Supprimer
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
