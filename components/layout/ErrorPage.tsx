import { AlertTriangle } from "lucide-react";

interface ErrorPageProps {
    title?: string;
    message: string;
}

export default function ErrorPage({ title = "Connexion impossible", message }: ErrorPageProps) {
    return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
            <div className="max-w-md w-full rounded-xl border border-red-200 bg-red-50 p-8 text-center space-y-4">
                <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
                <h2 className="text-xl font-semibold text-red-700">{title}</h2>
                <p className="text-red-600 text-sm">{message}</p>
            </div>
        </div>
    );
}
