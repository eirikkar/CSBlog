import react, { useeffect, usestate } from "react";
import { useparams } from "react-router-dom";
import { getpost } from "./api";

const post = () => {
  const { id } = useparams();
  const [post, setpost] = usestate(null);

  useeffect(() => {
    async function fetchpost() {
      const data = await getpost(id);
      setpost(data);
    }
    fetchpost();
  }, [id]);

  if (!post) {
    return <div>loading...</div>;
  }

  return (
    <div>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </div>
  );
};

export default post;
