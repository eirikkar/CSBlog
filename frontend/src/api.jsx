const API_URL = "http://localhost:5073/api/posts";
const IMAGE_URL = "http://localhost:5073/api/Image";
const token = localStorage.getItem("token");

export async function getPosts() {
  const response = await fetch(API_URL);
  return response.json();
}

export async function getPost(id) {
  const response = await fetch(`${API_URL}/${id}`);
  return response.json();
}
export async function searchPosts(keyword) {
  const response = await fetch(`${API_URL}/search?keyword=${keyword}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }
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
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }
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
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText);
  }
  return response.json();
}

export async function deletePost(id) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_URL}/${id}`, {
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

  // Handle successful empty responses
  return response.status === 204 ? {} : response.json();
}

export async function uploadImage(file) {
  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${IMAGE_URL}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Image upload failed");
  }
  return response.json();
}

export async function deleteImage(fileName) {
  const token = localStorage.getItem("token");
  const response = await fetch(`${IMAGE_URL}/${fileName}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Image deletion failed");
  }
  return true;
}
