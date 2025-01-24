import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPosts, createPost, updatePost, deletePost } from "./api";

const Admin = () => {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({ title: "", content: "" });
    const [editPost, setEditPost] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        const data = await getPosts();
        setPosts(data);
    };

    const handleCreatePost = async () => {
        await createPost(newPost);
        setNewPost({ title: "", content: "" });
        fetchPosts();
    };

    const handleUpdatePost = async () => {
        if (editPost) {
            await updatePost(editPost.id, editPost);
            setEditPost(null);
            fetchPosts();
        }
    };

    const handleDeletePost = async (id) => {
        await deletePost(id);
        fetchPosts();
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    // Check if user is logged in
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
                <textarea
                    placeholder="Content"
                    value={newPost.content}
                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                />
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
                    <textarea
                        placeholder="Content"
                        value={editPost.content}
                        onChange={(e) =>
                            setEditPost({ ...editPost, content: e.target.value })
                        }
                    />
                    <button onClick={handleUpdatePost}>Update Post</button>
                    <button onClick={() => setEditPost(null)}>Cancel</button>
                </div>
            )}
            {posts.map((post) => (
                <div key={post.id} className="post-preview">
                    <h3>
                        <Link to={`/post/${post.id}`}>{post.title}</Link>
                    </h3>
                    <p>{post.content.substring(0, 150)}...</p>
                    <button onClick={() => setEditPost(post)}>Edit</button>
                    <button onClick={() => handleDeletePost(post.id)}>Delete</button>
                </div>
            ))}
        </div>
    );
};

export default Admin;
