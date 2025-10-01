"use client";
import Selecteur from "@/components/selecteur";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { TActivationType } from "@/library/models/tasksShopify/taskType";
import useTaskStore from "./storeTasks";
import DatePicker from "./DatePicker";
import usePriceStore from "../Prices/storePrice";
import { Input } from "@/components/ui/input";

export default function Tasks() {
    const { product, shopifyBoutique } = useShopifyStore();
    const { setTypeTask, typeTask, setParam, param } = useTaskStore();
    const { price, compareAtPrice } = usePriceStore();

    if (!product || !shopifyBoutique) return null;
    if (compareAtPrice === "0" || Number(compareAtPrice) <= Number(price)) return null;

    const array = [
        {
            label: "Par date",
            value: "timestamp",
        },
        {
            label: "Par quantité restante",
            value: "quantity",
        },
    ];

    const handleChange = (value: TActivationType) => {
        setTypeTask(value);
    };

    return (
        <div className="flex flex-col gap-3">
            <h5>Programmer la fin de la promotion</h5>
            <div className="flex flex-col gap-2 w-min">
                <Selecteur array={array} value={typeTask} placeholder="Test" onChange={handleChange} />
                {typeTask === "timestamp" && <DatePicker />}
                {typeTask === "quantity" && (
                    <Input
                        onChange={(e) => setParam(Number(e.target.value))}
                        className="w-full"
                        type="number"
                        min={1}
                        placeholder="Quantité restante"
                        value={param}
                    />
                )}
            </div>
        </div>
    );
}
