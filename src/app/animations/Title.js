import GSAP from "gsap";
import Animation from "../classes/Animation";
import { calculate, split } from "../utils/text";
import each from "lodash/each";

export default class Title extends Animation {
    constructor({ element, elements }) {

        super({
            element,
            elements: { ...elements }
        })

        split({ element: this.element, append: true })
        split({ element: this.element, append: true })

        this.elementLinesSpans = document.querySelectorAll('span span')

    }

    animateIn() {

        if (this.isAnimatedIn) {
            return
        }

        this.isAnimatedIn = true

        this.timelineIn = GSAP.timeline({ delay: 0.5 })

        this.timelineIn.set(this.element, { autoAlpha: 1 })

        each(this.elementLines, (line, index) => {
            this.timelineIn.fromTo(line, {
                y: '100%',
            }, {
                delay: index * 0.2,
                duration: 1.5,
                y: '0%',
                ease: 'expo.out'
            }, 0)
        })

    }

    animateOut() {
        this.isAnimatedIn = false

        GSAP.set(this.element, { alpha: 0 })
    }

    onResize() {
        this.elementLines = calculate(this.elementLinesSpans)
    }
}