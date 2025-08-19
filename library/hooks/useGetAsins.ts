import useAsinStore from "@/components/asin/asinStore";
import { getAsinsAction } from "../models/asins/middlewareAsin";
import { TAsin } from "../models/asins/asinType";

export const useGetAsins = () => {
    const { setAsins } = useAsinStore();

    const getAsins = async () => {
        const data = await getAsinsAction();
        if (data && data.data) {
            const arr2: TAsin[][] = Object.values(
                data.data.reduce((acc: { [key: string]: TAsin[] }, item: TAsin) => {
                    (acc[item.asin] = acc[item.asin] || []).push(item);
                    return acc;
                }, {})
            );
            setAsins(arr2);
        }
    };

    return { getAsins };
};
