import useShopifyStore from '@/components/shopify/shopifyStore';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { TableCell, TableRow } from '@/components/ui/table';
import { Eye } from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ShopifyCollection } from './utils';

export default function CollectionRow({ collection }: { collection: ShopifyCollection }) {
    const router = useRouter();
    const params = useParams();
    const { shopifyBoutique } = useShopifyStore();
    const [isHovered, setIsHovered] = useState(false);

    const handleRowClick = () => {
        const url = `/shopify/${params.shopId}/collections/${collection.id.replace('gid://shopify/Collection/', '')}`;
        router.push(url);
    };

    const collectionUrl = `https://${shopifyBoutique?.publicDomain}/collections/${collection.handle}`;

    return (
        <TableRow
            className="group h-16 hover:bg-slate-50/80 transition-all duration-200 cursor-pointer border-b border-slate-100"
            onClick={handleRowClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <TableCell className="p-0 border-none">
                <div className="flex items-center justify-center">
                    <Checkbox className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600" />
                </div>
            </TableCell>
            <TableCell className="py-2">
                <div className="relative w-12 h-12 rounded-lg overflow-hidden shadow-sm border border-slate-200 group-hover:shadow-md transition-shadow">
                    <Image
                        src={collection?.image?.src || '/no_image.png'}
                        alt={collection?.image?.altText || collection.title}
                        className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                        fill
                        sizes="48px"
                    />
                </div>
            </TableCell>
            <TableCell className="font-semibold text-slate-800 tracking-tight">{collection.title}</TableCell>
            <TableCell>
                {collection.resourcePublicationsV2?.nodes?.length > 0 ? (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium px-2.5 py-0.5 rounded-full">
                        Publié
                    </Badge>
                ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 font-medium px-2.5 py-0.5 rounded-full animate-pulse">
                        Brouillon
                    </Badge>
                )}
            </TableCell>
            <TableCell>
                <Badge
                    variant="secondary"
                    className={`font-medium px-2.5 py-0.5 rounded-full ${
                        collection.ruleSet ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200 font-medium'
                    }`}
                >
                    {collection.ruleSet ? 'Automatique' : 'Manuelle'}
                </Badge>
            </TableCell>
            <TableCell className="text-slate-500 font-mono text-xs">{collection.handle}</TableCell>
            <TableCell>
                <div className="flex items-center justify-end pr-4">
                    <a
                        onClick={(e) => e.stopPropagation()}
                        href={collectionUrl}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors group/link"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <Eye size={18} className={`transition-all duration-300 ${isHovered ? 'text-slate-600 opacity-100 scale-110' : 'text-transparent opacity-0'}`} />
                    </a>
                </div>
            </TableCell>
        </TableRow>
    );
}
