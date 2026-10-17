import { Link } from "react-router-dom";
import { ProductListPage } from "./ProductListPage.jsx";

const categories = [
  { title: "Trousers & Pants", route: "pants", image: "/images/t.jpg", alt: "Tailored trousers" },
  { title: "Dresses", route: "dresses", image: "/images/d.jpg", alt: "Red occasion dress" },
  { title: "Shoes", route: "shoes", image: "/images/s.jpg", alt: "Shoes from the collection" },
  { title: "Tops & Blouses", route: "tops", image: "/images/bss.jpg", alt: "White blouse" },
  { title: "Sportswear", route: "sportswear", image: "/images/sw.jpg", alt: "Sportswear from the collection" }
];

const storeNotes = [
  { number: "01", title: "A considered edit", text: "Pieces chosen for their style, versatility, and place in your wardrobe." },
  { number: "02", title: "Find your direction", text: "Explore the collection by category and discover a look that feels like you." },
  { number: "03", title: "A personal touch", text: "Bogue is an independent fashion store created by Tinbite." }
];

export function HomePage() {
  return <>
    <section className="bg-[#f2eee8]">
      <div className="mx-auto grid max-w-[1600px] lg:min-h-[680px] lg:grid-cols-[0.92fr_1.08fr]">
        <div className="flex flex-col justify-center px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24 xl:px-24">
          <p className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-stone-600">
            <span className="h-px w-8 bg-rose-900" /> The Bogue edit
          </p>
          <h1 className="max-w-xl font-serif text-5xl leading-[1.04] tracking-tight text-stone-950 sm:text-6xl xl:text-7xl">
            Make room<br />for <span className="italic text-rose-900">you.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-stone-600 sm:text-lg">
            A thoughtful collection of clothing and shoes for the moments that make up your everyday.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link className="inline-flex min-h-13 items-center justify-center rounded-full bg-stone-950 px-7 text-sm font-semibold text-white no-underline transition hover:bg-rose-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-900" to="/products">
              Explore the collection <span className="ml-3 text-lg" aria-hidden="true">→</span>
            </Link>
            <Link className="px-2 py-3 text-sm font-semibold text-stone-700 underline decoration-stone-400 underline-offset-4 transition hover:text-rose-900" to="/about">Our story</Link>
          </div>
          <div className="mt-12 flex items-center gap-3 border-t border-stone-300/80 pt-5 text-sm text-stone-500">
            <span className="grid size-8 place-items-center rounded-full border border-stone-400 font-serif text-stone-800">B</span>
            <span>Personal style, thoughtfully chosen.</span>
          </div>
        </div>
        <div className="relative min-h-[420px] overflow-hidden bg-stone-300 sm:min-h-[560px] lg:min-h-full">
          <img className="absolute inset-0 h-full w-full object-cover object-center" src="/uploads/heroBG.jpg" alt="Models wearing elegant black occasionwear" fetchPriority="high" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/45 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 text-white sm:bottom-10 sm:left-10">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">Style for every chapter</p>
            <p className="mt-1 font-serif text-2xl italic sm:text-3xl">The occasion edit</p>
          </div>
          <span className="absolute right-6 top-6 rounded-full border border-white/60 bg-white/15 px-4 py-2 text-xs font-medium tracking-wide text-white backdrop-blur-sm sm:right-10 sm:top-10">New perspectives</span>
        </div>
      </div>
    </section>

    <ProductListPage title="Featured Products" limit={4} order="desc" />

    <section className="bg-[#f7f5f1] py-16 sm:py-20 lg:py-24" aria-labelledby="home-categories-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 sm:mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-900">Find your edit</p>
            <h2 id="home-categories-title" className="mt-2 font-serif text-4xl tracking-tight text-stone-950 sm:text-5xl">Shop by category</h2>
          </div>
          <Link className="text-sm font-semibold text-stone-700 underline decoration-stone-400 underline-offset-4 transition hover:text-rose-900" to="/products">View everything <span aria-hidden="true">→</span></Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-5">
          {categories.map((category, index) => <Link className={`group relative isolate aspect-[4/5] overflow-hidden rounded-2xl bg-stone-300 ${index === 0 ? "col-span-2 lg:col-span-1" : ""}`} to={`/category/${category.route}`} key={category.route}>
            <img className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" src={category.image} alt={category.alt} loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/75 via-stone-950/10 to-transparent transition group-hover:from-stone-950/85" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4 text-white sm:p-5">
              <h3 className="font-serif text-xl leading-tight sm:text-2xl">{category.title}</h3>
              <span className="grid size-9 shrink-0 place-items-center rounded-full border border-white/60 text-lg transition group-hover:bg-white group-hover:text-stone-950" aria-hidden="true">↗</span>
            </div>
          </Link>)}
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24" aria-labelledby="store-notes-title">
      <div className="mb-10 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rose-900">The Bogue point of view</p>
        <h2 id="store-notes-title" className="mt-2 font-serif text-4xl tracking-tight text-stone-950 sm:text-5xl">Style should feel like your own.</h2>
      </div>
      <div className="grid gap-8 border-t border-stone-200 pt-7 sm:grid-cols-3 sm:gap-6">
        {storeNotes.map((note) => <article key={note.number}>
          <p className="font-serif text-sm italic text-rose-900">{note.number}</p>
          <h3 className="mt-3 text-lg font-semibold text-stone-900">{note.title}</h3>
          <p className="mt-2 max-w-sm text-sm leading-6 text-stone-600">{note.text}</p>
        </article>)}
      </div>
    </section>
  </>;
}
