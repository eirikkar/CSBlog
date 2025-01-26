import React, { useEffect, useState } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";

const EditPost = ({ post, onUpdate, onCancel }) => {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const { quill, quillRef } = useQuill();

  useEffect(() => {
    if (quill) {
      // Initialize the editor with the existing content once
      quill.clipboard.dangerouslyPasteHTML(content);

      const handleTextChange = () => {
        setContent(quill.root.innerHTML);
      };

      quill.on("text-change", handleTextChange);

      return () => {
        quill.off("text-change", handleTextChange);
      };
    }
  }, [quill]); // Removed 'content' from dependencies

  const handleSubmit = () => {
    if (title.trim() === "" || content.trim() === "") {
      alert("Title and Content cannot be empty.");
      return;
    }
    onUpdate({ ...post, title, content });
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h3 className="card-title">Edit Post</h3>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div ref={quillRef} style={{ height: "200px" }} />
        <div className="mt-3">
          <button className="btn btn-success me-2" onClick={handleSubmit}>
            Update Post
          </button>
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPost;
