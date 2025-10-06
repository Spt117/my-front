import { TVeille } from "@/library/models/veille/veilleType";
import { boutiques } from "@/library/params/paramsShopify";
import { sitesWordpress } from "@/library/params/paramsWordpress";
import VeilleCollection from "./VeilleCollection";

export default function VeilleCollections({ collections }: { collections: TVeille[] }) {
    return (
        <div>
            {collections.map((collection) => (
                <VeilleCollection key={collection._id} collection={collection} />
            ))}
        </div>
    );
}
