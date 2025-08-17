import useAsinStore from "@/components/asin/asinStore";
import { getAsinsAction } from "../models/asins/middlewareAsin";

export const useGetAsins = () => {
    const { setAsins } = useAsinStore();

    const getAsins = async () => {
        const data = await getAsinsAction();
        if (data && data.data) {
            setAsins(data.data);
        }
    };

    return { getAsins };
};
