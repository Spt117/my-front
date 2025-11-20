import { SegmentParams } from "@/library/types/utils";

export default async function Page({ params }: { params: Promise<SegmentParams> }) {
    const p = (await params) as { shopId: string | number };

    return <h3>Shop</h3>;
}
