import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, ArrowRight } from 'lucide-react';

const Info = () => {
  const [play, setPlay] = useState(false);
  const videoUrl = play ? 'https://www.youtube.com/embed/K1yp7Q1hH1c?autoplay=1' : '';

  return (
    <div className="pt-7.5">
      {/* Block 1 — image left, text right */}
      <div
        className="relative bg-[#faf9ff] bg-no-repeat bg-bottom-right"
        style={{ backgroundImage: "url('/assets/img/info-item-bg1.jpg')" }}
      >
        {/* Image: stacked on mobile, absolute left half on md+ */}
        <div className="w-full h-64 sm:h-80 md:absolute md:inset-y-0 md:left-0 md:w-1/2 md:h-auto">
          <img src="/assets/img/info-item-img1.jpg" alt="" className="w-full h-full object-cover" />
        </div>
        {/* Text: full width on mobile, right half on md+ */}
        <div className="px-6 py-10 sm:px-10 md:w-1/2 md:ml-auto md:px-0 md:py-0 md:pt-24 md:pb-24 md:pl-16 lg:pl-29">
          <span className="font-lato text-gold text-[12px] uppercase tracking-[4px] block mb-5">
            Check This Out
          </span>
          <h2 className="font-playfair font-normal text-[28px] sm:text-[36px] md:text-[40px] lg:text-[48px] leading-none capitalize text-[#2A2A2A]">
            new collection for delicate skin
          </h2>
          <span className="font-playfair text-[16px] md:text-[18px] lg:text-[20px] leading-[150%] text-[#666] block mt-5 md:mt-7.75">
            Nourish your skin with toxin-free cosmetic products. With the offers that you can't refuse.
          </span>
          <p className="hidden sm:block font-lato text-base leading-[170%] text-[#666] mt-4 md:mt-6">
            Non aliqua reprehenderit reprehenderit culpa laboris nulla minim anim velit adipisicing ea
            aliqua alluptate sit do do. Non aliqua reprehenderit reprehenderit culpa laboris nulla minim
            anim velit adipisicing ea aliqua alluptate sit do do. Non aliqua reprehenderit reprehenderit
            culpa laboris nulla minim.
          </p>
          <Link
            to="/shop"
            className="inline-block mt-6 md:mt-8.75 h-15 leading-15 bg-gold text-dark-green font-lato font-bold text-sm uppercase tracking-[2px] px-12.5 rounded-[3px] hover:bg-[#c49843] transition-colors duration-300"
          >
            Shop now
          </Link>
        </div>
      </div>

      {/* Block 2 — video right, text left */}
      <div
        className="relative bg-[#fcedea] bg-no-repeat bg-bottom-left"
        style={{ backgroundImage: "url('/assets/img/info-item-bg2.jpg')" }}
      >
        {/* Video: stacked on mobile (at top), absolute right half on md+ */}
        <div className="w-full h-64 sm:h-80 md:absolute md:inset-y-0 md:right-0 md:w-1/2 md:h-auto overflow-hidden">
          <img src="/assets/img/info-item-img2.jpg" alt="" className="w-full h-full object-cover" />
          {play && (
            <iframe
              src={videoUrl}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
            />
          )}
          {!play && (
            <div className="absolute inset-0 bg-[rgba(34,34,34,0.3)] flex flex-col justify-center items-center z-10">
              <span className="font-playfair text-[22px] md:text-[40px] leading-[140%] text-white capitalize mb-4 md:mb-11.25 md:-mt-25.25">
                Promotion video
              </span>
              <button
                onClick={() => setPlay(true)}
                className="w-20 h-20 md:w-37.5 md:h-37.5 rounded-full border-2 md:border-3 border-white cursor-pointer hover:opacity-80 transition-opacity duration-300"
              >
                <img src="/assets/img/play-btn.png" alt="Play" className="w-full h-full object-contain" />
              </button>
            </div>
          )}
        </div>
        {/* Text: full width on mobile, left half on md+ */}
        <div className="px-6 py-10 sm:px-10 md:w-1/2 md:px-0 md:py-0 md:pt-24 md:pb-24 md:pl-16 lg:pl-29 md:pr-2.5">
          <span className="font-lato text-gold text-[12px] uppercase tracking-[4px] block mb-5">
            About Us
          </span>
          <h2 className="font-playfair font-normal text-[28px] sm:text-[36px] md:text-[40px] lg:text-[48px] leading-none capitalize text-[#2A2A2A]">
            Who we are
          </h2>
          <span className="font-playfair text-[16px] md:text-[18px] lg:text-[20px] leading-[150%] text-[#666] block mt-5 md:mt-7.75">
            Nourish your skin with toxin-free cosmetic products. With the offers that you can't refuse.
          </span>
          <p className="hidden sm:block font-lato text-base leading-[170%] text-[#666] mt-4 md:mt-6">
            Non aliqua reprehenderit reprehenderit culpa laboris nulla minim anim velit adipisicing ea
            aliqua alluptate sit do do. Non aliqua reprehenderit reprehenderit culpa laboris nulla minim
            anim velit adipisicing ea aliqua alluptate sit do do. Non aliqua reprehenderit reprehenderit
            culpa laboris nulla minim.
          </p>
          <Link
            to="/about"
            className="group font-lato font-bold text-[14px] uppercase flex items-center text-[#222] mt-6 md:mt-8.75 hover:opacity-80 transition-opacity duration-300"
          >
            <Play size={20} className="mr-3 md:mr-5 shrink-0" />
            Watch video about us
            <ArrowRight
              size={51}
              strokeWidth={1}
              className="ml-3 md:ml-4.75 group-hover:ml-5 md:group-hover:ml-6.25 transition-all duration-300 w-8 h-8 md:w-12.75 md:h-12.75"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Info;
