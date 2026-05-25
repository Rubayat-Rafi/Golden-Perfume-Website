import { Leaf, Award, Sprout } from 'lucide-react';
import advantageData from '../../data/advantage/advantage.json';

const ICONS = { Leaf, Award, Sprout };

const Advantage = () => {
  return (
    <div className="pt-8 md:pt-16">
      <div className="max-w-305 mx-auto px-4 md:px-10">
        <div className="flex flex-col md:flex-row justify-center items-center md:items-start md:-mx-3">
          {advantageData.map((item) => {
            const Icon = ICONS[item.icon];
            return (
              <div key={item.icon} className="w-full md:w-1/3 md:mx-11.25 text-center mb-12 md:mb-0 last:mb-0">
                <div className="mb-8 md:mb-13.75">
                  <span className="relative inline-flex justify-center items-center">
                    <img
                      src="/assets/img/main-text-decor.png"
                      className="absolute w-20 h-17.5 md:w-27.5 md:h-23.75 object-contain pointer-events-none"
                      alt=""
                    />
                    {Icon && (
                      <Icon
                        size={70}
                        className="relative text-forest w-12.5 h-12.5 md:w-17.5 md:h-17.5"
                        strokeWidth={1}
                      />
                    )}
                  </span>
                </div>
                <h4 className="font-playfair text-[24px] md:text-[32px] leading-[130%] capitalize font-normal text-[#222222] mb-1.5">
                  {item.title}
                </h4>
                <p className="font-lato text-base text-[#666] leading-[170%]">
                  {item.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Advantage;
