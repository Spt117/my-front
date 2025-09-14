"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { dataStock } from "./page";
import { getServer } from "@/library/utils/fetchServer";

export default function DataFront({ data }: { data: dataStock[] }) {
    const [loading, setLoading] = useState(false);
    const [stock, setStock] = useState<dataStock[]>(data);

    const resetStock = async () => {
        setLoading(true);
        try {
            const url = `http://localhost:9100/remove-stock`;
            const res = await getServer(url);
            console.log(res);

            setStock(res.response);
        } catch (error) {
            console.error("Erreur lors du reset du stock:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setStock(data);
    }, [data]);

    return (
        <div className="container mx-auto p-4">
            <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {stock.map((item, index) => (
                        <Card key={index} className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-gray-800">{item.domain}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600">
                                    <span className="font-medium">SKU:</span> {item.sku}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                <div className="flex justify-center mt-6">
                    <Button onClick={resetStock} disabled={loading} className="flex items-center gap-2 bg-primary hover:bg-primary/90 transition-colors">
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Chargement...
                            </>
                        ) : (
                            "Réinitialiser le stock"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
