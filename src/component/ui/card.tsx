export function Card({ children, className = "", ...props }: { children: React.ReactNode, className?: string }) {
    return <div className={`border rounded-lg p-4 shadow ${className}`} {...props}>{children}</div>;
}

export function CardContent({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
}
