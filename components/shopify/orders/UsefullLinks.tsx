import { TDomainsShopify } from '@/params/paramsShopify';
import * as Flags from 'country-flag-icons/react/3x2';
import countries from 'i18n-iso-countries';
import Image from 'next/image';

export default function UsefullLinks({ domain, orderId, country }: { domain: TDomainsShopify; orderId: string; country: string }) {
    const colissimoUrl = `https://${domain}/admin/apps/colissimo-officiel/home?id=${orderId.split('/').pop()}`;
    const invoiceUrl = `https://${domain}/admin/apps/simple-invoice-1/orders/invoice/quick-edit?id=${orderId.split('/').pop()}`;
    const orderUrl = `https://${domain}/admin/orders/${orderId.split('/').pop()}`;

    const code = countries.getAlpha2Code(country, 'fr') || countries.getAlpha2Code(country, 'en');
    const FlagComponent = code ? Flags[code as keyof typeof Flags] : null;

    const classParent = 'flex items-center px-3 py-1.5 hover:bg-gray-50 transition-all duration-200 hover:scale-105 active:scale-95';

    return (
        <div className="flex items-center bg-white/40 backdrop-blur-md rounded-lg border border-gray-200/40 shadow-sm overflow-hidden group">
            <a href={orderUrl} target="_blank" rel="noopener noreferrer" title="Voir sur Shopify" className="border-r border-gray-100">
                <div className={classParent}>
                    <Image src="/shopify.png" alt="Shopify" width={18} height={18} className="object-contain" />
                </div>
            </a>
            <a href={colissimoUrl} target="_blank" rel="noopener noreferrer" title="Ouvrir Colissimo" className="border-r border-gray-100 relative group/colis">
                <div className={classParent}>
                    <Image src="/colissimo.png" alt="Colissimo" width={18} height={18} className="object-contain" />
                    {FlagComponent && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-2.5 shadow-[0_0_2px_rgba(0,0,0,0.2)] rounded-[1px] overflow-hidden border border-white translate-x-[2px] translate-y-[-2px]">
                            <FlagComponent title={country} />
                        </div>
                    )}
                </div>
            </a>
            <a href={invoiceUrl} target="_blank" rel="noopener noreferrer" title="Voir la facture">
                <div className={classParent}>
                    <Image src="/invoice.png" alt="Facture" width={18} height={18} className="object-contain" />
                </div>
            </a>
        </div>
    );
}
