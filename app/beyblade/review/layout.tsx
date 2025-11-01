import { beybladeController } from "../model/product/productController";
import FrontLayout from "./frontLayout";

export default async function Layout({ children }: { children: React.ReactNode }) {
    const data = await beybladeController("X").getBeybladeWithContentToReview();
    return <FrontLayout data={data}>{children}</FrontLayout>;
}
