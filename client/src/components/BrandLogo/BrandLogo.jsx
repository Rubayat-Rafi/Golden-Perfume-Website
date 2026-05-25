import brandData from '../../data/brand/brandlogo.json';

const BrandLogo = () => {
  return (
    <div className="flex flex-wrap justify-center items-center gap-y-4 px-6 pb-8 md:pb-14">
      {brandData.map((logo) => (
        <a key={logo.id} href={logo.URL} className="mx-6 md:mx-14">
          <img src={logo.logoSrc} alt="" />
        </a>
      ))}
    </div>
  );
};

export default BrandLogo;
