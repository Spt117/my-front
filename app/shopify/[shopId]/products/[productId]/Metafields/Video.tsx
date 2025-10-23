import CopyComponent from "@/components/Copy";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { Switch } from "@/components/ui/switch";
import { useDataProduct } from "@/library/hooks/useDataProduct";
import { TMetafieldKeys } from "@/library/types/graph";
import { Trash2 } from "lucide-react";
import { JSX, useEffect, useState } from "react";
import { toast } from "sonner";
import { deleteMetafield, updateMetafieldKey } from "../serverAction";
import { cssCard } from "../util";

export default function Video() {
    const [loading, setLoading] = useState(false);
    const [srcVideo, setSrcVideo] = useState("");
    const [url, setUrl] = useState(false);
    const [videoComponent, setVideoComponent] = useState<JSX.Element | null>(null);
    const { product, shopifyBoutique } = useShopifyStore();
    const metafieldVideo = product?.metafields.nodes.find((mf) => mf.key === "id_video_youtube");
    const metafieldUrl = product?.metafields.nodes.find((mf) => mf.key === "url_video");
    const { getProductData } = useDataProduct();

    if (!product || !shopifyBoutique) return null;
    useEffect(() => {
        if (metafieldVideo) {
            setSrcVideo(metafieldVideo.value);
            const component = (
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
            setVideoComponent(component);
        } else if (metafieldUrl) {
            setSrcVideo(metafieldUrl.value);
            const component = (
                <video
                    src={metafieldUrl.value}
                    muted
                    controls
                    title={`Vidéo de présentation de ${product?.title}`}
                    className="w-full h-full object-cover"
                />
            );
            setVideoComponent(component);
        } else {
            setVideoComponent(null);
            setSrcVideo("");
        }
    }, [metafieldVideo, metafieldUrl, product]);

    const handleClick = async () => {
        setLoading(true);
        const productGID = product.id;
        const key: TMetafieldKeys = url ? "url_video" : "id_video_youtube";
        const domain = shopifyBoutique.domain;
        try {
            const res = await updateMetafieldKey(domain, productGID, key, srcVideo);
            if (res?.error) toast.error(res.error);
            if (res?.message) {
                toast.success(res.message);
                await getProductData();
            }
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
            if (res?.message) {
                toast.success(res.message);
                await getProductData();
            }
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
            {!loading && (metafieldUrl || srcVideo) && (
                <Trash2 className="absolute right-1 top-1 cursor-pointer" size={20} onClick={handleDelete} />
            )}{" "}
            {loading && <Spinner className="absolute right-1 top-1" />}
            <>
                <CardTitle className="m-2 p-0 border-0 shadow-none flex items-center gap-2">
                    {!videoComponent && "Aucune vidéo associée"}
                    <p>
                        {metafieldUrl ? "URL: " : "ID: "} {srcVideo}
                    </p>
                    <CopyComponent contentToCopy={srcVideo} message={metafieldUrl ? "URL copiée" : "ID copié"} />
                </CardTitle>
                {videoComponent}
            </>
        </Card>
    );
}
