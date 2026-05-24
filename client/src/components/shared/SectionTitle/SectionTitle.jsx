const SectionTitle = ({ subTitle, title, body }) => {
  return (
    <div className="text-center mb-[59px] pl-[10px]">
      <span className="font-lato text-gold text-[12px] uppercase tracking-[4px] block mb-5">
        {subTitle}
      </span>
      <h2 className="font-playfair font-normal text-[#2A2A2A] text-[40px] md:text-[48px] xl:text-[54px] leading-[1] capitalize">
        {title}
      </h2>
      <p className="max-w-[456px] mx-auto mt-[29px] font-lato text-[16px] leading-[170%] text-[#666]">
        {body}
      </p>
    </div>
  );
};

export default SectionTitle;
