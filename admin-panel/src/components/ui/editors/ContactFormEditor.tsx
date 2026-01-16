import { useState } from 'react'
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { type ContactFormComponentData } from '../../../store/pageComponents'
import Button from '../../ui/button/Button'

interface ContactFormEditorProps {
  data: ContactFormComponentData
  onChange: (data: ContactFormComponentData) => void
}

type FieldType = 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox'

const fieldTypeLabels: Record<FieldType, string> = {
  text: 'Tekst',
  email: 'Email',
  tel: 'Telefon',
  textarea: 'Pole tekstowe (długie)',
  select: 'Lista wyboru',
  checkbox: 'Checkbox',
}

export default function ContactFormEditor({
  data,
  onChange,
}: ContactFormEditorProps) {
  const [formData, setFormData] = useState<ContactFormComponentData>({
    title: data.title || '',
    subtitle: data.subtitle || '',
    fields: data.fields || [],
    submitText: data.submitText || 'Wyślij',
    successMessage: data.successMessage || 'Dziękujemy za wiadomość!',
    emailTo: data.emailTo || '',
  })

  const [expandedField, setExpandedField] = useState<number | null>(null)

  const handleChange = (field: keyof ContactFormComponentData, value: any) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onChange(updated)
  }

  const addField = () => {
    const newField = {
      type: 'text' as FieldType,
      name: `field_${Date.now()}`,
      label: 'Nowe pole',
      placeholder: '',
      required: false,
    }

    handleChange('fields', [...formData.fields, newField])
    setExpandedField(formData.fields.length)
  }

  const updateField = (index: number, updates: any) => {
    const updatedFields = formData.fields.map((field, i) =>
      i === index ? { ...field, ...updates } : field
    )
    handleChange('fields', updatedFields)
  }

  const removeField = (index: number) => {
    handleChange(
      'fields',
      formData.fields.filter((_, i) => i !== index)
    )
    if (expandedField === index) setExpandedField(null)
  }

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= formData.fields.length) return

    const updatedFields = [...formData.fields]
    ;[updatedFields[index], updatedFields[newIndex]] = [
      updatedFields[newIndex],
      updatedFields[index],
    ]

    handleChange('fields', updatedFields)
  }

  const addOption = (fieldIndex: number) => {
    const field = formData.fields[fieldIndex]
    const options = field.options || []
    updateField(fieldIndex, {
      options: [...options, `Opcja ${options.length + 1}`],
    })
  }

  const updateOption = (
    fieldIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const field = formData.fields[fieldIndex]
    const options = field.options || []
    options[optionIndex] = value
    updateField(fieldIndex, { options })
  }

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const field = formData.fields[fieldIndex]
    const options = (field.options || []).filter((_, i) => i !== optionIndex)
    updateField(fieldIndex, { options })
  }

  const loadTemplate = (template: 'basic' | 'detailed') => {
    let fields = []

    switch (template) {
      case 'basic':
        fields = [
          {
            type: 'text',
            name: 'name',
            label: 'Imię i nazwisko',
            required: true,
          },
          {
            type: 'email',
            name: 'email',
            label: 'Adres email',
            required: true,
          },
          {
            type: 'textarea',
            name: 'message',
            label: 'Wiadomość',
            required: true,
          },
        ]
        break

      case 'detailed':
        fields = [
          {
            type: 'text',
            name: 'name',
            label: 'Imię i nazwisko',
            required: true,
          },
          {
            type: 'email',
            name: 'email',
            label: 'Email',
            required: true,
          },
          {
            type: 'tel',
            name: 'phone',
            label: 'Telefon',
            required: false,
          },
          {
            type: 'text',
            name: 'company',
            label: 'Firma',
            required: false,
          },
          {
            type: 'select',
            name: 'topic',
            label: 'Temat',
            required: true,
            options: ['Oferta', 'Pytanie', 'Wsparcie techniczne', 'Inne'],
          },
          {
            type: 'textarea',
            name: 'message',
            label: 'Wiadomość',
            required: true,
          },
        ]
        break
    }

    handleChange('fields', fields)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tytuł formularza
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="np. Skontaktuj się z nami"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Podtytuł
          </label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            placeholder="np. Wypełnij formularz, a odezwiemy się"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Szybkie szablony
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => loadTemplate('basic')}
          >
            Podstawowy (3 pola)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => loadTemplate('detailed')}
          >
            Szczegółowy (6 pól)
          </Button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Pola formularza ({formData.fields.length})
          </label>
          <Button
            size="sm"
            variant="primary"
            startIcon={<Plus />}
            onClick={addField}
          >
            Dodaj pole
          </Button>
        </div>

        {formData.fields.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 mb-3">
              Brak pól. Dodaj pierwsze pole lub użyj szablonu.
            </p>
            <Button size="sm" variant="primary" onClick={addField}>
              Dodaj pierwsze pole
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {formData.fields.map((field, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <div
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 cursor-pointer"
                  onClick={() =>
                    setExpandedField(expandedField === index ? null : index)
                  }
                >
                  <GripVertical className="w-4 h-4 text-gray-400" />

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {field.label}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
                        {fieldTypeLabels[field.type]}
                      </span>
                      {field.required && (
                        <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded">
                          Wymagane
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      name: {field.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        moveField(index, 'up')
                      }}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        moveField(index, 'down')
                      }}
                      disabled={index === formData.fields.length - 1}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeField(index)
                      }}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {expandedField === index && (
                  <div className="p-4 space-y-3 bg-white dark:bg-gray-900">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Typ pola
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) =>
                            updateField(index, {
                              type: e.target.value,
                            })
                          }
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                        >
                          {Object.entries(fieldTypeLabels).map(
                            ([value, label]) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            )
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Nazwa pola (name)
                        </label>
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) =>
                            updateField(index, {
                              name: e.target.value,
                            })
                          }
                          className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Etykieta (label)
                      </label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) =>
                          updateField(index, {
                            label: e.target.value,
                          })
                        }
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Placeholder
                      </label>
                      <input
                        type="text"
                        value={field.placeholder || ''}
                        onChange={(e) =>
                          updateField(index, {
                            placeholder: e.target.value,
                          })
                        }
                        placeholder="np. Wpisz swoje imię..."
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                      />
                    </div>

                    {field.type === 'select' && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            Opcje wyboru
                          </label>
                          <button
                            onClick={() => addOption(index)}
                            className="text-xs text-primary hover:underline"
                          >
                            + Dodaj opcję
                          </button>
                        </div>
                        <div className="space-y-1">
                          {(field.options || []).map((option, optIndex) => (
                            <div key={optIndex} className="flex gap-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) =>
                                  updateOption(index, optIndex, e.target.value)
                                }
                                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-800 dark:text-white"
                              />
                              <button
                                onClick={() => removeOption(index, optIndex)}
                                className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) =>
                          updateField(index, {
                            required: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-primary border-gray-300 rounded"
                      />
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Pole wymagane
                      </span>
                    </label>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tekst przycisku
          </label>
          <input
            type="text"
            value={formData.submitText}
            onChange={(e) => handleChange('submitText', e.target.value)}
            placeholder="Wyślij"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Wiadomość po wysłaniu
          </label>
          <input
            type="text"
            value={formData.successMessage}
            onChange={(e) => handleChange('successMessage', e.target.value)}
            placeholder="Dziękujemy za wiadomość!"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Adres email docelowy
        </label>
        <input
          type="email"
          value={formData.emailTo}
          onChange={(e) => handleChange('emailTo', e.target.value)}
          placeholder="kontakt@firma.pl"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Wiadomości z formularza będą wysyłane na ten adres
        </p>
      </div>
    </div>
  )
}
