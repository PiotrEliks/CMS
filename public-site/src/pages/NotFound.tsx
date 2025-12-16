import { Link } from 'react-router-dom';
import Hero from '../components/Hero';

export default function NotFound() {
  return (
    <>
      <Hero title="404" subtitle="Strona nie znaleziona" backgroundImage="/images/hero_bg_2.jpg" />

      <div className="site-section">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 text-center">
              <h2 className="display-4 text-black mb-4">Ups!</h2>
              <p className="lead mb-5">
                Strona, ktorej szukasz, nie istnieje lub zostala przeniesiona.
              </p>
              <Link to="/" className="btn btn-primary py-3 px-5">
                Wroc na strone glowna
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
