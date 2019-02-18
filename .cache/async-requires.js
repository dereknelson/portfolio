// prefer default export if available
const preferDefault = m => m && m.default || m

exports.components = {
  "component---cache-dev-404-page-js": () => import("/Users/derek/portfolio/.cache/dev-404-page.js" /* webpackChunkName: "component---cache-dev-404-page-js" */),
  "component---src-pages-about-js": () => import("/Users/derek/portfolio/src/pages/about.js" /* webpackChunkName: "component---src-pages-about-js" */),
  "component---src-pages-app-js": () => import("/Users/derek/portfolio/src/pages/App.js" /* webpackChunkName: "component---src-pages-app-js" */),
  "component---src-pages-blog-js": () => import("/Users/derek/portfolio/src/pages/blog.js" /* webpackChunkName: "component---src-pages-blog-js" */),
  "component---src-pages-skills-js": () => import("/Users/derek/portfolio/src/pages/skills.js" /* webpackChunkName: "component---src-pages-skills-js" */)
}

exports.data = () => import(/* webpackChunkName: "pages-manifest" */ "/Users/derek/portfolio/.cache/data.json")

