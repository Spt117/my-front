"use client";
import useShopifyStore from "@/components/shopify/shopifyStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { MenuBar } from "./MenuBar";
import useEditorHtmlStore from "./storeEditor";
import { formatHTML, ImageInline, LinkStrict, PlainListItem } from "./utils";
import { useEffect, useState } from "react";

export default function ShopifyProductEditor() {
    const { showCodeView } = useEditorHtmlStore();
    const { product } = useShopifyStore();
    const [code, setCode] = useState("");

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
            // Remplace ton editorProps par celui-ci (on enlève le mousedown bloquant, on gère proprement via handleClick)
            editorProps: {
                attributes: {
                    class: "prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4",
                },
                handleClick: (_view, _pos, event) => {
                    const el = (event.target as HTMLElement) || null;

                    // Autorise l’ouverture volontaire (Ctrl/Cmd + clic)
                    if ((event as MouseEvent).metaKey || (event as MouseEvent).ctrlKey) {
                        return false;
                    }

                    if (el && el.closest("a[href]")) {
                        event.preventDefault(); // empêche la navigation
                        return true; // mais laisse le curseur/edit fonctionner
                    }
                    return false;
                },
                handleDOMEvents: {
                    // Laisse ProseMirror gérer le placement du curseur au mousedown
                    mousedown: (_view, _event) => false,
                },
            },
            parseOptions: { preserveWhitespace: "full" },
        },
        [product]
    );

    // Quand on passe en mode code, on prend un snapshot UNE FOIS (formaté) depuis l’éditeur
    useEffect(() => {
        if (showCodeView && editor) {
            setCode(formatHTML(editor.getHTML()));
        }
    }, [showCodeView, editor]);

    // Pendant la saisie, on applique au document TipTap avec un léger debounce
    useEffect(() => {
        if (!showCodeView || !editor) return;
        const id = setTimeout(() => {
            editor.commands.setContent(code, { emitUpdate: false }); // false = n’émet pas d’update pour éviter les boucles/caret jump
        }, 250);
        return () => clearTimeout(id);
    }, [code, showCodeView, editor]);

    const test = () => {
        if (editor) {
            console.log("HTML Output:", formatHTML(editor.getHTML()));
        }
    };

    if (!product || !editor) return null;
    return (
        <Card className="w-full">
            <CardHeader className="flex flex-row items-center justify-between">
                <Button onClick={test} variant="outline" size="sm">
                    Sauvegarder
                </Button>
            </CardHeader>
            <CardContent className="p-0 bg-red-500/5 ">
                <MenuBar editor={editor} />
                <div className="bg-white w-full ">
                    {showCodeView ? (
                        // ⬇️ Remplace ton <textarea ... /> par celui-ci
                        <textarea
                            ref={(el) => {
                                if (!el) return;
                                el.style.height = "auto";
                                el.style.height = `${el.scrollHeight}px`;
                            }}
                            onInput={(e) => {
                                const el = e.currentTarget;
                                el.style.height = "auto";
                                el.style.height = `${el.scrollHeight}px`;
                            }}
                            onKeyDown={(e) => {
                                // insertion de tabulation sans perdre le caret
                                if (e.key === "Tab") {
                                    e.preventDefault();
                                    const target = e.currentTarget;
                                    const start = target.selectionStart ?? 0;
                                    const end = target.selectionEnd ?? 0;
                                    const next = code.slice(0, start) + "  " + code.slice(end);
                                    setCode(next);
                                    queueMicrotask(() => {
                                        target.selectionStart = target.selectionEnd = start + 2;
                                    });
                                }
                            }}
                            rows={1}
                            className="w-full p-4 font-mono text-sm border-0 outline-none focus:outline focus:outline-2 focus:outline-blue-500 resize-none overflow-hidden"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Code HTML..."
                        />
                    ) : (
                        <EditorContent
                            editor={editor}
                            className="prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4 leading-snug [&_p]:my-1 [&_img]:inline-block [&_img]:align-middle [&_img]:m-0"
                        />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
