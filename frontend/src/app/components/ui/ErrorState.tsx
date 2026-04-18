import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
}

export function ErrorState({
    title = "Something went wrong",
    message = "We encountered an error while loading this content. Please try again.",
    onRetry,
}: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-xl font-medium mb-2">{title}</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">{message}</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                </button>
            )}
        </div>
    );
}
