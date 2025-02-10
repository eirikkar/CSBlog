const Footer = () => {
    return (
        <footer className="footer bg-dark text-white py-3 mt-auto">
            <div className="container text-center">
                <div className="row">
                    {/* About Section */}
                    <div className="col-md-6 mb-3 mb-md-0">
                        <h5>About</h5>
                        <p>
                            Welcome to my personal blog, where I share insights on topics that
                            interest me. I hope you find something valuable and engaging here!
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="col-md-6 mb-3 mb-md-0">
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
                </div>
                <hr className="my-3" />
                <p className="mb-0">
                    &copy; {new Date().getFullYear()} Backend Bytes. All rights reserved.
                </p>
            </div>
        </footer>
    );
};

export default Footer;
