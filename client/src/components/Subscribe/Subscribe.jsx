const Subscribe = () => {
  return (
    <section
      className="mt-8 md:mt-16 relative py-12 md:py-16 bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: "url('/assets/brand/cat-soap-white.jpg')" }}
    >
      <div className="absolute inset-0 bg-dark-green/85" />
      <div className="relative z-10 max-w-305 mx-auto px-4 md:px-10">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Text + form */}
          <div className="flex-1 w-full text-center md:text-left">
            <span className="font-lato text-gold text-[11px] uppercase tracking-[4px] block mb-3">
              Newsletter
            </span>
            <h3 className="font-playfair font-normal text-[24px] md:text-[34px] leading-tight text-white mb-3">
              Stay in the Know
            </h3>
            <p className="font-lato text-[14px] leading-relaxed text-white/75 mb-7 max-w-lg md:max-w-none">
              Get early access to new arrivals, wholesale deals, and exclusive offers from Golden Fragrance.
            </p>
            <form
              className="flex flex-row gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="Your email address"
                className="min-w-0 flex-1 h-12 px-4 font-lato text-[14px] bg-white text-dark-green outline-none placeholder:text-dark-green/40 rounded-[3px]"
              />
              <button
                type="submit"
                className="h-12 bg-gold text-dark-green font-lato font-bold text-[12px] uppercase tracking-[2px] px-6 rounded-[3px] hover:bg-[#c49843] transition-colors duration-300 whitespace-nowrap cursor-pointer shrink-0"
              >
                Subscribe
              </button>
            </form>
          </div>

          {/* Decorative icon block */}
          <div className="hidden md:flex flex-col items-center gap-2 opacity-20 shrink-0">
            <div className="w-24 h-24 rounded-full border-2 border-linen flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M20 4C11.16 4 4 11.16 4 20s7.16 16 16 16 16-7.16 16-16S28.84 4 20 4zm0 6a5 5 0 110 10 5 5 0 010-10zm0 22.4a11.6 11.6 0 01-9.6-5.12C10.44 24.64 16.8 22.4 20 22.4s9.56 2.24 9.6 4.88A11.6 11.6 0 0120 32.4z" fill="white"/>
              </svg>
            </div>
            <span className="font-lato text-white text-[11px] uppercase tracking-[3px]">Members</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Subscribe;
