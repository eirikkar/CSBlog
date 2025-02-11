import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useQuill } from 'react-quilljs'
import 'quill/dist/quill.snow.css'
import { uploadImage } from '../api'
import '../styles/CreatePost.css'

/**
 * CreatePost component for creating a new blog post.
 * @param {Object} props - The component props.
 * @param {function} props.onCreate - The function to call when creating a post.
 */
const CreatePost = ({ onCreate }) => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [image, setImage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const { quill, quillRef } = useQuill()

  /**
   * useEffect hook to set up Quill editor text change handler.
   */
  useEffect(() => {
    if (quill) {
      quill.on('text-change', () => {
        setContent(quill.root.innerHTML)
      })
    }
  }, [quill])

  /**
   * Validates the form inputs.
   * @returns {boolean} - True if the form is valid, false otherwise.
   */
  const validateForm = () => {
    const newErrors = {}
    if (!title.trim()) newErrors.title = 'Title is required'
    if (!content.trim() || quill.getText().trim().length < 50)
      newErrors.content = 'Content must be at least 50 characters'
    if (image && image.size > 5 * 1024 * 1024)
      newErrors.image = 'Image must be less than 5MB'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Handles form submission.
   * @param {Event} e - The form submit event.
   */
  const handleSubmit = async e => {
    e.preventDefault()
    if (!validateForm() || isSubmitting) return

    setIsSubmitting(true)

    try {
      let imageUrl = ''
      if (image) {
        try {
          const result = await uploadImage(image)
          imageUrl = result
        } catch (error) {
          setErrors({ ...errors, image: error.message })
          throw error
        }
      }

      const post = {
        title,
        content,
        imageUrl: imageUrl || null,
      }

      await onCreate(post)
      setSuccessMessage('Post created successfully!')
      resetForm()
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (error) {
      setErrors({ ...errors, general: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Resets the form inputs.
   */
  const resetForm = () => {
    setTitle('')
    setContent('')
    setImage(null)
    quill.root.innerHTML = ''
  }

  /**
   * Handles image file input change.
   * @param {Event} e - The file input change event.
   */
  const handleImageChange = e => {
    const file = e.target.files[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, image: 'Only image files are allowed' })
      return
    }

    setImage(file)
    setErrors({ ...errors, image: '' })
  }

  return (
    <div className='card mb-4'>
      <div className='card-body'>
        <h3 className='card-title'>Create New Post</h3>

        {successMessage && (
          <div className='alert alert-success'>{successMessage}</div>
        )}
        {errors.general && (
          <div className='alert alert-danger'>{errors.general}</div>
        )}

        <div className='mb-3'>
          <label className='form-label'>Title</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className={`form-control ${errors.title ? 'is-invalid' : ''}`}
            placeholder='Enter post title'
          />
          {errors.title && (
            <div className='invalid-feedback'>{errors.title}</div>
          )}
        </div>

        <div className='mb-3'>
          <label className='form-label'>Content</label>
          <div className={`quill-editor ${errors.content ? 'is-invalid' : ''}`}>
            <div ref={quillRef} />
          </div>
          {errors.content && (
            <div className='text-danger mt-2'>{errors.content}</div>
          )}
        </div>

        <div className='mb-3'>
          <label className='form-label'>Featured Image</label>
          <input
            type='file'
            className='form-control'
            onChange={handleImageChange}
            accept='image/*'
          />
          {errors.image && (
            <div className='text-danger mt-2'>{errors.image}</div>
          )}
          {image && (
            <div className='mt-2'>
              <img
                src={URL.createObjectURL(image)}
                alt='Preview'
                className='img-thumbnail preview-image'
              />
            </div>
          )}
        </div>

        <div className='d-flex gap-2 mt-4'>
          <button
            className='btn btn-primary'
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Post'}
          </button>
          <button
            type='button'
            className='btn btn-outline-secondary'
            onClick={resetForm}
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}

CreatePost.propTypes = {
  onCreate: PropTypes.func.isRequired,
}

export default CreatePost
