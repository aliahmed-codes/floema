const express = require('express')
require('dotenv').config()
const prismic = require("@prismicio/client");
const PrismicDOM = require("prismic-dom");
const bodyParser = require('body-parser')
const logger = require('morgan')
const errorHandler = require('errorhandler')
const methodOverride = require('method-override')
const uaParser = require('ua-parser-js')


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

    const ua = uaParser(req.headers['user-agent'])

    res.locals.isDesktop = ua.device.type === undefined
    res.locals.isPhone = ua.device.type === 'mobile'
    res.locals.isTablet = ua.device.type === 'tablet'

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

    const { results: homeData } = await api.getByType('home')
    const { results: aboutData } = await api.getByType('about')

    const collections = await api.getAllByType('collection', { fetchLinks: 'product.image' })



    const [meta] = metaData
    const [home] = homeData
    const [about] = aboutData
    const [preloader] = preloaderData
    const [navigation] = navigationData

    const assets = []

    home.data.gallery.forEach(item => {
        assets.push(item.image.url)
    })

    about.data.gallery.forEach(item => {
        assets.push(item.image.url)
    })

    about.data.body.forEach(section => {
        if (section.slice_type === "gallery") {
            section.items.forEach(item => {
                assets.push(item.image.url)
            })
        }
    })


    collections.forEach(collection => {
        collection.data.products.forEach(item => {
            assets.push(item.products_product.data.image.url)
        })
    })

    return {
        assets, about, collections, home, meta, navigation, preloader
    }

}


app.get('/', async (req, res) => {
    const api = initAPi()
    const defaults = await handleRequest(api)

    res.render('pages/home', { ...defaults, })
})

app.get('/about', async (req, res) => {
    const api = initAPi()
    const defaults = await handleRequest(api)

    res.render('pages/about', { ...defaults, })
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
    const defaults = await handleRequest(api)

    res.render('pages/collections', { ...defaults, })
})


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})