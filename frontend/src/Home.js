import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPosts } from "./api";

const Home = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function fetchPosts() {
      const data = await getPosts();
      setPosts(data);
    }
    fetchPosts();
  }, []);

  return (
    <div>
      <h2>Welcome to the Home Page</h2>
      {posts.map((post) => (
        <div key={post.id} className="post-preview">
          <h3>
            <Link to={`/post/${post.id}`}>{post.title}</Link>
          </h3>
          <p>{post.content.substring(0, 100)}...</p>
        </div>
      ))}
    </div>
  );
};

export default Home;
