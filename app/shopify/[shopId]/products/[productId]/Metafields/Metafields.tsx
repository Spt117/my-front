import { Card, CardContent } from '@/components/ui/card';
import { TMetafield } from '@/library/types/graph';
import { cssCard } from '../util';
import Amazon from './Amazon';

export default function Metafields({ metafields }: { metafields: TMetafield[] }) {
    const keys = ['id_video_youtube', 'url_video', 'amazon_activate', 'asin', 'avg_rating', 'num_reviews', 'reviews'];
    const filteredMetafields = metafields.filter((mf) => !keys.includes(mf.key));

    if (filteredMetafields.length === 0) return null;

    return (
        <Card className={cssCard}>
            <CardContent className="flex flex-col justify-between h-full text-sm text-muted-foreground gap-2">
                <hr />
                <Amazon />
            </CardContent>
        </Card>
    );
}
