import { create } from "zustand";

interface EditorHtmlStore {
    showCodeView: boolean;
    code: string;
    hasChanges: boolean;
    setShowCodeView: (show: boolean) => void;
    setCode: (code: string) => void;
    setHasChanges: (hasChanges: boolean) => void;
    modifiedHtml: string;
    setModifiedHtml: (html: string) => void;
}

const useEditorHtmlStore = create<EditorHtmlStore>((set) => ({
    showCodeView: false,
    code: "",
    hasChanges: false,
    setShowCodeView: (show) => set({ showCodeView: show }),
    setCode: (code) => set({ code }),
    setHasChanges: (hasChanges) => set({ hasChanges }),
    modifiedHtml: "",
    setModifiedHtml: (html) => set({ modifiedHtml: html }),
}));

export default useEditorHtmlStore;
