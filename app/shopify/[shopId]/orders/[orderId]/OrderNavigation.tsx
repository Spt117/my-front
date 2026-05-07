"use client";

import { searchOrders } from "@/components/shopify/orders/serverAction";
import { Spinner } from "@/components/ui/shadcn-io/spinner/index";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface Props {
    currentName: string;
    domain: string;
}

// Extrait le préfixe alpha + numéro depuis un nom de commande Shopify.
// Tolère le "#" optionnel : "#DE3127", "DE3127", "1234"...
function parseOrderName(name: string): { prefix: string; number: number } | null {
    const trimmed = name.replace(/^#/, "").trim();
    const match = trimmed.match(/^([A-Za-z]*)(\d+)$/);
    if (!match) return null;
    return { prefix: match[1], number: Number(match[2]) };
}

export default function OrderNavigation({ currentName, domain }: Props) {
    const router = useRouter();
    const params = useParams();
    const shopId = params.shopId as string;
    const [loading, setLoading] = useState<"prev" | "next" | null>(null);

    const parsed = parseOrderName(currentName);
    if (!parsed) return null;

    const prevName = `${parsed.prefix}${parsed.number - 1}`;
    const nextName = `${parsed.prefix}${parsed.number + 1}`;

    const navigateTo = async (targetName: string, direction: "prev" | "next") => {
        setLoading(direction);
        try {
            const orders = await searchOrders(domain, targetName);
            if (!orders || orders.length === 0) {
                toast.error(`Commande ${targetName} introuvable`);
                return;
            }
            const target = orders[0];
            router.push(`/shopify/${shopId}/orders/${target.legacyResourceId}`);
        } catch {
            toast.error("Erreur lors de la navigation");
        } finally {
            setLoading(null);
        }
    };

    const buttonClass =
        "inline-flex items-center justify-center w-7 h-7 rounded-md bg-white border border-gray-200 shadow-sm text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all";

    return (
        <div className="flex items-center gap-1.5">
            <button
                type="button"
                disabled={loading !== null}
                onClick={() => navigateTo(prevName, "prev")}
                title={`Commande précédente (${prevName})`}
                className={buttonClass}
                aria-label={`Aller à la commande ${prevName}`}
            >
                {loading === "prev" ? <Spinner className="w-3.5 h-3.5" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            <button
                type="button"
                disabled={loading !== null}
                onClick={() => navigateTo(nextName, "next")}
                title={`Commande suivante (${nextName})`}
                className={buttonClass}
                aria-label={`Aller à la commande ${nextName}`}
            >
                {loading === "next" ? <Spinner className="w-3.5 h-3.5" /> : <ChevronRight className="w-4 h-4" />}
            </button>
        </div>
    );
}
