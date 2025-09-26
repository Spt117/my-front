import { Card } from "@/components/ui/card";
import AddKeys from "./AddKeys";
import StatusKeys from "./StatusKeys";
import { statusKeys } from "./server";

export default async function HomeKeys() {
    const data = await statusKeys();

    return (
        <Card className="m-2 p-2">
            <AddKeys />
            <hr />
            <StatusKeys data={data} />
        </Card>
    );
}
