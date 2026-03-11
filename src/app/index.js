import each from "lodash/each"

import About from "./pages/About"
import Home from "./pages/Home"
import Collections from "./pages/Collections"
import Detail from "./pages/Detail"

import Preloader from "./components/Preloader"
import Navigation from "./components/Navigation"

class App {
  constructor() {
    this.createContent()

    this.createPreloader()
    this.createNavigation()
    this.createPages()

    this.addEventListeners()
    this.addLinkListeners()

    this.update()

  }

  createPreloader() {
    this.preloader = new Preloader()
    this.preloader.once('completed', this.onPreloader.bind(this))
  }

  createNavigation() {
    this.navigation = new Navigation({
      template: this.template
    })
  }

  createContent() {
    this.content = document.querySelector('.content')
    this.template = this.content.getAttribute('data-template')
  }


  createPages() {
    this.pages = {
      "home": new Home(),
      "about": new About(),
      "collections": new Collections(),
      "detail": new Detail(),
    }

    this.page = this.pages[this.template]
    this.page.create()
  }


  /***
  * Events.
  */
  onPreloader() {
    this.preloader.destroy()

    this.onResize()

    this.page.show()
  }

  onPopState() {
    this.onChange(window.location.pathname)
  }

  async onChange(url) {

    await this.page.hide()

    const request = await fetch(url)

    if (request.status === 200) {
      const html = await request.text()

      const div = document.createElement('div')

      div.innerHTML = html

      const divContent = div.querySelector('.content')
      this.template = divContent.getAttribute('data-template')
      this.content.setAttribute('data-template', this.template)
      this.content.innerHTML = divContent.innerHTML


      this.page = this.pages[this.template]

      this.navigation.onChange(this.template)

      this.page.create()


      this.onResize()

      await this.page.show()


      this.addLinkListeners()
    }
    else {
      console.log("Error");
    }

  }

  addLinkListeners() {

    const links = document.querySelectorAll('a')

    each(links, link => {
      link.onclick = event => {
        event.preventDefault()

        const { href } = link

        this.onChange(href)

      }
    })
  }
  onResize() {
    if (this.page && this.page.onResize) {
      this.page.onResize()
    }
  }

  /***
  * Loop.
  */
  update() {
    if (this.page && this.page.update) {
      this.page.update()
    }

    this.frame = window.requestAnimationFrame(this.update.bind(this))
  }

  /***
  * Listeners.
  */
  addEventListeners() {
    window.addEventListener('popstate', this.onPopState.bind(this))

    window.addEventListener('resize', this.onResize.bind(this))
  }

}
new App()