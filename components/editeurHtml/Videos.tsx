// utils.ts - Ajoutez ces extensions à votre fichier utils.ts

import { Node, mergeAttributes } from "@tiptap/core";
import { NodeViewWrapper, NodeViewContent, ReactNodeViewRenderer } from "@tiptap/react";
import React, { useState, useRef, useEffect } from "react";

// Composant React pour éditer les vidéos
const VideoComponent = ({ node, updateAttributes, deleteNode }: any) => {
    const [isEditing, setIsEditing] = useState(false);
    const [src, setSrc] = useState(node.attrs.src || "");
    const [width, setWidth] = useState(node.attrs.width || "");
    const [height, setHeight] = useState(node.attrs.height || "");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSave = () => {
        updateAttributes({
            src,
            width: width || null,
            height: height || null,
        });
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        } else if (e.key === "Escape") {
            setIsEditing(false);
            setSrc(node.attrs.src || "");
            setWidth(node.attrs.width || "");
            setHeight(node.attrs.height || "");
        }
    };

    if (isEditing) {
        return (
            <NodeViewWrapper className="video-wrapper my-4 p-4 border-2 border-blue-400 rounded bg-blue-50">
                <div className="space-y-2">
                    <div>
                        <label className="block text-sm font-medium mb-1">URL de la vidéo</label>
                        <input
                            ref={inputRef}
                            type="text"
                            value={src}
                            onChange={(e) => setSrc(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full p-2 border rounded"
                            placeholder="https://..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-sm font-medium mb-1">Largeur</label>
                            <input
                                type="text"
                                value={width}
                                onChange={(e) => setWidth(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full p-2 border rounded"
                                placeholder="auto"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Hauteur</label>
                            <input
                                type="text"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full p-2 border rounded"
                                placeholder="auto"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleSave} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                            Enregistrer
                        </button>
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setSrc(node.attrs.src || "");
                                setWidth(node.attrs.width || "");
                                setHeight(node.attrs.height || "");
                            }}
                            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                        >
                            Annuler
                        </button>
                        <button onClick={deleteNode} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 ml-auto">
                            Supprimer
                        </button>
                    </div>
                </div>
            </NodeViewWrapper>
        );
    }

    return (
        <NodeViewWrapper className="video-wrapper my-4 relative group">
            <div className="relative">
                {src ? (
                    <video
                        src={src}
                        controls={node.attrs.controls}
                        width={width || undefined}
                        height={height || undefined}
                        autoPlay={node.attrs.autoplay}
                        loop={node.attrs.loop}
                        muted={node.attrs.muted}
                        poster={node.attrs.poster || undefined}
                        className="max-w-full"
                    />
                ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">Aucune vidéo</div>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                        Éditer
                    </button>
                    <button onClick={deleteNode} className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                        Supprimer
                    </button>
                </div>
            </div>
        </NodeViewWrapper>
    );
};

// Composant React pour éditer les iframes
const IframeComponent = ({ node, updateAttributes, deleteNode }: any) => {
    const [isEditing, setIsEditing] = useState(false);
    const [src, setSrc] = useState(node.attrs.src || "");
    const [width, setWidth] = useState(node.attrs.width || "560");
    const [height, setHeight] = useState(node.attrs.height || "315");
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing]);

    const handleSave = () => {
        updateAttributes({
            src,
            width: width || "560",
            height: height || "315",
        });
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSave();
        } else if (e.key === "Escape") {
            setIsEditing(false);
            setSrc(node.attrs.src || "");
            setWidth(node.attrs.width || "560");
            setHeight(node.attrs.height || "315");
        }
    };

    if (isEditing) {
        return (
            <NodeViewWrapper className="iframe-wrapper my-4 p-4 border-2 border-green-400 rounded bg-green-50">
                <div className="space-y-2">
                    <div>
                        <label className="block text-sm font-medium mb-1">URL de l'iframe (YouTube, etc.)</label>
                        <input
                            ref={inputRef}
                            type="text"
                            value={src}
                            onChange={(e) => setSrc(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full p-2 border rounded"
                            placeholder="https://www.youtube.com/embed/..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="block text-sm font-medium mb-1">Largeur</label>
                            <input
                                type="text"
                                value={width}
                                onChange={(e) => setWidth(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full p-2 border rounded"
                                placeholder="560"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Hauteur</label>
                            <input
                                type="text"
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full p-2 border rounded"
                                placeholder="315"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleSave} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                            Enregistrer
                        </button>
                        <button
                            onClick={() => {
                                setIsEditing(false);
                                setSrc(node.attrs.src || "");
                                setWidth(node.attrs.width || "560");
                                setHeight(node.attrs.height || "315");
                            }}
                            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
                        >
                            Annuler
                        </button>
                        <button onClick={deleteNode} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 ml-auto">
                            Supprimer
                        </button>
                    </div>
                </div>
            </NodeViewWrapper>
        );
    }

    return (
        <NodeViewWrapper className="iframe-wrapper my-4 relative group">
            <div className="relative">
                {src ? (
                    <iframe
                        src={src}
                        width={width}
                        height={height}
                        frameBorder={node.attrs.frameborder}
                        allow={node.attrs.allow}
                        allowFullScreen={node.attrs.allowfullscreen}
                        title={node.attrs.title || "Embedded content"}
                        className="max-w-full"
                    />
                ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                        Aucun contenu embarqué
                    </div>
                )}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                    >
                        Éditer
                    </button>
                    <button onClick={deleteNode} className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                        Supprimer
                    </button>
                </div>
            </div>
        </NodeViewWrapper>
    );
};

// Extension pour les vidéos HTML5
export const Video = Node.create({
    name: "video",
    group: "block",
    draggable: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
            controls: {
                default: true,
            },
            width: {
                default: null,
            },
            height: {
                default: null,
            },
            autoplay: {
                default: false,
            },
            loop: {
                default: false,
            },
            muted: {
                default: false,
            },
            poster: {
                default: null,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: "video",
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ["video", mergeAttributes(HTMLAttributes)];
    },

    addNodeView() {
        return ReactNodeViewRenderer(VideoComponent);
    },
});

// Extension pour les iframes (YouTube, etc.)
export const Iframe = Node.create({
    name: "iframe",
    group: "block",
    draggable: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
            width: {
                default: 560,
            },
            height: {
                default: 315,
            },
            frameborder: {
                default: "0",
            },
            allow: {
                default: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
            },
            allowfullscreen: {
                default: true,
            },
            title: {
                default: null,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: "iframe",
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ["iframe", mergeAttributes(HTMLAttributes)];
    },

    addNodeView() {
        return ReactNodeViewRenderer(IframeComponent);
    },
});
