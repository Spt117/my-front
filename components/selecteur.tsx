import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dispatch, SetStateAction } from "react";

interface SelecteurProps {
    value: string | null;
    onChange: Dispatch<SetStateAction<any>>;
    array: { label: React.ReactNode; value: string; disabled?: boolean }[];
    placeholder: string;
    disabled?: boolean;
}

export default function Selecteur({ value, onChange, array, placeholder, disabled }: SelecteurProps) {
    return (
        <div className="w-min bg-red-50">
            <Select value={value || ""} onValueChange={(m) => onChange(m)} disabled={disabled}>
                <SelectTrigger className="cursor-pointer w-full md:w-[200px] rounded-lg border-gray-200 bg-white shadow-sm hover:border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-gray-200 bg-white shadow-lg">
                    {array.map((option, index) => (
                        <SelectItem key={`${option.value}-${index}`} value={option.value} className="hover:bg-blue-50 hover:text-blue-700 cursor-pointer px-3 py-2 transition-colors" disabled={option.disabled}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
