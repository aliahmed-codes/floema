import GSAP from "gsap";
import Animation from "../classes/Animation"
import { calculate, split } from "../utils/text"
import each from "lodash/each";

export default class Paragraph extends Animation {
    constructor({ element, elements }) {

        super({
            element,
            elements: { ...elements }
        })

        this.elementLinesSpans = split({ element: this.element, append: true })

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
                autoAlpha: 0
            }, {
                autoAlpha: 1,
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