import { Card, CardContent } from '@/components/ui/card';
import { ShoppingBag } from 'lucide-react';
import { cssCard } from '../util';
import Amazon from './Amazon';
import Precommande from './Precommande';

/**
 * Section regroupant les metafields Amazon et Précommande
 * Affichage toujours visible pour la gestion de l'affiliation et des précommandes
 */
export default function Metafields() {
    return (
        <Card className={cssCard}>
            <CardContent className="space-y-4">
                <h3 className="text-sm font-semibold flex items-center gap-2 text-gray-700">
                    <ShoppingBag size={16} />
                    Amazon & Précommande
                </h3>
                
                <Precommande />
                
                <hr className="border-gray-200" />
                
                <Amazon />
            </CardContent>
        </Card>
    );
}
