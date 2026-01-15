import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dispatch, SetStateAction } from "react";

interface SelecteurProps {
    value: string | null;
    onChange: Dispatch<SetStateAction<any>>;
    array: { label: React.ReactNode; value: string; disabled?: boolean }[];
    placeholder: string;
    disabled?: boolean;
    className?: string;
}

export default function Selecteur({ value, onChange, array, placeholder, disabled, className }: SelecteurProps) {
    return (
        <div className={className}>
            <Select value={value || ""} onValueChange={(m) => onChange(m)} disabled={disabled}>
                <SelectTrigger className="cursor-pointer w-full rounded-lg border-gray-200 bg-white shadow-sm hover:border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent className="z-[200] rounded-lg border-gray-200 bg-white shadow-lg">
                    {array.map((option, index) => (
                        <SelectItem
                            key={`${option.value}-${index}`}
                            value={option.value}
                            className="hover:bg-blue-50 hover:text-blue-700 cursor-pointer px-3 py-2 transition-colors"
                            disabled={option.disabled}
                        >
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
