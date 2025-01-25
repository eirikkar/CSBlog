import React, { useEffect, useState } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";

const EditPost = ({ post, onUpdate, onCancel }) => {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const { quill, quillRef } = useQuill();

  useEffect(() => {
    if (quill) {
      quill.clipboard.dangerouslyPasteHTML(content);

      const handleTextChange = () => {
        setContent(quill.root.innerHTML);
      };

      quill.on("text-change", handleTextChange);

      return () => {
        quill.off("text-change", handleTextChange);
      };
    }
  }, [quill, content]);

  const handleSubmit = () => {
    if (title.trim() === "" || content.trim() === "") {
      alert("Title and Content cannot be empty.");
      return;
    }
    onUpdate({ ...post, title, content });
  };

  return (
    <div>
      <h3>Edit Post</h3>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <div ref={quillRef} style={{ height: "200px" }} />
      <button onClick={handleSubmit}>Update Post</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  );
};

export default EditPost;
