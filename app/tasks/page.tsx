import { veilleController } from "@/library/models/veille/veilleController";
import VeilleCollections from "./VeilleCollections";

export default async function Page() {
    const data = await veilleController().getVeillesByUser();
    return (
        <div>
            <VeilleCollections collections={data} />
        </div>
    );
}
