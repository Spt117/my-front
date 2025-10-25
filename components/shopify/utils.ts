import { SegmentParams } from "@/library/types/utils";

export interface LayoutPropsShopify {
    children: React.ReactNode;
    params: Promise<SegmentParams>;
}
