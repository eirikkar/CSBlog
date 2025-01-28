import React, { useEffect, useState } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import { uploadImage } from "../api";
import "../styles/CreatePost.css";
import "../styles/Admin.css";

const CreatePost = ({ onCreate }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({ title: "", content: "", image: "" });
  const [successMessage, setSuccessMessage] = useState("");
  const { quill, quillRef } = useQuill();

  useEffect(() => {
    if (quill) {
      const handleTextChange = () => {
        const html = quill.root.innerHTML;
        const text = quill.getText().trim();
        setContent(html);
        setErrors((prev) => ({
          ...prev,
          content: text ? "" : "Content cannot be empty",
        }));
      };

      quill.on("text-change", handleTextChange);
      return () => quill.off("text-change", handleTextChange);
    }
  }, [quill]);

  const validateForm = () => {
    const newErrors = {
      title: title.trim() ? "" : "Title cannot be empty",
      content: content.trim() ? "" : "Content cannot be empty",
      image:
        image && image.size > 5 * 1024 * 1024
          ? "File size must be less than 5MB"
          : "",
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      let imageUrl = "";
      if (image) {
        const result = await uploadImage(image);
        imageUrl = result.fileName;
      }

      await onCreate({ title, content, imageUrl });
      setTitle("");
      setContent("");
      setImage(null);
      quill.setText("");
      setSuccessMessage("Post created successfully!");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      console.error("Creation failed:", error);
      setErrors((prev) => ({ ...prev, general: error.message }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        image: "Invalid file type (JPEG, PNG, GIF only)",
      }));
      return;
    }

    setImage(file);
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h3 className="card-title">Create New Post</h3>

        {successMessage && (
          <div className="alert alert-success">{successMessage}</div>
        )}
        {errors.general && (
          <div className="alert alert-danger">{errors.general}</div>
        )}

        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setErrors((prev) => ({ ...prev, title: "" }));
            }}
            className={`form-control ${errors.title ? "is-invalid" : ""}`}
            placeholder="Enter post title"
          />
          {errors.title && (
            <div className="invalid-feedback">{errors.title}</div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Content</label>
          <div
            className={`quill-wrapper ${errors.content ? "border-danger" : ""}`}
          >
            <div ref={quillRef} style={{ height: "200px" }} />
          </div>
          {errors.content && (
            <div className="text-danger mt-2">{errors.content}</div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Featured Image</label>
          <input
            type="file"
            className="form-control"
            onChange={handleImageChange}
            accept="image/jpeg, image/png, image/gif"
          />
          {errors.image && (
            <div className="text-danger mt-2">{errors.image}</div>
          )}
          {image && (
            <div className="mt-2">
              <p className="mb-1">Selected Image: {image.name}</p>
              <img
                src={URL.createObjectURL(image)}
                alt="Preview"
                className="img-thumbnail"
                style={{ maxWidth: "200px" }}
              />
            </div>
          )}
        </div>

        <div className="mt-3">
          <button
            className="btn btn-primary me-2"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Post"}
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setTitle("");
              quill.setText("");
              setImage(null);
              setErrors({});
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
