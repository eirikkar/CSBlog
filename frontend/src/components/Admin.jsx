import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  getPosts,
  deletePost,
  createPost,
  deleteImage,
  verifyToken,
  getImageUrl,
} from '../api'
import CreatePost from './CreatePost'
import EditPost from './EditPost'
import ConfirmDialog from './ConfirmDialog'
import '../styles/Admin.css'

/**
 * Admin component for managing blog posts.
 * Handles fetching, creating, updating, and deleting posts.
 */
const Admin = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [editPost, setEditPost] = useState(null)
  const [postToDelete, setPostToDelete] = useState(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Check if the token exists and is valid on component mount.
  useEffect(() => {
    const checkAuthAndLoadPosts = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      try {
        await verifyToken()
        setIsAuthenticated(true)
        await fetchPosts()
      } catch (error) {
        console.error('Token verification failed:', error)
        localStorage.removeItem('token')
        setIsAuthenticated(false)
        navigate('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthAndLoadPosts()

    // Set up periodic token verification (every 60 seconds)
    const intervalId = setInterval(async () => {
      try {
        await verifyToken()
        setIsAuthenticated(true)
      } catch (error) {
        console.error('Periodic verification failed:', error)
        localStorage.removeItem('token')
        setIsAuthenticated(false)
        navigate('/login')
      }
    }, 60000)

    return () => clearInterval(intervalId)
  }, [navigate])

  /**
   * Fetches posts from the API and updates the state.
   */
  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      const posts = await getPosts()
      setPosts(posts)
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handles user logout by removing the token and navigating to login page.
   */
  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    navigate('/login')
  }

  /**
   * Handles creating a new post.
   * @param {Object} newPost - The new post data.
   */
  const handleCreatePost = async newPost => {
    try {
      await verifyToken()
      const createdPost = await createPost(newPost)
      console.log('Created post:', createdPost)
      fetchPosts()
    } catch (error) {
      console.error('Error creating post:', error)
      if (error.message === 'Invalid token') {
        handleLogout()
      }
    }
  }

  /**
   * Handles updating a post.
   */
  const handleUpdatePost = async () => {
    try {
      await verifyToken()
      await fetchPosts()
      setEditPost(null)
    } catch (error) {
      console.error('Error updating post:', error)
      if (error.message === 'Invalid token') {
        handleLogout()
      }
    }
  }

  /**
   * Handles confirming the deletion of a post.
   */
  const handleConfirmDelete = async () => {
    try {
      await verifyToken()
      setIsDeleting(true)
      const post = posts.find(p => p.id === postToDelete)

      if (post?.imageUrl) {
        try {
          await deleteImage(post.imageUrl)
        } catch (error) {
          console.error('Failed to delete image:', error)
          throw error
        }
      }

      await deletePost(postToDelete)
      setPosts(prev => prev.filter(p => p.id !== postToDelete))
    } catch (error) {
      console.error('Error deleting post:', error)
      if (error.message === 'Invalid token') {
        handleLogout()
      }
    } finally {
      setIsDeleting(false)
      setShowConfirmDialog(false)
      setPostToDelete(null)
    }
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

  if (!isAuthenticated) {
    return (
      <div className='container text-center mt-5'>
        <h3>Session expired. Please login again.</h3>
        <button
          className='btn btn-primary mt-3'
          onClick={() => navigate('/login')}
        >
          Go to Login
        </button>
      </div>
    )
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className='container mt-4'>
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <h2>Admin Dashboard</h2>
        <button className='btn btn-danger' onClick={handleLogout}>
          Logout
        </button>
      </div>

      <CreatePost onCreate={handleCreatePost} />

      {editPost && (
        <EditPost
          post={editPost}
          onUpdate={handleUpdatePost}
          onCancel={() => setEditPost(null)}
        />
      )}

      <div className='mt-5'>
        <h3 className='mb-4'>Manage Posts</h3>
        {posts.length === 0 ? (
          <p>No posts available.</p>
        ) : (
          <div className='row justify-content-center'>
            {posts.map(post => (
              <div key={post.id} className='col-md-6 col-lg-4 mb-4'>
                <div className='card h-100 shadow-sm'>
                  {post.imageUrl && (
                    <div className='card-img-container'>
                      <img
                        src={getImageUrl(post.imageUrl)}
                        className='post-image'
                        alt={post.title}
                      />
                    </div>
                  )}
                  <div className='card-body d-flex flex-column'>
                    <h5 className='card-title'>{post.title || 'Untitled'}</h5>
                    <p className='card-text'>
                      {stripHtml(post.content).substring(0, 100)}...
                    </p>
                    <div className='mt-auto'>
                      <button
                        className='btn btn-primary btn-sm me-2'
                        onClick={() => setEditPost(post)}
                      >
                        Edit
                      </button>
                      <button
                        className='btn btn-danger btn-sm'
                        onClick={() => {
                          setPostToDelete(post.id)
                          setShowConfirmDialog(true)
                        }}
                      >
                        Delete
                      </button>
                      <Link
                        to={`/post/${post.id}`}
                        className='btn btn-primary btn-sm me-2'
                      >
                        Read Post
                      </Link>
                    </div>
                  </div>
                  <div className='card-footer bg-transparent'>
                    <small className='text-muted'>
                      Created:{' '}
                      {new Date(post.createdAt).toLocaleDateString('nb-NO')}
                      {post.updatedAt !== post.createdAt && (
                        <>
                          {' '}
                          | Updated:{' '}
                          {new Date(post.updatedAt).toLocaleDateString('nb-NO')}
                        </>
                      )}
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        show={showConfirmDialog}
        title='Confirm Delete'
        message='Are you sure you want to delete this post? This action cannot be undone.'
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setShowConfirmDialog(false)
          setPostToDelete(null)
        }}
        isDeleting={isDeleting}
      />
    </div>
  )
}

export default Admin
