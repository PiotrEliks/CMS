import { Request, Response } from 'express'
import { sendContactFormEmail } from '../../utils/mailer.js'

export async function submitContactForm(req: Request, res: Response) {
  try {
    const { formData, emailTo, subject } = req.body

    if (!formData || typeof formData !== 'object') {
      return res.status(400).json({ error: 'Brak danych formularza' })
    }

    if (!emailTo || typeof emailTo !== 'string') {
      return res.status(400).json({ error: 'Brak adresu email odbiorcy' })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(emailTo)) {
      return res.status(400).json({ error: 'Nieprawidlowy adres email' })
    }

    await sendContactFormEmail({
      to: emailTo,
      formData,
      subject,
    })

    res.json({
      success: true,
      message: 'Formularz zostal wyslany pomyslnie',
    })
  } catch (error: any) {
    console.error('Contact form submission error:', error)
    res.status(500).json({
      error: 'Wystapil blad podczas wysylania formularza',
    })
  }
}
