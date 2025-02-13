import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { searchPosts, verifyToken } from '../api'
import logo from '../assets/profilbilde.svg'

/**
 * Navbar component for navigation and search functionality.
 */
const Navbar = () => {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check local storage for token initially
  const token = localStorage.getItem('token')

  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setIsAuthenticated(false)
        return
      }
      try {
        // verifyToken is an API call to check if the token is valid
        await verifyToken()
        setIsAuthenticated(true)
      } catch {
        // If token verification fails, remove the token and mark as not auth
        localStorage.removeItem('token')
        setIsAuthenticated(false)
      }
    }
    checkToken()
  }, [token])

  /**
   * Handles user logout by removing the token and navigating to login page.
   */
  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    navigate('/login')
  }

  /**
   * Handles search form submission.
   * @param {Event} e - The form submit event.
   */
  const handleSearch = async e => {
    e.preventDefault()
    if (searchQuery.trim() === '') return

    try {
      const results = await searchPosts(searchQuery)
      navigate('/search', { state: { results } })
    } catch {
      navigate('/search', { state: { results: [] } })
    }
  }

  return (
    <nav className='navbar navbar-expand-lg navbar-dark bg-dark'>
      <div className='container'>
        <Link className='navbar-brand' to='/'>
          <img
            src={logo}
            alt='Logo'
            style={{
              height: '30px',
              marginRight: '10px',
              filter: 'invert(1)',
            }}
          />
          Backend Bytes
        </Link>
        <button
          className='navbar-toggler'
          type='button'
          data-bs-toggle='collapse'
          data-bs-target='#navbarNav'
          aria-controls='navbarNav'
          aria-expanded='false'
          aria-label='Toggle navigation'
        >
          <span className='navbar-toggler-icon'></span>
        </button>
        <div className='collapse navbar-collapse' id='navbarNav'>
          <ul className='navbar-nav ms-auto'>
            <li className='nav-item'>
              <form className='d-flex' onSubmit={handleSearch}>
                <input
                  className='form-control me-2'
                  type='search'
                  placeholder='Search'
                  aria-label='Search'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <button className='btn btn-outline-success' type='submit'>
                  Search
                </button>
              </form>
            </li>
            {isAuthenticated ? (
              <>
                <li className='nav-item'>
                  <Link className='nav-link' to='/admin'>
                    Admin
                  </Link>
                </li>
                <li className='nav-item'>
                  <Link className='nav-link' to='/admin/edit-profile'>
                    Edit Profile
                  </Link>
                </li>
                <li className='nav-item'>
                  <button
                    className='btn btn-link nav-link'
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li className='nav-item'>
                <Link className='nav-link' to='/login'>
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
