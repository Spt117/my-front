'use client';
import { useEffect } from 'react';
import { IBeybladeProduct } from '../../oldBeyblade/model/typesBeyblade';
import useReviewStore from './storeReview';

interface FrontLayoutProps {
    children: React.ReactNode;
    data: IBeybladeProduct[];
}
export default function FrontLayout({ children, data }: FrontLayoutProps) {
    const { setReviewItems } = useReviewStore();

    useEffect(() => {
        setReviewItems(data);
    }, [data]);
    return <>{children}</>;
}
