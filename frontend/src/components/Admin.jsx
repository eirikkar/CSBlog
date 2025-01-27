import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPosts, createPost, updatePost, deletePost } from "../api.jsx";
import CreatePost from "./CreatePost";
import EditPost from "./EditPost";
import ConfirmDialog from "./ConfirmDialog";
import "../styles/Admin.css";

const Admin = () => {
  const [posts, setPosts] = useState([]);
  const [editPost, setEditPost] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      fetchPosts();
    }
  }, [navigate]);

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
      await deletePost(id);
      console.log("Deleted post with ID:", id);
      fetchPosts();
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await handleDeletePost(postToDelete);
      setShowConfirmDialog(false);
      setPostToDelete(null);
    } catch (error) {
      console.error("Deletion failed:", error);
      // Optionally, show an error message to the user
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-10 col-lg-8">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>Admin Dashboard</h2>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
        {/* Create Post Section */}
        <CreatePost onCreate={handleCreatePost} />

        {/* Edit Post Modal */}
        {editPost && (
          <EditPost
            post={editPost}
            onUpdate={handleUpdatePost}
            onCancel={() => setEditPost(null)}
          />
        )}

        {/* Posts List */}
        <div className="mt-5">
          <h3 className="mb-4">Manage Posts</h3>
          {posts.length === 0 ? (
            <p>No posts available.</p>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="card mb-3 shadow-sm">
                <div className="card-body">
                  <h5 className="card-title">
                    <Link
                      to={`/post/${post.id}`}
                      className="text-decoration-none"
                    >
                      {post.title || "Untitled"}
                    </Link>
                  </h5>
                  <div
                    className="card-text"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                  <p className="card-text">
                    <small className="text-muted">
                      Created at: {new Date(post.createdAt).toLocaleString()}
                    </small>
                  </p>
                  <p className="card-text">
                    <small className="text-muted">
                      Updated at: {new Date(post.updatedAt).toLocaleString()}
                    </small>
                  </p>
                  <div className="mt-3">
                    <button
                      className="btn btn-primary me-2"
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
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        setPostToDelete(post.id);
                        setShowConfirmDialog(true);
                        console.log("Preparing to delete post ID:", post.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          show={showConfirmDialog}
          title="Confirm Delete"
          message="Are you sure you want to delete this post?"
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setShowConfirmDialog(false);
            setPostToDelete(null);
          }}
          isDeleting={isDeleting}
        />
      </div>
    </div>
  );
};

export default Admin;
