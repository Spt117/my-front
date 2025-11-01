import { IArena, IBeyblade, ILauncher } from "@/app/beyblade/model/typesBeyblade";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useBeybladeStore from "../beybladeStore";
import Arena from "./Arena";
import Beyblade from "./Beyblade";
import Launcher from "./Launcher";

export default function Content() {
    const { beybladeProduct } = useBeybladeStore();

    const getContentType = (item: IBeyblade | ILauncher | IArena): string => {
        if ("parts" in item) return "beyblade";
        if ("type" in item && (item.type === "string" || item.type === "ripcord")) return "launcher";
        return "arena";
    };
    const getContentName = (item: IBeyblade | ILauncher | IArena): string => {
        if ("name" in item) return item.name;
        return item.productCode;
    };

    return (
        <TabsContent value="content" className="space-y-6">
            <Tabs defaultValue="beyblade">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="beyblade">Beyblade</TabsTrigger>
                    <TabsTrigger value="launcher">Launcher</TabsTrigger>
                    <TabsTrigger value="arena">Arena</TabsTrigger>
                </TabsList>

                <Beyblade />
                <Launcher />
                <Arena />
            </Tabs>
        </TabsContent>
    );
}
