import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPosts, createPost, updatePost, deletePost } from "./api";
import CreatePost from "./CreatePost";
import EditPost from "./EditPost";

const Admin = () => {
  const [posts, setPosts] = useState([]);
  const [editPost, setEditPost] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const data = await getPosts();
      setPosts(data);
      console.log("Fetched posts:", data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const handleCreatePost = async (newPost) => {
    try {
      const createdPost = await createPost(newPost);
      console.log("Created post:", createdPost);
      fetchPosts();
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  const handleUpdatePost = async (updatedPost) => {
    try {
      const response = await updatePost(updatedPost.id, updatedPost);
      console.log("Updated post:", response);
      setEditPost(null);
      fetchPosts();
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  const handleDeletePost = async (id) => {
    try {
      const response = await deletePost(id);
      console.log("Deleted post:", response);
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/login");
    return null;
  }

  return (
    <div>
      <h2>Admin Page</h2>
      <button onClick={handleLogout}>Logout</button>
      <CreatePost onCreate={handleCreatePost} />
      {editPost && (
        <EditPost
          post={editPost}
          onUpdate={handleUpdatePost}
          onCancel={() => setEditPost(null)}
        />
      )}
      <h3>Posts</h3>
      {posts.map((post) => (
        <div key={post.id} className="post-preview">
          <h3>
            <Link to={`/post/${post.id}`}>{post.title || "Untitled"}</Link>
          </h3>
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
          <p>Created at: {new Date(post.createdAt).toLocaleString()}</p>
          <p>Updated at: {new Date(post.updatedAt).toLocaleString()}</p>
          <button
            onClick={() =>
              setEditPost({
                id: post.id,
                title: post.title,
                content: post.content,
              })
            }
          >
            Edit
          </button>
          <button onClick={() => handleDeletePost(post.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default Admin;
