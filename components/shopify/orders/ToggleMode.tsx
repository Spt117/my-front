import { Switch } from "@/components/ui/switch";
import useOrdersStore from "./store";

export default function ToggleMode() {
    const { mode, setMode } = useOrdersStore();

    const toggleMode = () => {
        setMode(mode === "orders" ? "products" : "orders");
    };
    return (
        <div onClick={toggleMode} className="group cursor-pointer flex items-center justify-between gap-2 absolute top-5 left-20">
            <div className="flex items-center gap-2">
                <Switch checked={mode === "orders"} className="" />
            </div>
            <div className="relative flex items-center gap-2">
                <label className="cursor-pointer text-sm font-medium text-gray-700">{mode === "orders" ? "Commandes" : "Produits"}</label>
            </div>
        </div>
    );
}
