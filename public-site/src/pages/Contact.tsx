import { useState, type FormEvent } from 'react';
import Hero from '../components/Hero';

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <>
      <Hero title="Kontakt" backgroundImage="/images/hero_bg_2.jpg" />

      <div className="site-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mb-5">
              <h2 className="site-section-heading font-weight-light text-black mb-5">
                Napisz do nas
              </h2>

              {submitted ? (
                <div className="alert alert-success">
                  <h4>Dziekujemy za wiadomosc!</h4>
                  <p>Odpowiemy najszybciej jak to mozliwe.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="row form-group">
                    <div className="col-md-6 mb-3 mb-md-0">
                      <label className="text-black" htmlFor="firstName">
                        Imie
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        className="form-control"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="text-black" htmlFor="lastName">
                        Nazwisko
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        className="form-control"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row form-group">
                    <div className="col-md-12">
                      <label className="text-black" htmlFor="email">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-control"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row form-group">
                    <div className="col-md-12">
                      <label className="text-black" htmlFor="subject">
                        Temat
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        className="form-control"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="row form-group">
                    <div className="col-md-12">
                      <label className="text-black" htmlFor="message">
                        Wiadomosc
                      </label>
                      <textarea
                        name="message"
                        id="message"
                        cols={30}
                        rows={7}
                        className="form-control"
                        value={formData.message}
                        onChange={handleChange}
                        required
                      ></textarea>
                    </div>
                  </div>

                  <div className="row form-group">
                    <div className="col-md-12">
                      <button type="submit" className="btn btn-primary py-3 px-5">
                        Wyslij wiadomosc
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>

            <div className="col-lg-4">
              <div className="p-4 bg-light">
                <h3 className="h5 text-black mb-4">Dane kontaktowe</h3>

                <p className="mb-4">
                  <strong className="d-block text-black">Adres:</strong>
                  <span>ul. Przykladowa 1, 00-001 Warszawa</span>
                </p>

                <p className="mb-4">
                  <strong className="d-block text-black">Telefon:</strong>
                  <span>+48 123 456 789</span>
                </p>

                <p className="mb-4">
                  <strong className="d-block text-black">Email:</strong>
                  <span>kontakt@example.com</span>
                </p>

                <p className="mb-0">
                  <strong className="d-block text-black">Godziny pracy:</strong>
                  <span>Pon - Pt: 9:00 - 17:00</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
