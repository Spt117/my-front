import { TDomainsShopify } from "@/library/params/paramsShopify";
import Image from "next/image";

export default function UsefullLinks({ domain, orderId, px }: { domain: TDomainsShopify; orderId: string; px: string }) {
    const colissimoUrl = `https://${domain}/admin/apps/colissimo-officiel/home?id=${orderId.split("/").pop()}`;
    const invoiceUrl = `https://${domain}/admin/apps/simple-invoice-1/orders/invoice/quick-edit?id=${orderId.split("/").pop()}`;
    const orderUrl = `https://${domain}/admin/orders/${orderId.split("/").pop()}`;

    const classParent =
        "flex items-center px-4 py-2 hover:bg-gray-50 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm h-full";
    const classDiv = `w-[${px}] h-[${px}] relative bg-green `;
    return (
        <>
            <a href={orderUrl} target="_blank" rel="noopener noreferrer">
                <div className={classParent}>
                    <div className={classDiv}>
                        <Image src="/shopify.png" alt="Shopify" fill sizes={px} className="object-contain" />
                    </div>
                </div>
            </a>
            <a href={colissimoUrl} target="_blank" rel="noopener noreferrer">
                <div className={classParent}>
                    <div className={classDiv}>
                        <Image src="/colissimo.png" alt="Colissimo" fill sizes={px} className="object-contain" />
                    </div>
                </div>
            </a>
            <a href={invoiceUrl} target="_blank" rel="noopener noreferrer">
                <div className={classParent}>
                    <div className={classDiv}>
                        <Image src="/invoice.png" alt="invoice" fill sizes={px} className="object-contain" />
                    </div>
                </div>
            </a>
        </>
    );
}
