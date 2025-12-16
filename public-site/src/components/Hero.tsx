interface HeroProps {
  title: string;
  subtitle?: string;
  backgroundImage?: string;
  buttonText?: string;
  buttonLink?: string;
}

export default function Hero({
  title,
  subtitle,
  backgroundImage = '/images/hero_bg_1.jpg',
  buttonText,
  buttonLink,
}: HeroProps) {
  return (
    <div
      className="site-blocks-cover"
      style={{ backgroundImage: `url(${backgroundImage})` }}
      data-aos="fade"
    >
      <div className="container">
        <div className="row align-items-center justify-content-center text-center">
          <div className="col-md-8" data-aos="fade-up" data-aos-delay="400">
            {subtitle && (
              <h5 className="text-white font-weight-light text-uppercase">{subtitle}</h5>
            )}
            <h2 className="text-white font-weight-light mb-2 display-1">{title}</h2>
            {buttonText && buttonLink && (
              <p>
                <a href={buttonLink} className="btn btn-black py-3 px-5">
                  {buttonText}
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
