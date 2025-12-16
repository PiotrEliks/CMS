import { Link } from 'react-router-dom';

interface FooterProps {
  siteName?: string;
  description?: string;
}

export default function Footer({ siteName = 'CMS Site', description }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="row">
          <div className="col-lg-4">
            <div className="mb-5">
              <h3 className="footer-heading mb-4">O {siteName}</h3>
              <p>{description || 'Witamy na naszej stronie. Znajdziesz tutaj najnowsze artykuly i informacje.'}</p>
            </div>
          </div>

          <div className="col-lg-4 mb-5 mb-lg-0">
            <div className="row mb-5">
              <div className="col-md-12">
                <h3 className="footer-heading mb-4">Menu</h3>
              </div>
              <div className="col-md-6 col-lg-6">
                <ul className="list-unstyled">
                  <li><Link to="/">Strona Glowna</Link></li>
                  <li><Link to="/artykuly">Artykuly</Link></li>
                </ul>
              </div>
              <div className="col-md-6 col-lg-6">
                <ul className="list-unstyled">
                  <li><Link to="/kontakt">Kontakt</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="col-lg-4 mb-5 mb-lg-0">
            <div className="mb-5">
              <h3 className="footer-heading mb-2">Newsletter</h3>
              <p>Zapisz sie do naszego newslettera, aby otrzymywac najnowsze informacje.</p>

              <form onSubmit={(e) => e.preventDefault()}>
                <div className="input-group mb-3">
                  <input
                    type="email"
                    className="form-control border-secondary text-white bg-transparent"
                    placeholder="Wpisz email"
                    aria-label="Wpisz email"
                  />
                  <div className="input-group-append">
                    <button className="btn btn-primary text-white" type="submit">
                      Wyslij
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="row pt-5 mt-5 text-center">
          <div className="col-md-12">
            <div className="mb-5">
              <a href="#" className="pl-0 pr-3"><span className="icon-facebook"></span></a>
              <a href="#" className="pl-3 pr-3"><span className="icon-twitter"></span></a>
              <a href="#" className="pl-3 pr-3"><span className="icon-instagram"></span></a>
              <a href="#" className="pl-3 pr-3"><span className="icon-linkedin"></span></a>
            </div>

            <p>
              Copyright &copy; {currentYear} {siteName}. Wszelkie prawa zastrzezone.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
