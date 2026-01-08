'use client';

import { Edit3, Loader2, MessageSquare, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { updateOrderNote } from './serverAction';

interface OrderNotesProps {
    orderId: string;
    domain: string;
    initialNote: string | null;
    onNoteUpdated?: (note: string) => void;
}

export default function OrderNotes({ orderId, domain, initialNote, onNoteUpdated }: OrderNotesProps) {
    const [note, setNote] = useState(initialNote || '');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editedNote, setEditedNote] = useState(note);

    useEffect(() => {
        setNote(initialNote || '');
        setEditedNote(initialNote || '');
    }, [initialNote]);

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);

        try {
            const result = await updateOrderNote(domain, orderId, editedNote);

            if (result.error) {
                setError(result.error);
            } else {
                setNote(editedNote);
                setIsEditing(false);
                onNoteUpdated?.(editedNote);
            }
        } catch {
            setError('Erreur lors de la sauvegarde');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditedNote(note);
        setIsEditing(false);
        setError(null);
    };

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

            <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 relative">
                    <div className="w-1.5 h-6 rounded-full bg-amber-500"></div>
                    <MessageSquare className="w-4 h-4 text-amber-500" />
                    Notes
                </h3>
                {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-amber-50 rounded-lg transition-colors group/edit cursor-pointer" title="Modifier les notes">
                        <Edit3 className="w-4 h-4 text-gray-400 group-hover/edit:text-amber-600 transition-colors" />
                    </button>
                )}
            </div>

            <div className="relative">
                {isEditing ? (
                    <div className="space-y-3">
                        <textarea
                            value={editedNote}
                            onChange={(e) => setEditedNote(e.target.value)}
                            placeholder="Ajouter une note pour cette commande..."
                            className="w-full min-h-[120px] p-4 text-sm text-gray-700 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none transition-all placeholder:text-gray-400"
                            disabled={isSaving}
                            autoFocus
                        />

                        {error && <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>}

                        <div className="flex items-center gap-2 justify-end">
                            <button
                                onClick={handleCancel}
                                disabled={isSaving}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                Annuler
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-lg transition-all disabled:opacity-50 shadow-sm hover:shadow-md cursor-pointer flex items-center gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Sauvegarde...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Sauvegarder
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="min-h-[60px]">
                        {note ? (
                            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100/50">
                                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{note}</p>
                            </div>
                        ) : (
                            <div
                                onClick={() => setIsEditing(true)}
                                className="p-4 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 hover:border-amber-300 hover:bg-amber-50/30 transition-all cursor-pointer group/empty"
                            >
                                <p className="text-sm text-gray-400 group-hover/empty:text-amber-600 transition-colors italic text-center">Cliquez pour ajouter une note...</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
