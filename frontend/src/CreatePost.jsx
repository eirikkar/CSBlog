import React, { useEffect, useState } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";

const CreatePost = ({ onCreate }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [errors, setErrors] = useState({ title: "", content: "" });
    const { quill, quillRef } = useQuill();

    useEffect(() => {
        if (quill) {
            const handleTextChange = () => {
                setContent(quill.root.innerHTML);
                // Clear content error as user types
                if (quill.root.innerText.trim().length > 0) {
                    setErrors((prevErrors) => ({ ...prevErrors, content: "" }));
                }
            };

            quill.on("text-change", handleTextChange);

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
        quill.root.innerHTML = "";
        setErrors({ title: "", content: "" });
    };

    const handleReset = () => {
        setTitle("");
        setContent("");
        quill.root.innerHTML = "";
        setErrors({ title: "", content: "" });
    };

    return (
        <div className="card mb-4">
            <div className="card-body">
                <h3 className="card-title">Create New Post</h3>

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
                    />
                    {errors.title && (
                        <div className="invalid-feedback">{errors.title}</div>
                    )}
                </div>

                {/* Content Field */}
                <div className="mb-3">
                    <label htmlFor="postContent" className="form-label">
                        Content
                    </label>
                    <div
                        ref={quillRef}
                        style={{ height: "200px" }}
                        id="postContent"
                        className={errors.content ? "border border-danger" : ""}
                    />
                    {errors.content && (
                        <div className="text-danger mt-2">{errors.content}</div>
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
