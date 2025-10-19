import { TDomainsShopify, boutiqueFromDomain, boutiques } from "@/params/paramsShopify";
import Image from "next/image";
import { useRouter } from "next/navigation";
import useShopifyStore from "../shopify/shopifyStore";

export default function SelectFull() {
    const { shopifyBoutique, setShopifyBoutique, setProduct, product } = useShopifyStore();
    const router = useRouter();

    const handleSelectOrigin = (domain: TDomainsShopify) => {
        const boutique = boutiqueFromDomain(domain);
        setShopifyBoutique(boutique);
        if (product) {
            setProduct(null);
            router.push("/product");
        }
    };

    const classBtn = "cursor-pointer w-max p-1 rounded-lg border-2 transition-all duration-50 flex items-center gap-2 hover:shadow-md ";

    return (
        <div className="flex gap-2 flex-wrap max-xl:hidden">
            {boutiques.map((boutique) => (
                <button key={boutique.domain} onClick={() => handleSelectOrigin(boutique.domain)} className={classBtn + `${shopifyBoutique?.domain === boutique.domain ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <Image src={boutique.flag} alt={boutique.langue} width={24} height={24} />
                    <span className="text-sm font-medium text-center">{boutique.vendor}</span>
                </button>
            ))}
        </div>
    );
}
