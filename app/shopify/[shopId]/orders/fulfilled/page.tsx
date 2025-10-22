import RefreshOders from "@/components/shopify/orders/RefreshOders";

export default async function Page() {
    return (
        <div className="container flex flex-col justify-center items-center">
            <RefreshOders boolArchived={true} />
        </div>
    );
}
