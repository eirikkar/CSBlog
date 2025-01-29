import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPosts, deletePost, createPost } from "../api";
import CreatePost from "./CreatePost";
import EditPost from "./EditPost";
import ConfirmDialog from "./ConfirmDialog";
import "../styles/Admin.css";

const Admin = () => {
    const navigate = useNavigate();
    const [isTokenValid, setIsTokenValid] = useState(true);
    const [posts, setPosts] = useState([]);
    const [editPost, setEditPost] = useState(null);
    const [postToDelete, setPostToDelete] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const verifyToken = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/login");
                return;
            }

            try {
                await getPosts();
                setIsTokenValid(true);
                fetchPosts();
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    localStorage.removeItem("token");
                    setIsTokenValid(false);
                    navigate("/login");
                }
            }
        };

        verifyToken();
    }, [navigate]);

    const fetchPosts = async () => {
        try {
            const posts = await getPosts();
            setPosts(posts);
        } catch (error) {
            console.error("Error fetching posts:", error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
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

    const handleUpdatePost = async () => {
        await fetchPosts();
        setEditPost(null);
    };

    const handleConfirmDelete = async () => {
        if (!postToDelete) return;

        setIsDeleting(true);
        try {
            await deletePost(postToDelete);
            await fetchPosts();
        } catch (error) {
            console.error("Delete error:", error);
        } finally {
            setIsDeleting(false);
            setShowConfirmDialog(false);
            setPostToDelete(null);
        }
    };

    const stripHtml = (html) => {
        const tmp = document.createElement("DIV");
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || "";
    };

    if (!isTokenValid) {
        return (
            <div className="container text-center mt-5">
                <h3>Session expired. Please login again.</h3>
                <button
                    className="btn btn-primary mt-3"
                    onClick={() => navigate("/login")}
                >
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Admin Dashboard</h2>
                <button className="btn btn-danger" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            <CreatePost onCreate={handleCreatePost} />

            {editPost && (
                <EditPost
                    post={editPost}
                    onUpdate={handleUpdatePost}
                    onCancel={() => setEditPost(null)}
                />
            )}

            <div className="mt-5">
                <h3 className="mb-4">Manage Posts</h3>
                {posts.length === 0 ? (
                    <p>No posts available.</p>
                ) : (
                    <div className="row justify-content-center">
                        {posts.map((post) => (
                            <div key={post.id} className="col-md-6 col-lg-4 mb-4">
                                <div className="card h-100 shadow-sm">
                                    {post.imageUrl && (
                                        <div className="card-img-container">
                                            <img
                                                src={`http://localhost:5073/uploads/${post.imageUrl}`}
                                                className="post-image"
                                                alt={post.title}
                                            />
                                        </div>
                                    )}
                                    <div className="card-body d-flex flex-column">
                                        <h5 className="card-title">{post.title || "Untitled"}</h5>
                                        <p className="card-text">
                                            {stripHtml(post.content).substring(0, 100)}...
                                        </p>
                                        <div className="mt-auto">
                                            <button
                                                className="btn btn-primary btn-sm me-2"
                                                onClick={() => setEditPost(post)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => {
                                                    setPostToDelete(post.id);
                                                    setShowConfirmDialog(true);
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                    <div className="card-footer bg-transparent">
                                        <small className="text-muted">
                                            Created:{" "}
                                            {new Date(post.createdAt).toLocaleDateString("nb-NO")}
                                            {post.updatedAt !== post.createdAt && (
                                                <>
                                                    {" "}
                                                    | Updated:{" "}
                                                    {new Date(post.updatedAt).toLocaleDateString("nb-NO")}
                                                </>
                                            )}
                                        </small>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmDialog
                show={showConfirmDialog}
                title="Confirm Delete"
                message="Are you sure you want to delete this post? This action cannot be undone."
                onConfirm={handleConfirmDelete}
                onCancel={() => {
                    setShowConfirmDialog(false);
                    setPostToDelete(null);
                }}
                isDeleting={isDeleting}
            />
        </div>
    );
};

export default Admin;
