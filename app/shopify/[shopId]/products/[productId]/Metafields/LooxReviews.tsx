import { deleteLooxReview } from '@/components/shopify/serverActions';
import useShopifyStore from '@/components/shopify/shopifyStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TMetafield } from '@/library/types/graph';
import { Star, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { cssCard } from '../util';

interface ParsedReview {
    name: string;
    text: string;
    index: number;
}

export default function LooxReviews({ metafields }: { metafields: TMetafield[] }) {
    const { product, shopifyBoutique } = useShopifyStore();
    const router = useRouter();
    const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

    const avgRating = metafields.find((mf) => mf.key === 'avg_rating')?.value;
    const numReviews = metafields.find((mf) => mf.key === 'num_reviews')?.value;
    const rawReviewsHtml = metafields.find((mf) => mf.key === 'reviews')?.value;

    // Parse review HTML into array
    const reviews = useMemo(() => {
        if (!rawReviewsHtml) return [];
        const parser = new DOMParser();
        const doc = parser.parseFromString(rawReviewsHtml, 'text/html');
        const reviewElements = doc.querySelectorAll('.review');

        return Array.from(reviewElements).map((el, index) => ({
            name: el.querySelector('.name')?.textContent || 'Anonyme',
            text: el.querySelector('.review_text')?.textContent || '',
            index,
        }));
    }, [rawReviewsHtml]);

    const handleDelete = async (index: number) => {
        if (!product?.id || !shopifyBoutique?.domain) return;

        if (!confirm('Voulez-vous vraiment supprimer cet avis ?')) return;

        setDeletingIndex(index);
        try {
            const res = await deleteLooxReview(shopifyBoutique.domain, product.id, index);
            if (res?.response) {
                toast.success('Avis supprimé');
                router.refresh();
            } else {
                toast.error(res?.error || 'Erreur lors de la suppression');
            }
        } catch (error) {
            toast.error('Erreur serveur');
        } finally {
            setDeletingIndex(null);
        }
    };

    if (!avgRating && !numReviews && reviews.length === 0) return null;

    return (
        <Card className={cssCard}>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    Avis Clients Loox
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                    {avgRating && (
                        <div className="flex flex-col">
                            <span className="text-2xl font-bold">{avgRating} / 5</span>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Note moyenne</span>
                        </div>
                    )}
                    {numReviews && (
                        <div className="flex flex-col border-l pl-4">
                            <span className="text-2xl font-bold">{numReviews}</span>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Avis total</span>
                        </div>
                    )}
                </div>

                {reviews.length > 0 && (
                    <div className="mt-2 border-t pt-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3">
                        {reviews.map((rev) => (
                            <div key={rev.index} className="group relative border-bottom last:border-0 pb-3 border-slate-100 last:pb-0">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="font-semibold text-sm text-slate-800">{rev.name}</div>
                                        <div className="text-sm text-slate-600 mt-1 leading-relaxed">{rev.text}</div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => handleDelete(rev.index)}
                                        disabled={deletingIndex === rev.index}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
