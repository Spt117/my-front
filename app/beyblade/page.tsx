// import { PB_URL } from "@/library/utils/uri";
import BeybladeList from "./components/BeybladeList";
import { beybladeService } from "./supabase/beyblade-service";

export default async function PageBeyblade() {
    // Fetch products ordered by creation date, or other relevant sort
    const products = await beybladeService.getFullList();

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
            <div className="max-w-[1920px] mx-auto">
                <header className="mb-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 mb-4 animate-gradient-x">Beyblade X Database</h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">Manage your collection and Amazon listings efficiently.</p>
                </header>

                <BeybladeList products={products} pbUrl={process.env.NEXT_PUBLIC_SUPABASE_URL || ""} />
            </div>
        </div>
    );
}
