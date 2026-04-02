import { Plane, Transform } from "ogl"
import gsap from "gsap"
import Prefix from "prefix"
import { map } from "lodash"

import Media from "./Media"


export default class Collections {
    constructor({ gl, scene, sizes, transition }) {
        this.id = "collections"

        this.gl = gl
        this.sizes = sizes
        this.scene = scene
        this.transition = transition

        this.transformPrefix = Prefix('transform')

        this.group = new Transform()

        this.titlesElements = document.querySelector('.collections__titles')

        this.galleryElements = document.querySelector('.collections__gallery')
        this.galleryWrapperElements = document.querySelector('.collections__gallery__wrapper')

        this.collectionsElements = document.querySelectorAll('.collections__article')
        this.collectionsElementsActive = 'collections__article--active'

        this.mediasElements = document.querySelectorAll('.collections__gallery__media')


        this.scroll = {
            current: 0,
            target: 0.1,
            last: 0,
            lerp: 0.1,
            velocity: 1
        }


        this.createGeometry()
        this.createGallery()

        this.onResize({
            sizes: this.sizes
        })


        this.group.setParent(scene)

        this.show()
    }

    createGeometry() {
        this.geometry = new Plane(this.gl)
    }

    createGallery() {
        this.medias = map(this.mediasElements, (element, index) => {
            return new Media({
                element,
                geometry: this.geometry,
                scene: this.group,
                gl: this.gl,
                index,
                sizes: this.sizes
            })
        })
    }


    /**
  * Animations
  */

    show() {
        if (this.transition) {
            this.transition.animate(this.medias[0].mesh, _ => {

            })
        }

        map(this.medias, (media) => media.show());
    }

    hide() {
        map(this.medias, (media) => media.hide());
    }

    /**
     * Events
     */

    onResize(event) {
        this.sizes = event.sizes

        this.bounds = this.galleryWrapperElements.getBoundingClientRect()

        this.scroll.last = this.scroll.target = 0

        map(this.medias, media => media.onResize(event, this.scroll))

        this.scroll.limit = this.bounds.width - this.medias[0].element.clientWidth

    }

    onTouchDown({ x, y }) {
        this.scroll.last = this.scroll.current
    }

    onTouchMove({ x, y }) {
        const distance = x.start - x.end

        this.scroll.target = this.scroll.last - distance
    }

    onTouchUp({ x, y }) {

    }

    onWheel({ pixelY }) {
        this.scroll.target += pixelY
    }


    /**
     * Changed
     */

    onChange(index) {
        this.index = index

        const selectedCollection = parseInt(this.mediasElements[this.index].getAttribute('data-index'))

        map(this.collectionsElements, (element, elementIndex) => {
            if (elementIndex === selectedCollection) {
                element.classList.add(this.collectionsElementsActive)
            } else {
                element.classList.remove(this.collectionsElementsActive)
            }
        })

        this.titlesElements.style[this.transformPrefix] = `translateY(-${25 * selectedCollection}%) translate(-50%, -50%) rotate(-90deg)`
    }

    /**
     * Update
     */
    update() {
        this.scroll.target = gsap.utils.clamp(-this.scroll.limit, 0, this.scroll.target)

        this.scroll.current = gsap.utils.interpolate(this.scroll.current, this.scroll.target, this.scroll.lerp)

        this.galleryElements.style[this.transformPrefix] = `translateX(${this.scroll.current}px)`

        if (this.scroll.last < this.scroll.current) {
            this.scroll.direction = 'right'

        } else if (this.scroll.last > this.scroll.current) {
            this.scroll.direction = 'left'
        }


        this.scroll.last = this.scroll.current

        const index = Math.floor(Math.abs(this.scroll.current / this.scroll.limit) * this.medias.length)

        if (this.index !== index) {
            this.onChange(index)
        }

        map(this.medias, (media, index) => {
            media.update(this.scroll.current, this.index)

            media.mesh.position.y += Math.cos((media.mesh.position.x / this.sizes.width) * Math.PI * 0.1) * 50 - 50
        })

    }


    /**
     * Destroy
     */

    destroy() {
        this.scene.removeChild(this.group)
    }

}

