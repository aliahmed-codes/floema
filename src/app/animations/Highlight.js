import GSAP from "gsap";
import Animation from "../classes/Animation"

export default class Paragraph extends Animation {
    constructor({ element, elements }) {

        super({
            element,
            elements: { ...elements }
        })

    }


    animateIn() {
        if (this.isAnimatedIn) {
            return
        }

        this.isAnimatedIn = true

        this.timelineIn = GSAP.timeline({ delay: 0.5 })


        this.timelineIn.fromTo(this.element, {
            scale: 1.2,
            autoAlpha: 0
        }, {
            autoAlpha: 1,
            duration: 1.5,
            scale: 1,
            ease: 'expo.out'
        }, 0)
    }

    animateOut() {
        this.isAnimatedIn = false

        GSAP.set(this.element, { alpha: 0 })
    }



} 