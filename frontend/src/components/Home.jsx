import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getPosts, getImageUrl } from '../api.jsx'

/**
 * Home component for displaying a list of blog posts.
 */
const Home = () => {
  const [posts, setPosts] = useState([])

  /**
   * useEffect hook to fetch posts on component mount.
   */
  useEffect(() => {
    async function fetchPosts() {
      try {
        const data = await getPosts()
        setPosts(data)
      } catch (error) {
        console.error('Error fetching posts:', error)
      }
    }
    fetchPosts()
  }, [])

  return (
    <div className='mt-4'>
      <div className='row justify-content-center'>
        {posts.map(post => (
          <div key={post.id} className='col-md-8 col-lg-6 mb-4'>
            <div className='card h-100 shadow-sm'>
              {post.imageUrl && (
                <div
                  className='card-img-container'
                  style={{
                    height: '200px',
                    overflow: 'hidden',
                    borderTopLeftRadius: 'calc(0.25rem - 1px)',
                    borderTopRightRadius: 'calc(0.25rem - 1px)',
                  }}
                >
                  <img
                    src={getImageUrl(post.imageUrl)}
                    className='img-fluid h-100 w-100 object-fit-cover'
                    alt={post.title}
                    style={{
                      objectFit: 'cover',
                      objectPosition: 'center',
                    }}
                  />
                </div>
              )}
              <div className='card-body d-flex flex-column'>
                <h5 className='card-title'>{post.title || 'Untitled'}</h5>
                <p className='card-text'>
                  {stripHtml(post.content).substring(0, 150)}...
                </p>
                <div className='mt-auto'>
                  <Link to={`/post/${post.id}`} className='btn btn-primary'>
                    Read More
                  </Link>
                </div>
              </div>
              <div className='card-footer bg-transparent border-top-0'>
                <small className='text-muted'>
                  Posted on{' '}
                  {new Date(post.createdAt).toLocaleDateString('nb-NO')}
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Strips HTML tags from a string.
 * @param {string} html - The HTML string to strip.
 * @returns {string} - The plain text string.
 */
const stripHtml = html => {
  const tmp = document.createElement('DIV')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

export default Home
