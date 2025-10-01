"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { fr, es } from "date-fns/locale";

export default function DatePicker() {
    const [date, setDate] = useState<Date>();

    useEffect(() => {
        console.log("Selected date:", date);
        console.log("timestamp:", date?.getTime());
        console.log("timestamp:", new Date().getTime());
    }, [date]);
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" data-empty={!date} className="data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal">
                    <CalendarIcon />
                    {date ? format(date, "PPP", { locale: fr }) : <span>Choisir une date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
                <Calendar disabled={{ before: new Date() }} mode="single" selected={date} onSelect={setDate} locale={fr} />
            </PopoverContent>
        </Popover>
    );
}
