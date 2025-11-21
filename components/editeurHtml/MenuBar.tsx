"use client";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import type { Editor } from "@tiptap/react";
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    Code,
    Heading2,
    Heading3,
    Italic,
    List,
    ListOrdered,
    Minus,
    Palette,
    Quote,
    Redo,
    Underline as UnderlineIco,
    Undo,
} from "lucide-react";
import { useEffect, useState } from "react";
import { LinkControls } from "./LinkControls";
import useEditorHtmlStore from "./storeEditor";

export const MenuBar = ({ editor }: { editor: Editor }) => {
    const { showCodeView, setShowCodeView } = useEditorHtmlStore();

    const [, forceUpdate] = useState(0);

    const colors = [
        { name: "Noir", value: "#000000" },
        { name: "Rouge", value: "#ef4444" },
        { name: "Bleu", value: "#3b82f6" },
        { name: "Vert", value: "#22c55e" },
        { name: "Jaune", value: "#eab308" },
        { name: "Orange", value: "#f97316" },
        { name: "Violet", value: "#a855f7" },
        { name: "Rose", value: "#ec4899" },
        { name: "Gris", value: "#6b7280" },
    ];

    useEffect(() => {
        if (!editor) return;
        const update = () => forceUpdate((x) => x + 1);
        editor.on("selectionUpdate", update);
        editor.on("transaction", update);
        editor.on("update", update);
        return () => {
            editor.off("selectionUpdate", update);
            editor.off("transaction", update);
            editor.off("update", update);
        };
    }, [editor]);

    if (!editor) return null;

    return (
        <div className="flex flex-wrap gap-1 p-2 border-b bg-slate-50 rounded-xl">
            <Button
                size="sm"
                variant="outline"
                className={editor.isActive("bold") ? "bg-slate-300" : ""}
                onClick={() => editor.chain().focus().toggleBold().run()}
                title="Gras (Ctrl+B)"
            >
                <Bold className="w-4 h-4" />
            </Button>

            <Button
                size="sm"
                variant="outline"
                className={editor.isActive("italic") ? "bg-slate-300" : ""}
                onClick={() => editor.chain().focus().toggleItalic().run()}
                title="Italique (Ctrl+I)"
            >
                <Italic className="w-4 h-4" />
            </Button>

            <Button
                size="sm"
                variant="outline"
                className={editor.isActive("underline") ? "bg-slate-300" : ""}
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                title="Souligné (Ctrl+U)"
            >
                <UnderlineIco className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="h-8" />

            <Button
                size="sm"
                variant="outline"
                className={editor.isActive("heading", { level: 2 }) ? "bg-slate-300" : ""}
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                title="Titre H2"
            >
                <Heading2 className="w-4 h-4" />
            </Button>

            <Button
                size="sm"
                variant="outline"
                className={editor.isActive("heading", { level: 3 }) ? "bg-slate-300" : ""}
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                title="Titre H3"
            >
                <Heading3 className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="h-8" />

            <Button
                size="sm"
                variant="outline"
                className={editor.isActive("bulletList") ? "bg-slate-300" : ""}
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                title="Liste à puces"
            >
                <List className="w-4 h-4" />
            </Button>

            <Button
                size="sm"
                variant="outline"
                className={editor.isActive("orderedList") ? "bg-slate-300" : ""}
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                title="Liste numérotée"
            >
                <ListOrdered className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="h-8" />

            <Button
                size="sm"
                variant="outline"
                className={editor.isActive({ textAlign: "left" }) ? "bg-slate-300" : ""}
                onClick={() => editor.chain().focus().setTextAlign("left").run()}
                title="Aligner à gauche"
            >
                <AlignLeft className="w-4 h-4" />
            </Button>

            <Button
                size="sm"
                variant="outline"
                className={editor.isActive({ textAlign: "center" }) ? "bg-slate-300" : ""}
                onClick={() => editor.chain().focus().setTextAlign("center").run()}
                title="Centrer"
            >
                <AlignCenter className="w-4 h-4" />
            </Button>

            <Button
                size="sm"
                variant="outline"
                className={editor.isActive({ textAlign: "right" }) ? "bg-slate-300" : ""}
                onClick={() => editor.chain().focus().setTextAlign("right").run()}
                title="Aligner à droite"
            >
                <AlignRight className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="h-8" />

            {/* Bouton couleur de texte */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" title="Couleur du texte">
                        <Palette className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    {colors.map((color) => (
                        <DropdownMenuItem
                            key={color.value}
                            onClick={() => editor.chain().focus().setColor(color.value).run()}
                            className="flex items-center gap-2 cursor-pointer"
                        >
                            <div className="w-4 h-4 rounded border border-gray-300" style={{ backgroundColor: color.value }} />
                            <span>{color.name}</span>
                        </DropdownMenuItem>
                    ))}
                    <DropdownMenuItem onClick={() => editor.chain().focus().unsetColor().run()} className="cursor-pointer border-t mt-1 pt-1">
                        Réinitialiser
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* ⬇️ Nouveau : bouton + modale de gestion des liens */}
            <LinkControls editor={editor} />

            <Button
                size="sm"
                variant="outline"
                className={showCodeView ? "bg-slate-300" : ""}
                onClick={() => setShowCodeView(!showCodeView)}
                title="Afficher le code HTML"
            >
                <Code className="w-4 h-4" />
            </Button>

            <Button
                size="sm"
                variant="outline"
                className={editor.isActive("blockquote") ? "bg-slate-300" : ""}
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                title="Citation"
            >
                <Quote className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="h-8" />

            <Button size="sm" variant="outline" onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Ligne horizontale">
                <Minus className="w-4 h-4" />
            </Button>

            <Separator orientation="vertical" className="h-8" />

            <Button
                size="sm"
                variant="outline"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Annuler (Ctrl+Z)"
            >
                <Undo className="w-4 h-4" />
            </Button>

            <Button
                size="sm"
                variant="outline"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Rétablir (Ctrl+Y)"
            >
                <Redo className="w-4 h-4" />
            </Button>
        </div>
    );
};
