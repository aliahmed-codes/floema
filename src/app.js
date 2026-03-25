const express = require('express')
require('dotenv').config()
const prismic = require("@prismicio/client");
const PrismicDOM = require("prismic-dom");
const bodyParser = require('body-parser')
const logger = require('morgan')
const errorHandler = require('errorhandler')
const methodOverride = require('method-override')


const app = express()
const path = require('path')
const port = 3000


app.use(logger('dev')) // Use the logger middleware to log requests in development mode
app.use(errorHandler()) // Use the error handler middleware to handle errors
app.use(bodyParser.json()) // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })) // Parse URL-encoded request bodies
app.use(methodOverride()) // Allow overriding HTTP methods using query parameters
app.use(express.static(path.join(__dirname, '../dist'))); // Serve static files from the 'dist' directory


const initAPi = () => {
    return prismic.createClient(process.env.PRISMIC_ENDPOINT, {
        accessToken: process.env.PRISMIC_ACCESS_TOKEN,

    });
}


const handleLinkResolver = (doc) => {

    if (doc.type === "product") {
        return `/detail/${doc.slug}`;
    }
    if (doc.type === "about") {
        return `/about`;
    }
    if (doc.type === "collections") {
        return `/collections`;
    }
    return '/';
}



app.use((req, res, next) => {
    // res.locals.ctx = {
    //     endpoint: process.env.PRISMIC_ENDPOINT,
    //     linkResolver: handleLinkResolver
    // }

    res.locals.Link = handleLinkResolver

    res.locals.Numbers = index => {
        return index == 0 ? "One" : index == 1 ? "Two" : index == 2 ? "Three" : index == 3 ? "Four" : "Unknown";
    }

    res.locals.PrismicDOM = PrismicDOM
    next()
})


const dirViews = path.join(__dirname, 'views')
app.set('view engine', 'pug')
app.set('views', dirViews)


const handleRequest = async (api) => {
    const { results: preloaderData } = await api.getByType('preloader')
    const { results: navigationData } = await api.getByType('navigation')
    const { results: metaData } = await api.getByType('metadata')


    const [meta] = metaData
    const [preloader] = preloaderData
    const [navigation] = navigationData
    return {
        meta, preloader, navigation
    }

}


app.get('/', async (req, res) => {
    const api = initAPi()
    const { results: homeData } = await api.getByType('home')
    const collections = await api.getAllByType('collection', { fetchLinks: 'product.image' })
    const [home] = homeData

    const defaults = await handleRequest(api)
    res.render('pages/home', { ...defaults, home, collections })
})
app.get('/about', async (req, res) => {
    const api = initAPi()
    const { results: aboutData } = await api.getByType('about')

    const [about] = aboutData
    const defaults = await handleRequest(api)


    res.render('pages/about', { ...defaults, about })
})

app.get('/detail/:uid', async (req, res) => {

    const uid = req.params.uid

    const api = initAPi()

    const product = await api.getByUID('product', uid, { fetchLinks: 'collection.title' })

    const defaults = await handleRequest(api)


    res.render('pages/detail', { ...defaults, product })
})
app.get('/collections', async (req, res) => {
    const api = initAPi()
    const { results: homeData } = await api.getByType('home')
    const collections = await api.getAllByType('collection', { fetchLinks: 'product.image' })

    const [home] = homeData

    const defaults = await handleRequest(api)

    res.render('pages/collections', { ...defaults, home, collections })
})


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})