import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPosts, createPost, updatePost, deletePost } from "./api";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";

const Admin = () => {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({ title: "", content: "" });
    const [editPost, setEditPost] = useState(null);
    const navigate = useNavigate();
    const { quill: newQuill, quillRef: newQuillRef } = useQuill();
    const { quill: editQuill, quillRef: editQuillRef } = useQuill();

    useEffect(() => {
        fetchPosts();
    }, []);

    useEffect(() => {
        if (newQuill) {
            newQuill.on("text-change", () => {
                setNewPost((prevNewPost) => ({
                    ...prevNewPost,
                    content: newQuill.root.innerHTML,
                }));
            });
        }
    }, [newQuill]);

    useEffect(() => {
        if (editQuill && editPost) {
            editQuill.clipboard.dangerouslyPasteHTML(editPost.content);
            editQuill.on("text-change", () => {
                setEditPost((prevEditPost) => ({
                    ...prevEditPost,
                    content: editQuill.root.innerHTML,
                }));
            });
        }
    }, [editQuill, editPost]);

    const fetchPosts = async () => {
        const data = await getPosts();
        setPosts(data);
        console.log("Fetched posts:", data);
    };

    const handleCreatePost = async () => {
        const createdPost = await createPost(newPost);
        console.log("Created post:", createdPost);
        setNewPost({ title: "", content: "" });
        fetchPosts();
    };

    const handleUpdatePost = async () => {
        if (editPost) {
            const updatedPost = await updatePost(editPost.id, editPost);
            console.log("Updated post:", updatedPost);
            setEditPost(null);
            fetchPosts();
        }
    };

    const handleDeletePost = async (id) => {
        const deletedPost = await deletePost(id);
        console.log("Deleted post:", deletedPost);
        fetchPosts();
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
            <div>
                <h3>Create New Post</h3>
                <input
                    type="text"
                    placeholder="Title"
                    value={newPost.title}
                    onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
                <div ref={newQuillRef} />
                <button onClick={handleCreatePost}>Create Post</button>
            </div>
            {editPost && (
                <div>
                    <h3>Edit Post</h3>
                    <input
                        type="text"
                        placeholder="Title"
                        value={editPost.title}
                        onChange={(e) =>
                            setEditPost({ ...editPost, title: e.target.value })
                        }
                    />
                    <div ref={editQuillRef} />
                    <button onClick={handleUpdatePost}>Update Post</button>
                    <button onClick={() => setEditPost(null)}>Cancel</button>
                </div>
            )}
            {posts.map((post) => (
                <div key={post.id} className="post-preview">
                    <h3>
                        <Link to={`/post/${post.id}`}>{post.title || "Untitled"}</Link>
                    </h3>
                    <p>{post.content?.substring(0, 150) || "No content"}...</p>
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
