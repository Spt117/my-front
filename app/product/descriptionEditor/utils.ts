import ListItem from "@tiptap/extension-list-item";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";

const LinkStrict = Link.extend({
    addOptions() {
        return {
            ...this.parent?.(),
            openOnClick: false,
            autolink: false,
            linkOnPaste: false,
        };
    },
    addAttributes() {
        return {
            href: {
                default: null,
                parseHTML: (el) => el.getAttribute("href"),
                renderHTML: (attrs) => (attrs.href ? { href: attrs.href } : {}),
            },
            title: {
                default: null,
                parseHTML: (el) => el.getAttribute("title"),
                renderHTML: (attrs) => (attrs.title ? { title: attrs.title } : {}),
            },
            class: {
                default: null,
                parseHTML: (el) => el.getAttribute("class"),
                renderHTML: (attrs) => (attrs.class ? { class: attrs.class } : {}),
            },
            rel: {
                default: null,
                parseHTML: (el) => el.getAttribute("rel"),
                renderHTML: (attrs) => (attrs.rel ? { rel: attrs.rel } : {}),
            },
            target: {
                default: null,
                parseHTML: (el) => el.getAttribute("target"),
                renderHTML: (attrs) => (attrs.target ? { target: attrs.target } : {}),
            },
        };
    },
});

// Force l’image en INLINE pour qu’elle reste DANS le <p> (et conserve style/title/alt)
const ImageInline = Image.extend({
    inline: true,
    group: "inline",
    draggable: false,
    addAttributes() {
        return {
            src: {
                default: null,
                parseHTML: (el: HTMLElement) => el.getAttribute("src"),
                renderHTML: (attrs: { src: string | null }) => (attrs.src ? { src: attrs.src } : {}),
            },
            alt: {
                default: null,
                parseHTML: (el: HTMLElement) => el.getAttribute("alt"),
                renderHTML: (attrs: { alt: string | null }) => (attrs.alt ? { alt: attrs.alt } : {}),
            },
            title: {
                default: null,
                parseHTML: (el: HTMLElement) => el.getAttribute("title"),
                renderHTML: (attrs: { title: string | null }) => (attrs.title ? { title: attrs.title } : {}),
            },
            style: {
                default: null,
                parseHTML: (el: HTMLElement) => el.getAttribute("style"),
                renderHTML: (attrs: { style: string | null }) => (attrs.style ? { style: attrs.style } : {}),
            },
        };
    },
});

const formatHTML = (html: string): string => {
    let formatted = "";
    let indent = 0;

    // Remplacer &nbsp; par espace normal
    html = html.replace(/&nbsp;/g, " ");

    // Découper par balises
    html.split(/(<[^>]+>)/g).forEach((part) => {
        if (!part.trim()) return;

        // Balises inline (pas de retour à la ligne)
        const inlineTags = ["strong", "span", "em", "i", "b", "u", "a"];

        const isInlineOpen = inlineTags.some((tag) => part.match(new RegExp(`^<${tag}[^>]*>$`, "i")));
        const isInlineClose = inlineTags.some((tag) => part.match(new RegExp(`^</${tag}>$`, "i")));

        // Balise fermante
        if (part.match(/^<\/\w/)) {
            indent--;
            if (isInlineClose) {
                formatted += part; // pas de retour à la ligne pour inline
            } else {
                formatted += part + "\n\n";
            }
        }
        // Balise auto-fermante
        else if (part.match(/^<\w[^>]*\/>/)) {
            formatted += part;
        }
        // Balise ouvrante
        else if (part.match(/^<\w/)) {
            if (isInlineOpen) {
                formatted += part; // inline → pas de saut de ligne
            } else if (part.toLowerCase().startsWith("<br")) {
                formatted += part + "\n"; // br → saut de ligne simple
            } else {
                formatted += part;
                indent++;
            }
        }
        // Texte
        else {
            const trimmed = part.trim();
            if (trimmed) {
                formatted += trimmed;
            }
        }
    });

    return formatted.trim();
};

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

export { formatHTML, ImageInline, LinkStrict, PlainListItem };
