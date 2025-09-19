import useShopifyStore from "../../shopifyStore";

export default function Video() {
    const { product, shopifyBoutique } = useShopifyStore();
    const metafieldKey = "id_video_youtube";
    const metafieldVideo = product?.metafields.nodes.find((mf) => mf.key === metafieldKey);
    const metafieldUrl = product?.metafields.nodes.find((mf) => mf.key === "url_video");

    if (metafieldVideo) {
        return (
            <iframe
                src={`https://www.youtube.com/embed/${metafieldVideo.value}`}
                allow="autoplay; encrypted-media"
                loading="lazy"
                title={`Vidéo de présentation de ${product?.title}`}
            ></iframe>
        );
    }
    if (metafieldUrl) {
        return <video src={metafieldUrl.value} muted controls title={`Vidéo de présentation de ${product?.title}`}></video>;
    }
}
