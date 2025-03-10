import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginUser } from '../api'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({
    username: '',
    password: '',
    general: '',
  })
  const navigate = useNavigate()

  /**
   * Handles form submission for login.
   * Validates input fields and calls the loginUser function.
   * @param {Event} e - The form submission event.
   */
  const handleSubmit = async e => {
    e.preventDefault()
    setErrors({ username: '', password: '', general: '' })

    let hasError = false
    const newErrors = { username: '', password: '', general: '' }

    if (username.trim() === '') {
      newErrors.username = 'Username is required.'
      hasError = true
    }

    if (password.trim() === '') {
      newErrors.password = 'Password is required.'
      hasError = true
    }

    if (hasError) {
      setErrors(newErrors)
      return
    }

    try {
      await loginUser(username, password)
      navigate('/admin')
    } catch (error) {
      setErrors({ general: error.message })
      console.error('Login error:', error)
    }
  }

  return (
    <div className='d-flex justify-content-center align-items-center vh-100'>
      <div
        className='card p-4 shadow-sm'
        style={{ width: '100%', maxWidth: '400px' }}
      >
        <h3 className='card-title text-center mb-4'>Login</h3>
        {errors.general && (
          <div className='alert alert-danger' role='alert'>
            {errors.general}
          </div>
        )}
        <form onSubmit={handleSubmit} noValidate>
          <div className='mb-3'>
            <label htmlFor='username' className='form-label'>
              Username
            </label>
            <input
              type='text'
              className={`form-control ${errors.username ? 'is-invalid' : ''}`}
              id='username'
              value={username}
              onChange={e => {
                setUsername(e.target.value)
                if (e.target.value.trim() !== '') {
                  setErrors(prevErrors => ({ ...prevErrors, username: '' }))
                }
              }}
              aria-describedby='usernameError'
            />
            {errors.username && (
              <div className='invalid-feedback' id='usernameError'>
                {errors.username}
              </div>
            )}
          </div>

          <div className='mb-3'>
            <label htmlFor='password' className='form-label'>
              Password
            </label>
            <input
              type='password'
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              id='password'
              value={password}
              onChange={e => {
                setPassword(e.target.value)
                if (e.target.value.trim() !== '') {
                  setErrors(prevErrors => ({ ...prevErrors, password: '' }))
                }
              }}
              aria-describedby='passwordError'
            />
            {errors.password && (
              <div className='invalid-feedback' id='passwordError'>
                {errors.password}
              </div>
            )}
          </div>

          <button type='submit' className='btn btn-primary w-100'>
            Login
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
