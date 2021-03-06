module.exports = {
    siteMetadata: {
    title: "Derek Nelson's portfolio",
    description: 'About me & stuff.',
    author: '@dereknelson',
  },
  plugins: [
    'gatsby-plugin-react-helmet', 
    { resolve: `gatsby-source-filesystem`, options: { name: `images`, path: `${__dirname}/src/images`, }, },
    'gatsby-transformer-sharp',
    'gatsby-plugin-sharp',
    { resolve: `gatsby-plugin-manifest`, options: {
        name: 'gatsby-starter-default',
        short_name: 'starter',
        start_url: '',
        background_color: '#3fbdff',
        theme_color: '#3fbdff',
        display: 'minimal-ui',
        // icon: 'src/images/gatsby-icon.png', // This path is relative to the root of the site.
    },
    },
    // `gatsby-plugin-sass`,
    {
        resolve: `gatsby-plugin-sass`,
        options: {
            implementation: require("sass"),
        },
    },
    {
        resolve: `gatsby-plugin-google-analytics`,
        options: {
            trackingId: "UA-134636841-1",
        }
    }
  ],
}
