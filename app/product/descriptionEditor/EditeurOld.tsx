"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "@tiptap/extension-image";
import ListItem from "@tiptap/extension-list-item";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Copy, Eye } from "lucide-react";
import { useState } from "react";
import { MenuBar } from "./MenuBar";
import useEditorHtmlStore from "./storeEditor";
import { formatHTML, ImageInline, LinkStrict } from "./utils";

// ⬇️ Dans ShopifyProductEditor.tsx — AJOUTE ces extensions au-dessus du composant
const PlainListItem = ListItem.extend({
    name: "listItem",
    content: "inline*", // empêche l'injection de <p> dans les <li>
    parseHTML() {
        return [{ tag: "li" }];
    },
    renderHTML({ HTMLAttributes }: { HTMLAttributes: string }) {
        return ["li", HTMLAttributes, 0];
    },
});

const ImagePlus = Image.extend({
    addAttributes() {
        return {
            ...this.parent?.(),
            style: {
                default: null,
                parseHTML: (el) => el.getAttribute("style"),
                renderHTML: (attrs) => (attrs.style ? { style: attrs.style } : {}),
            },
        };
    },
});

export default function ShopifyProductEditor() {
    const [htmlOutput, setHtmlOutput] = useState("");
    const [copied, setCopied] = useState(false);
    const { showCodeView } = useEditorHtmlStore();
    const { product } = useShopifyStore();
    console.log("Product in Editor:", product);

    // ⬇️ Dans ShopifyProductEditor.tsx — REMPLACE l'initialisation de `useEditor(...)` par :
    // ⬇️ ShopifyProductEditor.tsx — DANS useEditor(...), REMPLACE Link par LinkStrict et ImagePlus/Image par ImageInline
    const editor = useEditor(
        {
            immediatelyRender: false,
            extensions: [
                StarterKit.configure({ listItem: false }),
                PlainListItem, // (ta version qui évite <p> dans <li>)
                Underline,
                LinkStrict, // <= ici
                TextAlign.configure({ types: ["heading", "paragraph"] }),
                ImageInline, // <= ici
            ],
            content: product?.descriptionHtml || "<p>Commencez à écrire la description du produit...</p>",
            editorProps: {
                attributes: {
                    class: "prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4",
                },
            },
            parseOptions: { preserveWhitespace: "full" },
        },
        [product]
    );

    const generateHTML = () => {
        if (editor) {
            const html = editor.getHTML();
            setHtmlOutput(formatHTML(html)); // indentation identique/propore à l'entrée
        }
    };

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(htmlOutput);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const loadFromShopify = () => {
        const sampleDescription = `<h2>Description du produit</h2><p>Ceci est un exemple de description chargée depuis Shopify.</p><ul><li>Point 1</li><li>Point 2</li></ul>`;
        if (editor) {
            editor.commands.setContent(sampleDescription);
        }
    };

    if (!product || !editor) return null;
    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Éditeur WYSIWYG</CardTitle>
                        <div className="flex gap-2">
                            <Button onClick={loadFromShopify} variant="outline" size="sm">
                                Charger exemple
                            </Button>
                            <Button onClick={generateHTML} variant="default" size="sm">
                                <Eye className="w-4 h-4 mr-2" />
                                Générer HTML
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <MenuBar editor={editor} />
                        <div className="bg-white">
                            {showCodeView ? (
                                <textarea
                                    className="w-full min-h-[400px] p-4 font-mono text-sm border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formatHTML(editor?.getHTML() || "")}
                                    onChange={(e) => {
                                        if (editor) {
                                            editor.commands.setContent(e.target.value);
                                        }
                                    }}
                                    placeholder="Code HTML..."
                                />
                            ) : (
                                <EditorContent editor={editor} />
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Résultat pour Shopify</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="preview" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="preview">Aperçu</TabsTrigger>
                                <TabsTrigger value="html">Code HTML</TabsTrigger>
                            </TabsList>

                            <TabsContent value="preview" className="mt-4">
                                <div className="border rounded-lg p-6 bg-white min-h-[300px]">
                                    {htmlOutput ? (
                                        <div
                                            className="prose prose-sm max-w-none"
                                            dangerouslySetInnerHTML={{ __html: htmlOutput }}
                                        />
                                    ) : (
                                        <p className="text-slate-400 text-center py-20">
                                            Cliquez sur Générer HTML pour voir l'aperçu
                                        </p>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="html" className="mt-4">
                                <div className="relative">
                                    <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-x-auto text-xs min-h-[300px]">
                                        <code>{htmlOutput || "// Cliquez sur Générer HTML pour voir le code"}</code>
                                    </pre>
                                    {htmlOutput && (
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="absolute top-2 right-2"
                                            onClick={copyToClipboard}
                                        >
                                            <Copy className="w-4 h-4 mr-2" />
                                            {copied ? "Copié !" : "Copier"}
                                        </Button>
                                    )}
                                </div>

                                {htmlOutput && (
                                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <p className="text-sm text-blue-900 font-semibold mb-2">Pour utiliser dans Shopify :</p>
                                        <ol className="text-sm text-blue-800 space-y-1 ml-4 list-decimal">
                                            <li>Copiez le code HTML ci-dessus</li>
                                            <li>Allez dans Shopify Admin, Produits, votre produit</li>
                                            <li>Dans le champ Description, cliquez sur Afficher le HTML</li>
                                            <li>Collez le code HTML</li>
                                            <li>Enregistrez le produit</li>
                                        </ol>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Guide d'utilisation</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-slate-900 mb-3">Raccourcis clavier</h4>
                            <div className="space-y-2 text-sm text-slate-600">
                                <div className="flex items-center gap-2">
                                    <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">Ctrl+B</kbd>
                                    <span>Gras</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">Ctrl+I</kbd>
                                    <span>Italique</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">Ctrl+U</kbd>
                                    <span>Souligné</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">Ctrl+Z</kbd>
                                    <span>Annuler</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <kbd className="px-2 py-1 bg-slate-100 rounded text-xs font-mono">Ctrl+Y</kbd>
                                    <span>Rétablir</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h4 className="font-semibold text-slate-900 mb-3">Bonnes pratiques</h4>
                            <ul className="text-sm text-slate-600 space-y-2">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 mt-0.5">✓</span>
                                    <span>Utilisez des titres H2 et H3 pour structurer</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 mt-0.5">✓</span>
                                    <span>Les listes rendent la lecture plus facile</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 mt-0.5">✓</span>
                                    <span>Évitez les textes trop longs sans aération</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 mt-0.5">✓</span>
                                    <span>Testez l'aperçu avant d'exporter</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-600 mt-0.5">✓</span>
                                    <span>Le HTML généré est propre et compatible Shopify</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
