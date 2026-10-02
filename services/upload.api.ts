export async function uploadImage(file: File) {
    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.message || "Unable to upload image"
        );
    }

    return result.data.url as string;
}