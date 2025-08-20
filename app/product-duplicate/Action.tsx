"use client";

import Selecteur from "@/components/selecteur";
import { Input } from "@/components/ui/input";
import { boutiques } from "@/library/params/paramsShopify";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MultiSelect, MultiSelectOption } from "./Multiselect";

export default function Action() {
    const [origin, setOrigin] = useState<string | null>(null);

    const option2 = boutiques.map((boutique) => ({
        label: (
            <>
                <Image src={boutique.flag} alt={boutique.langue} width={20} height={20} className="inline mr-2" />
                {boutique.vendor}
            </>
        ),
        value: boutique.domain,
    })) as unknown as MultiSelectOption[];

    const option = boutiques.map((boutique) => boutique.domain);

    const onValueChange = (selectedOptions: string[]) => {
        console.log("Selected options:", selectedOptions);
    };

    useEffect(() => {
        console.log("Origin changed:", origin);
    }, [origin]);

    return (
        <>
            <Selecteur array={option2} value={origin} onChange={setOrigin} placeholder="Choisir l'origine" />
            <MultiSelect placeholder={"Choisir les boutiques"} options={option2} onValueChange={onValueChange} />
            <Input onChange={(e) => {}} placeholder="Id produit" className="w-full md:w-[300px] rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all" />
        </>
    );
}
