"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { useState } from "react";
import useTaskStore from "./storeTasks";

export default function DatePicker() {
    const [open, setOpen] = useState(false);
    const { setParam, param, tasks } = useTaskStore();

    const handleSelect = (selectedDate: Date | undefined) => {
        if (selectedDate) {
            const timestamp = new Date(selectedDate).getTime();
            setParam(timestamp);
            setOpen(false);
        }
    };

    const bool = tasks.find((task) => task.activation === "timestamp") ? true : false;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button disabled={bool} variant="outline" className={`w-full justify-start text-left font-normal ${!param ? "text-muted-foreground" : ""}`}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {param ? format(new Date(param), "PPP", { locale: fr }) : <span>Choisir une date</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={new Date(param)} onSelect={handleSelect} disabled={{ before: new Date() }} locale={fr} />
            </PopoverContent>
        </Popover>
    );
}
