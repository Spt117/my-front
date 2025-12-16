'use client';

import { useCopy } from '@/library/hooks/useCopy';

interface Props {
    title: string;
}

export function ProductTitle({ title }: Props) {
    const { handleCopy } = useCopy();

    return (
        <h1
            onClick={() => handleCopy(title, 'Titre copié dans le presse-papier !')}
            className="text-4xl md:text-5xl font-black text-white leading-tight mb-4 cursor-pointer hover:text-gray-200 transition-all active:scale-[0.98] active:text-blue-400 select-none"
            title="Cliquer pour copier le titre"
        >
            {title}
        </h1>
    );
}
