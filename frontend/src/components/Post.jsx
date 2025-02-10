import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPost } from "../api";

/**
 * Post component for displaying a single blog post.
 */
const Post = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  /**
   * useEffect hook to fetch the post data on component mount.
   */
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await getPost(id);
        setPost(data);
      } catch {
        setError("Failed to load post. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4">
        {error}{" "}
        <Link to="/" className="alert-link">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <Link to="/" className="btn btn-secondary mb-4">
        &larr; Back to Home
      </Link>

      <div className="card shadow-sm">
        {post.imageUrl && (
          <div className="card-img-top-container">
            <img
              src={`${post.imageUrl}`}
              className="card-img-top"
              alt={post.title}
              style={{ maxWidth: "100%", height: "auto", objectFit: "contain" }}
            />
          </div>
        )}

        <div className="card-body">
          <h1 className="card-title mb-4">{post.title || "Untitled Post"}</h1>
          <div
            className="card-text post-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>

        <div className="card-footer text-muted">
          <div className="d-flex justify-content-between">
            <div>
              Created: {new Date(post.createdAt).toLocaleDateString("nb-NO")}
            </div>
            <div>
              Updated: {new Date(post.updatedAt).toLocaleDateString("nb-NO")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
