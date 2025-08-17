import AddAsin from "@/components/asin/add-asin";
import Asins from "@/components/asin/asins";

export default function Page() {
    return (
        <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:p-6">
            <AddAsin />
            <hr />
            <Asins />
        </div>
    );
}
