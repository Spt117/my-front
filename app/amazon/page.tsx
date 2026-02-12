import { amazonService } from "@/library/pocketbase/AmazonService";
import AmazonPage from "./AmazonPage";

export default async function Page() {
    const marketplaces = await amazonService.getAll();
    return <AmazonPage marketplaces={marketplaces} />;
}
