import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile } from "../api";
import { Form, Button, Alert, Spinner, Card } from "react-bootstrap";

const EditProfile = () => {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    getProfile(token)
      .then((data) => {
        setProfile({ ...data, password: "" });
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching profile data", error);
        setError("Failed to load profile data");
        setLoading(false);
      });
  }, [navigate]);

  const validateForm = () => {
    const errors = {};
    if (!profile.username?.trim()) errors.username = "Username is required";
    if (!profile.email?.trim()) errors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(profile.email))
      errors.email = "Invalid email format";
    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    const token = localStorage.getItem("token");

    // Only send changed fields
    const updateData = {
      username: profile.username,
      email: profile.email,
      ...(profile.password && { password: profile.password }),
    };

    updateProfile(token, updateData)
      .then((response) => {
        console.log(updateData);
        setSuccess("Profile updated successfully");
        setError("");
        if (response.token) {
          localStorage.setItem("token", response.token);
        }
        setTimeout(() => setSuccess(""), 3000);
      })
      .catch((error) => {
        console.error("Error updating profile", error);
        setError(error.message || "Failed to update profile");
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    // Clear validation errors when user types
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <Card className="shadow-sm">
        <Card.Body>
          <h2 className="mb-4">Edit Profile</h2>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={profile.username}
                onChange={handleChange}
                isInvalid={!!validationErrors.username}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.username}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                isInvalid={!!validationErrors.email}
              />
              <Form.Control.Feedback type="invalid">
                {validationErrors.email}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label>
                New Password (leave blank to keep current)
              </Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={profile.password}
                onChange={handleChange}
                placeholder="Enter new password"
              />
            </Form.Group>

            <div className="d-flex justify-content-between">
              <Button variant="primary" type="submit">
                Update Profile
              </Button>
              <Button variant="outline-secondary" onClick={() => navigate(-1)}>
                Back to Dashboard
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default EditProfile;
