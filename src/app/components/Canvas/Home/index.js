import { Plane, Transform } from "ogl"
import gsap from "gsap"

import { map } from "lodash"

import Media from "./Media"


export default class Home {
    constructor({ gl, scene, sizes }) {

        this.group = new Transform()
        this.gl = gl
        this.sizes = sizes
        this.scene = scene
        this.galleryElements = document.querySelector('.home__gallery')
        this.mediasElements = document.querySelectorAll('.home__gallery__media')


        this.x = {
            current: 0,
            target: 0,
            lerp: 0.1
        }

        this.y = {
            current: 0,
            target: 0,
            lerp: 0.1
        }

        this.scrollCurrent = {
            x: 0,
            y: 0
        }

        this.scroll = {
            x: 0,
            y: 0
        }

        this.speed = {
            current: 0,
            target: 0,
            lerp: 0.1
        }

        this.createGeometry()
        this.createGallery()


        this.group.setParent(scene)

        this.show()
    }

    createGeometry() {
        this.geometry = new Plane(this.gl, {
            heightSegments: 20,
            widthSegments: 20
        })
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
        map(this.medias, (media) => media.show());
    }

    hide() {
        map(this.medias, (media) => media.hide());
    }

    /**
     * Events
     */

    onResize(event) {
        this.galleryBounds = this.galleryElements.getBoundingClientRect()

        this.sizes = event.sizes

        this.gallerySizes = {
            height: this.galleryBounds.height / window.innerHeight * this.sizes.height,
            width: this.galleryBounds.width / window.innerWidth * this.sizes.width,
        }

        this.scroll.x = this.x.target = 0
        this.scroll.y = this.x.target = 0

        map(this.medias, media => media.onResize(event, this.scroll))


    }

    onTouchDown({ x, y }) {
        this.speed.target = 1

        this.scrollCurrent.x = this.scroll.x
        this.scrollCurrent.y = this.scroll.y
    }

    onTouchMove({ x, y }) {
        const xDistance = x.start - x.end
        const yDistance = y.start - y.end

        this.x.target = this.scrollCurrent.x - xDistance
        this.y.target = this.scrollCurrent.y - yDistance
    }

    onTouchUp({ x, y }) {
        this.speed.target = 0
    }

    onWheel({ pixelX, pixelY }) {
        this.x.target += pixelX
        this.y.target += pixelY
    }


    /**
     * Update
     */
    update() {

        if (!this.galleryBounds) return

        this.speed.current = gsap.utils.interpolate(this.speed.current, this.speed.target, this.speed.lerp)

        this.x.current = gsap.utils.interpolate(this.x.current, this.x.target, this.x.lerp)
        this.y.current = gsap.utils.interpolate(this.y.current, this.y.target, this.y.lerp)

        if (this.scroll.x < this.x.current) {
            this.x.direction = 'right'

        } else if (this.scroll.x > this.x.current) {
            this.x.direction = 'left'
        }

        if (this.scroll.y < this.y.current) {
            this.y.direction = 'top'
        } else if (this.scroll.y > this.y.current) {
            this.y.direction = 'bottom'
        }


        this.scroll.x = this.x.current
        this.scroll.y = this.y.current

        map(this.medias, (media, index) => {

            const scaleX = media.mesh.scale.x / 2
            const offsetX = this.sizes.width * 0.6

            if (this.x.direction === "left") {
                const x = media.mesh.position.x + scaleX

                if (x < -offsetX) {
                    media.extra.x += this.gallerySizes.width
                    media.mesh.rotation.z = gsap.utils.random(-Math.PI * .03, Math.PI * .03)

                }
            } else if (this.x.direction === "right") {
                const x = media.mesh.position.x - scaleX

                if (x > offsetX) {
                    media.extra.x -= this.gallerySizes.width
                    media.mesh.rotation.z = gsap.utils.random(-Math.PI * .03, Math.PI * .03)

                }
            }


            const scaleY = media.mesh.scale.y / 2
            const offsetY = this.sizes.height * 0.6

            if (this.y.direction === "top") {
                const y = media.mesh.position.y + scaleY

                if (y < -offsetY) {
                    media.extra.y += this.gallerySizes.height
                    media.mesh.rotation.z = gsap.utils.random(-Math.PI * .03, Math.PI * .03)

                }
            } else if (this.y.direction === "bottom") {
                const y = media.mesh.position.y - scaleY

                if (y > offsetY) {
                    media.extra.y -= this.gallerySizes.height
                    media.mesh.rotation.z = gsap.utils.random(-Math.PI * .03, Math.PI * .03)

                }
            }

            media.update(this.scroll, this.speed.current)
        })
    }


    /**
     * Destroy
     */

    destroy() {
        this.scene.removeChild(this.group)
    }

}

