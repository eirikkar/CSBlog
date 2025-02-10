export const backendUrl = import.meta.env.VITE_REACT_APP_BASE_API_URL;

export const getImageUrl = (filename) =>
    `${import.meta.env.VITE_REACT_APP_BASE_URL}${import.meta.env.VITE_REACT_APP_UPLOADS_PATH}/${filename}`;

function redirectToLogin() {
    window.location.href = "/login";
}

export async function getPosts() {
    const response = await fetch(`${backendUrl}/posts`);
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json();
}

export async function getPost(id) {
    const response = await fetch(`${backendUrl}/posts/${id}`);
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json();
}

export async function searchPosts(keyword) {
    const response = await fetch(`${backendUrl}/posts/search?keyword=${keyword}`);
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
    }
    return response.json();
}

export async function createPost(post) {
    verifyToken();
    const token = localStorage.getItem("token");
    const response = await fetch(`${backendUrl}/posts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(post),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
    }
    return response.json();
}

export async function updatePost(id, post) {
    verifyToken();
    const token = localStorage.getItem("token");
    const response = await fetch(`${backendUrl}/posts/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(post),
    });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
    }
    return response.json();
}

export async function deletePost(id) {
    verifyToken();
    const token = localStorage.getItem("token");
    const response = await fetch(`${backendUrl}/posts/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const errorText =
            response.status === 401
                ? "Unauthorized - Please login again"
                : await response.text().catch(() => "Unknown error");

        throw new Error(errorText || "Failed to delete post");
    }

    return response.status === 204 ? {} : response.json();
}

export async function uploadImage(file) {
    verifyToken();
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    const uploadUrl = `${backendUrl}/image/upload`;

    try {
        const response = await fetch(uploadUrl, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Image upload failed");
        }

        const result = await response.json();
        return result.fileName;
    } catch (error) {
        console.error("Image upload failed:", error);
        throw error;
    }
}

export async function deleteImage(fileName) {
    verifyToken();
    const token = localStorage.getItem("token");
    const deleteUrl = `${backendUrl}/image/${fileName}`;

    try {
        const response = await fetch(deleteUrl, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Image deletion failed");
        }
    } catch (error) {
        console.error("Image deletion failed:", error);
        throw error;
    }
}

export async function getProfile(token) {
    verifyToken();
    const response = await fetch(`${backendUrl}/auth/getuser`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch profile");
    }

    return response.json();
}

export async function updateProfile(token, user) {
    verifyToken();
    const response = await fetch(`${backendUrl}/auth/edituser`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to update profile");
    }

    return response.json();
}

export async function verifyToken() {
    const token = localStorage.getItem("token");

    if (!token) {
        redirectToLogin();
    }

    try {
        const response = await fetch(`${backendUrl}/auth/verify`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            redirectToLogin();
        }

        return data;
    } catch (error) {
        console.error("Token verification failed:", error);
        throw error;
    }
}
