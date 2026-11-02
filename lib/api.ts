export class ApiRequestError extends Error {
    constructor(message: string, public errors?: { fieldErrors?: Record<string, string[]>; formErrors?: string[] }, public status?: number) {
        super(message);
    }
}

export async function apiRequest<T>( url: string, options: RequestInit = {} ): Promise<T> {
    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
        credentials: "include",
    });

    const data = await response.json();

    if (!response.ok) {
        throw new ApiRequestError(data.message || "Something went wrong", data.errors, response.status);
    }

    return data;
}
