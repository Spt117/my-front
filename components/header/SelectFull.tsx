import React from 'react';

interface SelectFullProps {
    action: (selected: string) => void;
    options: { label: string | React.ReactNode; value: string; count?: number; preorderCount?: number }[];
    currentValue: string;
}

export default function SelectFull({ action, options, currentValue }: SelectFullProps) {
    const classBtn =
        'cursor-pointer min-w-[100px] w-max p-1 px-3 rounded-lg border-2 transition-all duration-75 flex flex-col items-center justify-center gap-1 hover:shadow-md relative ';

    return (
        <div className="flex gap-2 flex-wrap max-xl:hidden">
            {options.map((option) => (
                <button
                    key={option.value}
                    onClick={() => action(option.value)}
                    className={classBtn + `${currentValue === option.value ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                >
                    {option.label}
                    
                    {/* Badge Commandes Classiques (Rouge) */}
                    {option.count !== undefined && option.count > 0 && (
                        <div 
                            className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 border-2 border-white shadow-sm z-20" 
                            title={`${option.count} commande(s) classique(s)`}
                        >
                            {option.count}
                        </div>
                    )}

                    {/* Badge Précommandes (Bleu) */}
                    {option.preorderCount !== undefined && option.preorderCount > 0 && (
                        <div 
                            className={`absolute bg-blue-600 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5 border-2 border-white shadow-sm z-10 transition-all ${
                                option.count && option.count > 0 
                                    ? 'top-3 -right-2' // Légère superposition si le rouge existe
                                    : '-top-2 -right-2'
                            }`}
                            title={`${option.preorderCount} précommande(s) en attente`}
                        >
                            {option.preorderCount}
                        </div>
                    )}
                </button>
            ))}
        </div>
    );
}
