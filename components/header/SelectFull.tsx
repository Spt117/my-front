import React from 'react';

interface SelectFullProps {
    action: (selected: string) => void;
    options: { label: string | React.ReactNode; value: string; count?: number }[];
    currentValue: string;
}

export default function SelectFull({ action, options, currentValue }: SelectFullProps) {
    const classBtn =
        'cursor-pointer min-w-[100px] w-max p-1 px-3 rounded-lg border-2 transition-all duration-50 flex flex-col items-center justify-center gap-1 hover:shadow-md relative ';

    return (
        <div className="flex gap-2 flex-wrap max-xl:hidden">
            {options.map((option) => (
                <button
                    key={option.value}
                    onClick={() => action(option.value)}
                    className={classBtn + `${currentValue === option.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                    {option.label}
                    {option.count !== undefined && option.count > 0 && (
                        <div className="absolute -bottom-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 border-2 border-white shadow-sm">
                            {option.count}
                        </div>
                    )}
                </button>
            ))}
        </div>
    );
}
