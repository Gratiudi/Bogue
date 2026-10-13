const articles = [
  { image: "b", alt: "Summer fashion", title: "🌞 Top 5 Summer Fashion Trends", description: "Explore breathable fabrics, vibrant colors, and effortless styles for this summer. Stay cool while looking chic!", link: "https://www.vogue.com/fashion", linkText: "Read on Vogue" },
  { image: "a", alt: "Ethical fashion", title: "🌿 Sustainable & Ethical Fashion", description: "Learn about eco-friendly brands and how you can make a difference through your wardrobe choices.", link: "https://www.thegoodtrade.com/features/fair-trade-clothing", linkText: "Visit The Good Trade" },
  { image: "c", alt: "Hijab fashion", title: "🧕 Hijab Fashion for Modern Women", description: "Modest yet trendy — discover stylish hijab outfits that balance tradition with contemporary style.", link: "https://www.hautehijab.com/blogs/hijab-fashion", linkText: "Go to Haute Hijab" },
  { image: "h", alt: "Wardrobe essentials", title: "👜 Must-Have Wardrobe Essentials", description: "From statement handbags to versatile dresses, find out what every woman should have in her closet.", link: "https://www.whowhatwear.com/fashion-essentials", linkText: "Explore Who What Wear" },
  { image: "g", alt: "Street style", title: "🚶‍♀️ Urban Street Style Revolution", description: "Get inspired by edgy, casual, and statement streetwear looks from fashion capitals around the world.", link: "https://www.highsnobiety.com/c/fashion/", linkText: "Check out Highsnobiety" },
  { image: "d", alt: "DIY fashion", title: "✂️ DIY Fashion Projects at Home", description: "Turn old clothes into fashion-forward pieces with fun, easy-to-follow DIY tutorials.", link: "https://www.refinery29.com/en-us/diy-fashion-tutorials", linkText: "See DIY Ideas" },
  { image: "i", alt: "Runway highlights", title: "👗 Runway Highlights You Can't Miss", description: "Catch the most iconic moments from the latest fashion weeks, from Paris to Milan.", link: "https://www.harpersbazaar.com/fashion/fashion-week/", linkText: "Browse Harper’s Bazaar" },
  { image: "l", alt: "Men's fashion", title: "🧥 Men's Fashion Guide 2025", description: "Smart casual to sharp formal — the ultimate style guide for the modern man.", link: "https://www.gq.com/style", linkText: "Explore GQ Style" },
  { image: "f", alt: "Fashion accessories", title: "💍 Accessorize Like a Pro", description: "From bold jewelry to subtle touches, learn how accessories can completely transform your outfit.", link: "https://www.elle.com/fashion/accessories/", linkText: "Discover on ELLE" },
  { image: "m", alt: "Vintage fashion", title: "🧵 Vintage Styles Making a Comeback", description: "Retro is in! Explore timeless vintage trends and how to incorporate them into modern looks.", link: "https://www.vintag.es/", linkText: "See Vintage Inspiration" },
  { image: "j", alt: "Color trends", title: "🎨 2025 Color Trends to Watch", description: "Stay ahead of the curve with the colors that will dominate fashion this year. Hint: think bold and earthy.", link: "https://www.pantone.com/articles/fashion-color-trend-report", linkText: "Visit Pantone Report" },
  { image: "e", alt: "Fashion and culture", title: "🌍 Fashion Meets Culture", description: "Explore how global cultures are influencing fashion design and how designers are celebrating diversity.", link: "https://www.businessoffashion.com/", linkText: "Read on BoF" }
];

export function BlogPage() {
  return <section className="blog-page page-section">
    <h1>👗 Fashion &amp; Style Blog</h1>
    <p className="blog-intro">Stay updated with the latest trends in women's fashion, styling tips, and more. Explore expert advice and hand-picked looks designed to inspire your wardrobe.</p>
    <div className="blog-grid">
      {articles.map((article) => <article className="blog-card" key={article.image}>
        <img src={`/blog-images/${article.image}.jpg`} alt={article.alt} loading="lazy" />
        <h2>{article.title}</h2>
        <p>{article.description}</p>
        <a href={article.link} target="_blank" rel="noreferrer">{article.linkText} →</a>
      </article>)}
    </div>
  </section>;
}
