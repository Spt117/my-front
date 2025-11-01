import Image from "next/image";
import React from "react";

interface SelectFullProps {
    action: (selected: string) => void;
    options: { label: string | React.ReactNode; value: string }[];
    currentValue: string;
}

export default function SelectFull({ action, options, currentValue }: SelectFullProps) {
    const classBtn =
        "cursor-pointer min-w-[100px] w-max p-1 rounded-lg border-2 transition-all duration-50 flex items-center justify-center gap-2 hover:shadow-md ";

    return (
        <div className="flex gap-2 flex-wrap max-xl:hidden">
            {options.map((option) => (
                <button
                    key={option.value}
                    onClick={() => action(option.value)}
                    className={
                        classBtn +
                        `${
                            currentValue === option.value ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                        }`
                    }
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}
