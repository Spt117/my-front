import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TMarketPlace } from "@/library/models/asins/asinType";
import { Dispatch, SetStateAction } from "react";

interface SelecteurProps {
    value: string | null;
    onChange: Dispatch<SetStateAction<TMarketPlace | string | null>>;
    array: { label: React.ReactNode; value: string }[];
    placeholder: string;
}

export default function Selecteur({ value, onChange, array, placeholder }: SelecteurProps) {
    return (
        <div className="w-full md:w-[300px]">
            <Select value={value || ""} onValueChange={(m) => onChange(m)}>
                <SelectTrigger className="cursor-pointer w-full md:w-[200px] rounded-lg border-gray-200 bg-white shadow-sm hover:border-gray-300 focus:ring-2 focus:ring-blue-500 transition-all">
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent className="rounded-lg border-gray-200 bg-white shadow-lg">
                    {array.map((option, index) => (
                        <SelectItem key={`${option.value}-${index}`} value={option.value} className="hover:bg-blue-50 hover:text-blue-700 cursor-pointer px-3 py-2 transition-colors">
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
