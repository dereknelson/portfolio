// prefer default export if available
const preferDefault = m => m && m.default || m

exports.components = {
  "component---src-pages-404-js": () => import("/Users/derek/portfolio/src/pages/404.js" /* webpackChunkName: "component---src-pages-404-js" */),
  "component---src-pages-about-js": () => import("/Users/derek/portfolio/src/pages/about.js" /* webpackChunkName: "component---src-pages-about-js" */),
  "component---src-pages-app-js": () => import("/Users/derek/portfolio/src/pages/App.js" /* webpackChunkName: "component---src-pages-app-js" */),
  "component---src-pages-blog-js": () => import("/Users/derek/portfolio/src/pages/blog.js" /* webpackChunkName: "component---src-pages-blog-js" */),
  "component---src-pages-index-js": () => import("/Users/derek/portfolio/src/pages/index.js" /* webpackChunkName: "component---src-pages-index-js" */),
  "component---src-pages-page-2-js": () => import("/Users/derek/portfolio/src/pages/page-2.js" /* webpackChunkName: "component---src-pages-page-2-js" */),
  "component---src-pages-skills-js": () => import("/Users/derek/portfolio/src/pages/skills.js" /* webpackChunkName: "component---src-pages-skills-js" */)
}

exports.data = () => import("/Users/derek/portfolio/.cache/data.json")

