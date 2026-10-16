type EmptyStateProps = {
    title: string;
    message?: string;
};

export default function EmptyState({ title, message }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <h2 className="text-xl font-semibold text-gray-900">
                {title}
            </h2>

            {message && (
                <p className="mt-2 max-w-md text-sm text-gray-500">
                    {message}
                </p>
            )}
        </div>
    );
}
