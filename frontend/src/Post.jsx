import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPost } from "./api";

const Post = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      const data = await getPost(id);
      setPost(data);
    };

    fetchPost();
  }, [id]);

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{post.title}</h2>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
      <p>Created at: {new Date(post.createdAt).toLocaleString()}</p>
      <p>Updated at: {new Date(post.updatedAt).toLocaleString()}</p>
    </div>
  );
};

export default Post;
