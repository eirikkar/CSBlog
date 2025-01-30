import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import Post from "./components/Post";
import Admin from "./components/Admin";
import Layout from "./components/Layout";
import SearchResults from "./components/SearchResults";
import EditProfile from "./components/EditProfile";

function App() {
  return (
    <Router>
      <Layout>
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/post/:id" element={<Post />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/edit-profile" element={<EditProfile />} />
            <Route path="*" element={<h1>Not Found</h1>} />
          </Routes>
        </div>
      </Layout>
    </Router>
  );
}

export default App;
