import { useLocation } from "react-router-dom";

const SearchResults = () => {
    const location = useLocation();
    const { results } = location.state || { results: [] };

    return (
        <div className="container mt-4 mb-5">
            <h2>Search Results</h2>
            {results.length > 0 ? (
                <ul className="list-group">
                    {results.map((post) => (
                        <li key={post.id} className="list-group-item">
                            <h5>{post.title}</h5>
                            <p dangerouslySetInnerHTML={{ __html: post.content }}></p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No results found.</p>
            )}
        </div>
    );
};

export default SearchResults;
