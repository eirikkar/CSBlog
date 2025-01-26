import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPosts } from "../api.jsx";

const Home = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const data = await getPosts();
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    }
    fetchPosts();
  }, []);

  return (
    <div className="mt-4">
      <div className="row justify-content-center">
        {posts.map((post) => (
          <div key={post.id} className="col-md-8 col-lg-6 mb-4">
            <div className="card h-100 shadow-sm">
              {/* Optional Image Section */}
              {/* {post.imageUrl && (
                <img src={post.imageUrl} className="card-img-top" alt={post.title} />
              )} */}
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{post.title || "Untitled"}</h5>
                <p className="card-text">
                  {stripHtml(post.content).substring(0, 150)}...
                </p>
                <div className="mt-auto">
                  <Link to={`/post/${post.id}`} className="btn btn-primary">
                    Read More
                  </Link>
                </div>
              </div>
              <div className="card-footer bg-transparent border-top-0">
                <small className="text-muted">
                  Posted on {new Date(post.createdAt).toLocaleDateString()}
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Helper function to strip HTML tags from content
const stripHtml = (html) => {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

export default Home;
