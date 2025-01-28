import React, { useEffect, useState } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import { uploadImage, deleteImage } from "../api";
import "../styles/Admin.css";

const EditPost = ({ post, onUpdate, onCancel }) => {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState(post.imageUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const { quill, quillRef } = useQuill();

  useEffect(() => {
    if (quill) {
      quill.clipboard.dangerouslyPasteHTML(post.content);
      quill.on("text-change", () => setContent(quill.root.innerHTML));
    }
  }, [quill]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrors({ general: "Title and content are required" });
      return;
    }

    setIsSubmitting(true);

    try {
      let newImage = existingImage;

      if (image) {
        const uploaded = await uploadImage(image);
        newImage = uploaded.fileName;
        if (existingImage) await deleteImage(existingImage);
      }

      await onUpdate({
        ...post,
        title,
        content,
        imageUrl: newImage,
      });
    } catch (error) {
      console.error("Update failed:", error);
      setErrors({ general: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h3 className="card-title">Edit Post</h3>

        {errors.general && (
          <div className="alert alert-danger">{errors.general}</div>
        )}

        <div className="mb-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="form-control"
            placeholder="Post Title"
          />
        </div>

        <div className="mb-3">
          <div ref={quillRef} style={{ height: "200px" }} />
        </div>

        <div className="mb-3">
          <label className="form-label">Update Image</label>
          <input
            type="file"
            className="form-control"
            onChange={(e) => setImage(e.target.files[0])}
            accept="image/jpeg, image/png, image/gif"
          />

          {existingImage && (
            <div className="mt-3">
              <p>Current Image:</p>
              <img
                src={`http://localhost:5073/uploads/${existingImage}`}
                alt="Current"
                className="img-thumbnail"
                style={{ maxWidth: "200px" }}
              />
              <button
                className="btn btn-sm btn-danger ms-2"
                onClick={async () => {
                  await deleteImage(existingImage);
                  setExistingImage(null);
                }}
              >
                Remove Image
              </button>
            </div>
          )}
        </div>

        <div className="mt-3">
          <button
            className="btn btn-success me-2"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Post"}
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
