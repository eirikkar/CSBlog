import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPost } from "../api.jsx";

const Post = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await getPost(id);
        setPost(data);
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    fetchPost();
  }, [id]);

  if (!post) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-center">
        <div className="col-md-8 col-lg-6">
          <Link to="/" className="btn btn-secondary mb-4">
            &larr; Back to Home
          </Link>
          <div className="card shadow-sm">
            {/* Optional Image Section */}
            {/* {post.imageUrl && (
              <img src={post.imageUrl} className="card-img-top" alt={post.title} />
            )} */}
            <div className="card-body">
              <h2 className="card-title mb-4">{post.title || "Untitled"}</h2>
              <div
                className="card-text"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </div>
            <div className="card-footer text-muted">
              <div>
                Posted on: {new Date(post.createdAt).toLocaleDateString()}
              </div>
              <div>
                Last updated: {new Date(post.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
