const { hot } = require("react-hot-loader/root")

// prefer default export if available
const preferDefault = m => m && m.default || m


exports.components = {
  "component---src-pages-404-js": hot(preferDefault(require("/Users/derek/portfolio/src/pages/404.js"))),
  "component---src-pages-about-js": hot(preferDefault(require("/Users/derek/portfolio/src/pages/about.js"))),
  "component---src-pages-app-js": hot(preferDefault(require("/Users/derek/portfolio/src/pages/App.js"))),
  "component---src-pages-blog-js": hot(preferDefault(require("/Users/derek/portfolio/src/pages/blog.js"))),
  "component---src-pages-index-js": hot(preferDefault(require("/Users/derek/portfolio/src/pages/index.js"))),
  "component---src-pages-page-2-js": hot(preferDefault(require("/Users/derek/portfolio/src/pages/page-2.js"))),
  "component---src-pages-skills-js": hot(preferDefault(require("/Users/derek/portfolio/src/pages/skills.js")))
}

