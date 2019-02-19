// prefer default export if available
const preferDefault = m => m && m.default || m

exports.components = {
  "component---src-pages-about-js": () => import("/Users/derek/portfolio/src/pages/about.js" /* webpackChunkName: "component---src-pages-about-js" */),
  "component---src-pages-blog-js": () => import("/Users/derek/portfolio/src/pages/blog.js" /* webpackChunkName: "component---src-pages-blog-js" */),
  "component---src-pages-index-js": () => import("/Users/derek/portfolio/src/pages/index.js" /* webpackChunkName: "component---src-pages-index-js" */),
  "component---src-pages-skills-js": () => import("/Users/derek/portfolio/src/pages/skills.js" /* webpackChunkName: "component---src-pages-skills-js" */)
}

exports.data = () => import(/* webpackChunkName: "pages-manifest" */ "/Users/derek/portfolio/.cache/data.json")

