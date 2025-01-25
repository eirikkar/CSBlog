import React, { useEffect, useState } from "react";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";

const CreatePost = ({ onCreate }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const { quill, quillRef } = useQuill();

    useEffect(() => {
        if (quill) {
            const handleTextChange = () => {
                setContent(quill.root.innerHTML);
            };

            quill.on("text-change", handleTextChange);

            return () => {
                quill.off("text-change", handleTextChange);
            };
        }
    }, [quill]);

    const handleSubmit = () => {
        if (title.trim() === "" || content.trim() === "") {
            alert("Title and Content cannot be empty.");
            return;
        }
        onCreate({ title, content });
        setTitle("");
        setContent("");
        quill.root.innerHTML = "";
    };

    return (
        <div>
            <h3>Create New Post</h3>
            <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <div ref={quillRef} style={{ height: "200px" }} />
            <button onClick={handleSubmit}>Create Post</button>
        </div>
    );
};

export default CreatePost;
