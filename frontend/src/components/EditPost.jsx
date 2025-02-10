import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import { uploadImage, deleteImage, updatePost, getImageUrl } from "../api";

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
    }, [quill, post.content]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            setErrors({ general: "Title and content are required" });
            return;
        }

        setIsSubmitting(true);

        try {
            let imageUrl = existingImage;

            if (image) {
                const uploadedFileName = await uploadImage(image);
                imageUrl = uploadedFileName;

                if (existingImage) {
                    await deleteImage(existingImage);
                }
            }

            await updatePost(post.id, {
                title,
                content,
                imageUrl: imageUrl || null,
            });

            onUpdate();
        } catch (error) {
            setErrors({ general: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveImage = async () => {
        try {
            if (existingImage) {
                await deleteImage(existingImage);
                setExistingImage(null);
            }
        } catch (error) {
            setErrors({ general: error.message });
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
                    <div className="quill-editor">
                        <div ref={quillRef} />
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label">Update Image</label>
                    <input
                        type="file"
                        className="form-control"
                        onChange={(e) => setImage(e.target.files[0])}
                        accept="image/*"
                    />

                    {existingImage && (
                        <div className="mt-3">
                            <p>Current Image:</p>
                            <div className="d-flex align-items-center gap-3">
                                <img
                                    src={getImageUrl(existingImage)}
                                    alt="Current"
                                    className="img-thumbnail preview-image"
                                />
                                <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={handleRemoveImage}
                                >
                                    Remove Image
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="d-flex gap-2 mt-4">
                    <button
                        className="btn btn-success"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Updating..." : "Update Post"}
                    </button>
                    <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

EditPost.propTypes = {
    post: PropTypes.shape({
        id: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        imageUrl: PropTypes.string,
    }).isRequired,
    onUpdate: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default EditPost;
