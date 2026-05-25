const SectionTitle = ({
  subTitle,
  title,
  body,
  titleColor = 'text-[#2A2A2A]',
  bodyColor = 'text-forest/70',
}) => {
  return (
    <div className="text-center mb-6 md:mb-10 pl-2.5">
      <span className="font-lato text-brand-green text-[12px] uppercase tracking-[4px] block mb-5">
        {subTitle}
      </span>
      <h2 className={`font-playfair font-normal text-[20px] sm:text-[24px] md:text-[28px] xl:text-[34px] leading-none capitalize ${titleColor}`}>
        {title}
      </h2>
      <p className={`max-w-114 mx-auto mt-4 md:mt-7.25 font-lato text-[16px] leading-[170%] ${bodyColor}`}>
        {body}
      </p>
    </div>
  );
};

export default SectionTitle;
