import React, { useEffect, useState } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import "./CreatePost.css";

const CreatePost = ({ onCreate }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [errors, setErrors] = useState({ title: "", content: "" });
    const [successMessage, setSuccessMessage] = useState("");
    const { quill, quillRef } = useQuill();

    useEffect(() => {
        if (quill) {
            const handleTextChange = () => {
                setContent(quill.root.innerHTML);
                const plainText = quill.root.innerText.trim();
                if (plainText.length > 0) {
                    setErrors((prevErrors) => ({ ...prevErrors, content: "" }));
                } else {
                    setErrors((prevErrors) => ({
                        ...prevErrors,
                        content: "Content cannot be empty.",
                    }));
                }
            };

            quill.on("text-change", handleTextChange);

            // Initial validation
            const initialPlainText = quill.root.innerText.trim();
            if (initialPlainText.length === 0) {
                setErrors((prevErrors) => ({
                    ...prevErrors,
                    content: "Content cannot be empty.",
                }));
            }

            return () => {
                quill.off("text-change", handleTextChange);
            };
        }
    }, [quill]);

    const handleSubmit = () => {
        const newErrors = { title: "", content: "" };
        let isValid = true;

        if (title.trim() === "") {
            newErrors.title = "Title cannot be empty.";
            isValid = false;
        }

        // Strip HTML tags to check if content has actual text
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = content;
        const plainText = tempDiv.textContent || tempDiv.innerText || "";
        if (plainText.trim() === "") {
            newErrors.content = "Content cannot be empty.";
            isValid = false;
        }

        setErrors(newErrors);

        if (!isValid) {
            return;
        }

        onCreate({ title, content });
        setTitle("");
        setContent("");
        if (quill) {
            quill.setText("");
        }
        setErrors({ title: "", content: "" });
        setSuccessMessage("Post created successfully!");

        setTimeout(() => {
            setSuccessMessage("");
        }, 5000);
    };

    const handleReset = () => {
        setTitle("");
        setContent("");
        if (quill) {
            quill.setText("");
        }
        setErrors({ title: "", content: "" });
        setSuccessMessage("");
    };

    return (
        <div className="card mb-4">
            <div className="card-body">
                <h3 className="card-title">Create New Post</h3>

                {/* Success Message */}
                {successMessage && (
                    <div className="alert alert-success" role="alert">
                        {successMessage}
                    </div>
                )}

                {/* Title Field */}
                <div className="mb-3">
                    <label htmlFor="postTitle" className="form-label">
                        Title
                    </label>
                    <input
                        type="text"
                        className={`form-control ${errors.title ? "is-invalid" : ""}`}
                        id="postTitle"
                        placeholder="Enter post title"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            // Clear title error as user types
                            if (e.target.value.trim() !== "") {
                                setErrors((prevErrors) => ({ ...prevErrors, title: "" }));
                            }
                        }}
                        aria-describedby="titleError"
                    />
                    {errors.title && (
                        <div className="invalid-feedback" id="titleError">
                            {errors.title}
                        </div>
                    )}
                </div>

                {/* Content Field */}
                <div className="mb-3">
                    <label htmlFor="postContent" className="form-label">
                        Content
                    </label>
                    <div
                        className={`quill-wrapper ${errors.content ? "border border-danger" : ""
                            }`}
                        aria-describedby="contentError"
                    >
                        <div ref={quillRef} style={{ height: "200px" }} id="postContent" />
                    </div>
                    {errors.content && (
                        <div className="text-danger mt-2" id="contentError">
                            {errors.content}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="mt-3">
                    <button className="btn btn-primary me-2" onClick={handleSubmit}>
                        Create Post
                    </button>
                    <button className="btn btn-secondary" onClick={handleReset}>
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePost;
