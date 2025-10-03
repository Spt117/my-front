// storeEditor.ts — met à jour le store
import { create } from "zustand";

interface StoreState {
    showCodeView: boolean;
    setShowCodeView: (show: boolean) => void;

    linkDialogOpen: boolean;
    openLinkDialog: () => void;
    closeLinkDialog: () => void;
}

const useEditorHtmlStore = create<StoreState>((set) => ({
    showCodeView: false,
    setShowCodeView: (show) => set({ showCodeView: show }),

    linkDialogOpen: false,
    openLinkDialog: () => set({ linkDialogOpen: true }),
    closeLinkDialog: () => set({ linkDialogOpen: false }),
}));

export default useEditorHtmlStore;
