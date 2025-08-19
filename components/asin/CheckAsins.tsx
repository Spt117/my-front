import { useState } from "react";
import { Button } from "../ui/button";
import { Spinner } from "../ui/shadcn-io/spinner/index";
import { getServer } from "@/library/utils/fetchServer";

export default function CheckAsins() {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleCheck = async () => {
        setIsLoading(true);
        try {
            // Simulate an API call or check
            const uri = "http://localhost:9100/amazon/check-asins";
            const res = await getServer(uri);
            console.log(res);
        } catch (error) {
            console.error("Error during check:", error);
            alert("An error occurred while checking ASINs.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <Spinner className="h-6 w-6 animate-spin" />;
    else return <Button onClick={handleCheck}>Lancer un check</Button>;
}
