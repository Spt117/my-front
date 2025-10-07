"use client";
import { useCopy } from "@/library/hooks/useCopy";
import { Copy } from "lucide-react";
import { ReactNode } from "react";

type CopyComponentProps = {
    contentToCopy: string;
    message: string;
    size?: number;
    children?: ReactNode;
};

export default function CopyComponent({ contentToCopy, message, children, size }: CopyComponentProps) {
    const { handleCopy } = useCopy();

    const classCopy = " hover:scale-105";
    const classDiv = "cursor-pointer flex gap-2 transition-transform duration-150 ease-out active:scale-90";

    return (
        <div onClick={() => handleCopy(contentToCopy, message)} className={classDiv}>
            {children}
            <Copy size={size} className={classCopy} />
        </div>
    );
}
