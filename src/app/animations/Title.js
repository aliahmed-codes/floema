import gsap from "gsap";
import Animation from "../classes/Animation";

export default class Title extends Animation {
    constructor({ element, elements }) {
        super({
            element,
            elements: elements
        })
    }

    animateIn() {
        gsap.fromTo(this.element, {
            opacity: 0
        }, {
            opacity: 1,
            duration: 1,
            delay: 0.5
        })
    }

    animateOut() {
        gsap.set(this.element, {
            opacity: 0
        })
    }
} 