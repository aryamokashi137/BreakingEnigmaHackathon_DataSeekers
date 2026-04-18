export function CardSkeleton() {
    return (
        <div className="bg-card border border-border rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-6 bg-muted rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
        </div>
    );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
    return (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full">
                <thead className="bg-muted border-b border-border">
                    <tr>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <th key={i} className="px-6 py-3">
                                <div className="h-4 bg-muted-foreground/20 rounded w-20"></div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: rows }).map((_, i) => (
                        <tr key={i} className="border-b border-border">
                            {[1, 2, 3, 4, 5].map((j) => (
                                <td key={j} className="px-6 py-4">
                                    <div className="h-4 bg-muted rounded w-full animate-pulse"></div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function ListSkeleton({ items = 3 }: { items?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: items }).map((_, i) => (
                <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-muted rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-muted rounded w-1/3"></div>
                            <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
