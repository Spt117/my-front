import { Switch } from "@/components/ui/switch";
import useVariantStore from "./store";

export default function ToggleMode() {
    const { mode, setMode } = useVariantStore();

    const toggleMode = () => {
        setMode(mode === "now" ? "later" : "now");
    };
    return (
        <div onClick={toggleMode} className="group cursor-pointer flex items-center gap-2">
            <div className="flex items-center gap-2">
                <Switch checked={mode === "now"} className="" />
            </div>
            <div className="relative flex items-center gap-2">
                <label className="cursor-pointer text-sm font-medium text-gray-700">{mode === "now" ? "Now" : "Later"}</label>
            </div>
        </div>
    );
}
