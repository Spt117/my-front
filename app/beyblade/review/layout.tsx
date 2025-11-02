import { getProductsToreview } from "@/app/beyblade/model/product/middlewareProduct";
import FrontLayout from "./frontLayout";

export default async function Layout({ children }: { children: React.ReactNode }) {
    const data = await getProductsToreview();
    return <FrontLayout data={data}>{children}</FrontLayout>;
}
