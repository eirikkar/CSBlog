const API_URL = "http://localhost:5073/api/posts";

export async function getPosts() {
    const response = await fetch(API_URL);
    return response.json();
}

export async function getPost(id) {
    const response = await fetch(`${API_URL}/${id}`);
    return response.json();
}

export async function createPost(post) {
    const token = localStorage.getItem("token");
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(post),
    });
    return response.json();
}

export async function updatePost(id, post) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(post),
    });
    return response.json();
}

export async function deletePost(id) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.json();
}
