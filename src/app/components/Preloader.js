import each from "lodash/each";

import Component from "../classes/Component";

import GSAP from "gsap";

import { split } from "../utils/text";

export default class Preloader extends Component {
    constructor() {
        super({
            element: '.preloader',
            elements: {
                title: ".preloader__text",
                number: ".preloader__number",
                numberText: ".preloader__number__text",
                images: 'img'
            }
        })

        split({
            element: this.elements.title,
            expression: '<br>'
        })

        split({
            element: this.elements.title,
            expression: '<br>'
        })

        this.elements.titleSpans = this.elements.title.querySelectorAll('span span')

        this.length = 0

        this.createLoader()
    }


    createLoader() {

        console.log("🚀 ", this.elements.images)
        each(this.elements.images, element => {

            element.src = element.getAttribute('data-src')
            element.onload = _ => this.onAssetLoaded(element)

        })

    }


    onAssetLoaded(image) {
        this.length += 1

        const percent = this.length / this.elements.images.length
        console.log("🚀percent:", percent)

        this.elements.numberText.innerHTML = `${Math.round(percent * 100)}%`

        if (percent === 1) {
            this.onLoaded()
        }
    }

    onLoaded() {
        return new Promise(resolve => {
            this.animateOut = GSAP.timeline({
                delay: 2
            })
            this.animateOut.to(this.elements.titleSpans, {
                autoAlpha: 0,
                stagger: 0.1,
                duration: 1.5,
                ease: "expo.out",
                y: '100%',
            })
            this.animateOut.to(this.elements.numberText, {
                autoAlpha: 0,
                stagger: 0.1,
                duration: 1.5,
                ease: "expo.out",
                y: '100%',
            }, '-=1.4')
            this.animateOut.to(this.element, {
                scaleY: 0,
                transformOrigin: '100% 100%',
                duration: 1.5,
                ease: "expo.out",
            }, '-=1')
            this.animateOut.call(_ => {
                this.emit('completed')
            })
        })
    }

    destroy() {
        this.element.parentNode.removeChild(this.element)
    }

}