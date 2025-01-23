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
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(post),
  });
  return response.json();
}

export async function updatePost(id, post) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(post),
  });
  return response.json();
}

export async function deletePost(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
  return response.json();
}
