"use client";
import Selecteur from "@/components/selecteur";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { TActivationType } from "@/library/models/tasksShopify/taskType";
import useTaskStore from "./storeTasks";
import DatePicker from "./DatePicker";
import usePriceStore from "../Prices/storePrice";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

export default function Tasks() {
    const { product, shopifyBoutique } = useShopifyStore();
    const { setTypeTask, typeTask, setParam, param, tasks } = useTaskStore();
    const { price, compareAtPrice } = usePriceStore();

    useEffect(() => {
        const typeExist = tasks.find((task) => task.activation === "timestamp");
        if (typeExist) setTypeTask("quantity");
    }, [tasks]);

    if (!product || !shopifyBoutique) return null;
    if (compareAtPrice === "0" || Number(compareAtPrice) <= Number(price)) return null;

    const array = [
        {
            label: "Par date",
            value: "timestamp",
            disabled: tasks.find((task) => task.activation === "timestamp") ? true : false,
        },
        {
            label: "Par quantité restante",
            value: "quantity",
            disabled: tasks.find((task) => task.activation === "quantity") ? true : false,
        },
    ];

    const handleChange = (value: TActivationType) => {
        setTypeTask(value);
    };

    return (
        <div className="flex flex-col gap-3">
            <h5>Programmer la fin de la promotion</h5>
            <div className="flex flex-col gap-2 w-min">
                <Selecteur array={array} value={typeTask} placeholder="Test" onChange={handleChange} disabled={tasks.length === 2} />
                {typeTask === "timestamp" && <DatePicker />}
                {typeTask === "quantity" && <Input onChange={(e) => setParam(Number(e.target.value))} className="w-full" type="number" min={1} placeholder="Quantité restante" value={param} />}
            </div>
        </div>
    );
}
