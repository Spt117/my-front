import { Globe } from "lucide-react";
import Link from "next/link";
import { useAffiliationTask } from "./ContextTaskAffiliation";

export default function IsMyBooster() {
    const { task } = useAffiliationTask();

    return (
        <div className="px-4 pb-3">
            <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-blue-400" />
                    <Link href={`https://${task.marketplace}/dp/${task.asin}`} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        {task.marketplace}
                    </Link>
                </span>
                <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-gray-500" />
                    {task.website}
                </span>
            </div>
        </div>
    );
}
