import { useState, type FormEvent } from 'react'
import { api } from '../../api/axios'
import type { ContactFormComponentData } from '../../types'

interface ContactFormRendererProps {
  data: ContactFormComponentData
}

export default function ContactFormRenderer({ data }: ContactFormRendererProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (name: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Build form data with labels for readable email
    const formDataWithLabels: Record<string, any> = {}
    data.fields?.forEach((field) => {
      if (formValues[field.name] !== undefined) {
        formDataWithLabels[field.label] = formValues[field.name]
      }
    })

    try {
      await api.post('/contact/submit', {
        formData: formDataWithLabels,
        emailTo: data.emailTo,
      })
      setSubmitted(true)
    } catch (err: any) {
      console.error('Contact form error:', err)
      setError(
        err.response?.data?.error || 'Wystapil blad podczas wysylania formularza'
      )
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="site-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="alert alert-success text-center py-5">
                <h4 className="mb-3">Dziekujemy!</h4>
                <p className="mb-0">
                  {data.successMessage || 'Twoja wiadomosc zostala wyslana pomyslnie.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="site-section">
      <div className="container">
        {(data.title || data.subtitle) && (
          <div className="row mb-5">
            <div className="col-12 text-center">
              {data.title && <h2 className="site-section-heading">{data.title}</h2>}
              {data.subtitle && <p className="text-muted">{data.subtitle}</p>}
            </div>
          </div>
        )}

        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded shadow-sm">
              {data.fields?.map((field) => (
                <div key={field.name} className="mb-3">
                  <label htmlFor={field.name} className="form-label">
                    {field.label}
                    {field.required && <span className="text-danger"> *</span>}
                  </label>

                  {field.type === 'textarea' ? (
                    <textarea
                      id={field.name}
                      name={field.name}
                      className="form-control"
                      rows={5}
                      placeholder={field.placeholder}
                      required={field.required}
                      value={formValues[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                    />
                  ) : field.type === 'select' ? (
                    <select
                      id={field.name}
                      name={field.name}
                      className="form-control"
                      required={field.required}
                      value={formValues[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                    >
                      <option value="">-- Wybierz --</option>
                      {field.options?.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'checkbox' ? (
                    <div className="form-check">
                      <input
                        type="checkbox"
                        id={field.name}
                        name={field.name}
                        className="form-check-input"
                        required={field.required}
                        checked={formValues[field.name] || false}
                        onChange={(e) => handleChange(field.name, e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor={field.name}>
                        {field.placeholder || field.label}
                      </label>
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      id={field.name}
                      name={field.name}
                      className="form-control"
                      placeholder={field.placeholder}
                      required={field.required}
                      value={formValues[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                    />
                  )}
                </div>
              ))}

              {error && (
                <div className="alert alert-danger mb-3" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-lg w-100 py-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Wysylanie...
                  </>
                ) : (
                  data.submitText || 'Wyslij'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
