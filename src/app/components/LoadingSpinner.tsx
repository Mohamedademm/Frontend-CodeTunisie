import { Loader2 } from 'lucide-react';

export function LoadingSpinner() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
            <p className="text-muted-foreground animate-pulse">Chargement...</p>
        </div>
    );
}
