import Selecteur from "@/components/selecteur";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { TActivationType } from "@/library/models/tasksShopify/taskType";
import useTaskStore from "./storeTasks";
import DatePicker from "./DatePicker";

export default function Tasks() {
    const { product, shopifyBoutique } = useShopifyStore();
    const { setTypeTask, typeTask } = useTaskStore();

    if (!product || !shopifyBoutique) return null;

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
        <div>
            <h5>Programmer la fin de la promotion</h5>
            <Selecteur array={array} value={typeTask} placeholder="Test" onChange={handleChange} />
            <DatePicker />
        </div>
    );
}
