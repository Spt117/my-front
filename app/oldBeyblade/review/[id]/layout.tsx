'use client';

import { getBeybladeProductById } from '@/app/oldBeyblade/model/product/middlewareProduct';
import { IBeybladeProduct } from '@/app/oldBeyblade/model/typesBeyblade';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';
import useBeybladeStore from '../../beybladeStore';
import useReviewStore from '../storeReview';

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const path = usePathname();
    const { item, setItem } = useReviewStore();
    const { generation } = useBeybladeStore();

    const handleGetReviewItem = async () => {
        const id = path.split('/').pop();
        if (!item && id) {
            const item = await getBeybladeProductById(generation, id);
            if (!item) {
                toast.error('Beyblade product not found.');
                return;
            }
            const itemUpdated: IBeybladeProduct = { ...item, generation: generation };
            setItem(itemUpdated);
        }
    };

    useEffect(() => {
        handleGetReviewItem();
    }, [path]);

    return <>{children}</>;
}
