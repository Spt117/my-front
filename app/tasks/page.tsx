import { veilleController } from "@/library/models/veille/veilleController";
import VeilleCollections from "./VeilleCollections";

export default async function Page() {
    const data = await veilleController().getVeillesByUser();
    const hasntCollections = data.filter((c) => !c.website || c.website.length === 0);
    return (
        <div>
            <VeilleCollections collections={hasntCollections} />
        </div>
    );
}
