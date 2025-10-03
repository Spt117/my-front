"use client";
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

// Fonction pour normaliser le HTML avant comparaison
const normalizeHTML = (html: string): string => {
    return html
        .replace(/\s+/g, " ") // Remplace les espaces multiples par un seul
        .replace(/>\s+</g, "><") // Enlève les espaces entre les balises
        .trim();
};

export default function ShopifyProductEditor({ html }: { html?: string }) {
    const { modifiedHtml, setModifiedHtml, showCodeView, code, setCode, hasChanges, setHasChanges } = useEditorHtmlStore();
    const [originalHtml, setOriginalHtml] = useState<string>("");

    const editor = useEditor(
        {
            immediatelyRender: false,
            extensions: [StarterKit.configure({ listItem: false }), PlainListItem, Underline, LinkStrict, TextAlign.configure({ types: ["heading", "paragraph"] }), ImageInline],
            content: html || " ",
            editorProps: {
                attributes: {
                    class: "prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4",
                },
                handleClick: (_view, _pos, event) => {
                    const el = (event.target as HTMLElement) || null;

                    if ((event as MouseEvent).metaKey || (event as MouseEvent).ctrlKey) {
                        return false;
                    }

                    if (el && el.closest("a[href]")) {
                        event.preventDefault();
                        return true;
                    }
                    return false;
                },
                handleDOMEvents: {
                    mousedown: (_view, _event) => false,
                },
            },
            parseOptions: { preserveWhitespace: false },
            onUpdate: ({ editor }) => {
                // Mise à jour du HTML modifié à chaque changement dans l'éditeur
                const newHtml = editor.getHTML();
                setModifiedHtml(newHtml);
            },
        },
        [html]
    );

    // Initialiser l'original une fois l'éditeur chargé
    useEffect(() => {
        if (editor && !originalHtml) {
            const initial = editor.getHTML();
            setOriginalHtml(initial);
            setModifiedHtml(initial);
        }
    }, [editor, originalHtml, html]);

    // Mettre à jour hasChanges dans le store à chaque modification
    useEffect(() => {
        const changes = normalizeHTML(modifiedHtml) !== normalizeHTML(originalHtml);
        setHasChanges(changes);
    }, [modifiedHtml, originalHtml, setHasChanges, html]);

    // Quand on passe en mode code, on prend un snapshot UNE FOIS (formaté) depuis l'éditeur
    useEffect(() => {
        if (showCodeView && editor) {
            setCode(formatHTML(editor.getHTML()));
        }
    }, [showCodeView, editor, setCode, html]);

    // Pendant la saisie en mode code, on applique au document TipTap avec un léger debounce
    useEffect(() => {
        if (!showCodeView || !editor) return;
        const id = setTimeout(() => {
            editor.commands.setContent(code, { emitUpdate: false });
            // Mise à jour du HTML modifié même en mode code
            setModifiedHtml(code);
        }, 250);
        return () => clearTimeout(id);
    }, [code, showCodeView, editor]);

    if (!editor) return null;
    return (
        <Card className="w-full h-min p-0">
            <CardHeader className=" m-0 p-3">Description</CardHeader>
            <CardContent className="p-0 m-0">
                <MenuBar editor={editor} />
                <div className="bg-white w-full ">
                    {showCodeView ? (
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
                        <EditorContent editor={editor} className="prose prose-sm max-w-none focus:outline-none min-h-[400px] p-4 leading-snug [&_p]:my-1 [&_img]:inline-block [&_img]:align-middle [&_img]:m-0" />
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
