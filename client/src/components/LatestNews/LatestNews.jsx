import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import SectionTitle from '../shared/SectionTitle/SectionTitle';
import blogData from '../../data/blog/blog.json';

const LatestNews = () => {
  const blogs = blogData.slice(0, 2);

  return (
    <section className="pt-8 md:pt-16 pb-6 md:pb-10">
      <div className="max-w-305 mx-auto px-4 md:px-10">
        <SectionTitle
          subTitle="Our Blog"
          title="The Latest News At BeShop"
          body="Nourish your skin with toxin-free cosmetic products. With the offers that you can't refuse."
        />
        <div className="flex flex-col md:flex-row md:-mx-3.75">
          {blogs.map((blog) => (
            <div key={blog.id} className="w-full md:w-[calc(50%-30px)] md:mx-3.75 mb-10 md:mb-15">
              {/* Image with date badge */}
              <Link
                to={`/blog/${blog.id}`}
                className="block relative h-56 md:h-75 hover:opacity-80 transition-opacity duration-300"
              >
                <img src={blog.image} alt="" className="w-full h-full object-cover" />
                <span className="absolute top-5.75 right-8.75 z-1 font-lato font-bold text-[24px] leading-none text-center text-dark-green">
                  <img
                    src="/assets/img/blog-item__date-decor.png"
                    alt=""
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-19.25 h-16.5 object-contain z-[-1] pointer-events-none"
                  />
                  <span className="text-[14px] leading-none block capitalize">{blog.date.month}</span>
                  {blog.date.date}
                </span>
              </Link>

              {/* Title */}
              <Link
                to={`/blog/${blog.id}`}
                className="block mt-6 md:mt-10 font-playfair text-[24px] leading-6.5 text-dark-green mb-3.75 hover:text-gold transition-colors duration-300"
              >
                {blog.title}
              </Link>

              {/* Description */}
              <p className="font-lato text-base leading-[170%] text-dark-green/60 mb-6.25 line-clamp-2 w-[90%]">
                {blog.shortDescription}
              </p>

              {/* Read more */}
              <Link
                to={`/blog/${blog.id}`}
                className="group flex items-center font-lato text-[14px] leading-[170%] uppercase text-dark-green hover:opacity-80 transition-opacity duration-300"
              >
                Read more
                <ChevronRight
                  size={12}
                  className="ml-2.5 mt-px group-hover:ml-3.75 transition-all duration-300"
                />
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center mt-2.5">
        <Link
          to="/blog"
          className="inline-block h-15 leading-15 bg-gold text-dark-green font-lato font-bold text-sm uppercase tracking-[2px] px-12.5 rounded-[3px] hover:bg-[#c49843] transition-colors duration-300"
        >
          Read blog
        </Link>
      </div>
    </section>
  );
};

export default LatestNews;
