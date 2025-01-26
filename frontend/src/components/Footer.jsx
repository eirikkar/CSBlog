import React from "react";

const Footer = () => {
  return (
    <footer className="footer bg-dark text-white py-4 mt-auto">
      <div className="container text-center">
        <div className="row">
          {/* About Section */}
          <div className="col-md-4 mb-3 mb-md-0">
            <h5>About</h5>
            <p>
              MyModernBlog is a platform to share insightful articles and
              engaging content.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-md-4 mb-3 mb-md-0">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li>
                <a href="/" className="text-white text-decoration-none">
                  Home
                </a>
              </li>
              <li>
                <a href="/admin" className="text-white text-decoration-none">
                  Admin
                </a>
              </li>
              <li>
                <a href="/login" className="text-white text-decoration-none">
                  Login
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="col-md-4">
            <h5>Follow Us</h5>
            <a href="#" className="me-2 text-white">
              <i className="bi bi-facebook" style={{ fontSize: "1.5rem" }}></i>
            </a>
            <a href="#" className="me-2 text-white">
              <i className="bi bi-twitter" style={{ fontSize: "1.5rem" }}></i>
            </a>
            <a href="#" className="text-white">
              <i className="bi bi-instagram" style={{ fontSize: "1.5rem" }}></i>
            </a>
          </div>
        </div>
        <hr className="my-3" />
        <p className="mb-0">
          &copy; {new Date().getFullYear()} MyModernBlog. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
