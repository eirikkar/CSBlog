import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import Post from "./components/Post";
import Admin from "./components/Admin";
import Layout from "./components/Layout";

function App() {
  return (
    <Router>
      <Layout>
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/post/:id" element={<Post />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </Layout>
    </Router>
  );
}

export default App;
