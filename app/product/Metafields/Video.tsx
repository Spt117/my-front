import useShopifyStore from "@/components/shopify/shopifyStore";
import { Card, CardHeader } from "@/components/ui/card";
import { cssCard } from "../util";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { Button } from "@/components/ui/button";
import { JSX, useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { deleteMetafield, updateMetafieldGid, updateMetafieldKey } from "../serverAction";
import { TMetafieldKeys } from "@/library/types/graph";
import { Trash2 } from "lucide-react";

export default function Video() {
    const [loading, setLoading] = useState(false);
    const [srcVideo, setSrcVideo] = useState("");
    const [url, setUrl] = useState(false);
    const [videoComponent, setVideoComponent] = useState<JSX.Element | null>(null);
    const { product, shopifyBoutique } = useShopifyStore();
    const metafieldVideo = product?.metafields.nodes.find((mf) => mf.key === "id_video_youtube");
    const metafieldUrl = product?.metafields.nodes.find((mf) => mf.key === "url_video");

    if (!product || !shopifyBoutique) return null;
    useEffect(() => {
        if (metafieldVideo) {
            setSrcVideo(metafieldVideo.value);
            const componenet = (
                <div className="w-full aspect-video h-full">
                    <iframe
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${metafieldVideo.value}`}
                        allow="autoplay; encrypted-media"
                        loading="lazy"
                        title={`Vidéo de présentation de ${product?.title}`}
                    />
                </div>
            );
            setVideoComponent(componenet);
        }
        if (metafieldUrl) {
            setSrcVideo(metafieldUrl.value);
            const componenet = (
                <video
                    src={metafieldUrl.value}
                    muted
                    controls
                    title={`Vidéo de présentation de ${product?.title}`}
                    className="w-full h-full object-cover"
                />
            );
            setVideoComponent(componenet);
        }
    }, [metafieldVideo, metafieldUrl, product]);

    const handleClick = async () => {
        setLoading(true);
        const prodcutGID = product.id;
        const metafieldGid = (metafieldUrl ? metafieldUrl.id : metafieldVideo?.id) as string;
        const domain = shopifyBoutique.domain;
        console.log(metafieldGid);
        if (!metafieldGid) return;
        try {
            const res = await updateMetafieldGid(domain, prodcutGID, metafieldGid, srcVideo);
            if (res?.error) toast.error(res.error);
            if (res?.message) toast.success(res.message);
        } catch (error) {
            toast.error("An error occurred while updating the metafield.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        const key: TMetafieldKeys = metafieldUrl ? "url_video" : "id_video_youtube";
        const domain = shopifyBoutique.domain;
        if (!key) return;
        try {
            const res = await deleteMetafield(domain, product.id, key);
            if (res?.error) toast.error(res.error);
            if (res?.message) toast.success(res.message);
        } catch (error) {
            toast.error("An error occurred while updating the metafield.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className={`${cssCard} overflow-hidden relative`}>
            {!videoComponent && (
                <CardHeader>
                    <h3>Video</h3>
                    <div className="flex items-center">
                        <Input
                            className="w-full"
                            type="text"
                            placeholder={url ? "url" : "Id Youtube"}
                            onChange={(e) => setSrcVideo(e.target.value)}
                            value={srcVideo}
                        />
                        <Switch checked={url} className="ml-4" onClick={() => setUrl(!url)} />
                    </div>
                    <Button disabled={loading} onClick={handleClick} className="mt-4">
                        Ajouter vidéo
                        <Spinner className={`w-4 h-4 ml-2 ${loading ? "inline-block" : "hidden"}`} />
                    </Button>
                </CardHeader>
            )}
            {!loading && <Trash2 className="absolute right-1 top-1 cursor-pointer" size={20} onClick={handleDelete} />}{" "}
            {loading && <Spinner className="absolute right-1 top-1" />} {videoComponent}
        </Card>
    );
}
