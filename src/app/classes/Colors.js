import GSAP from "gsap";

class Colors {

    change({ color, backgroundColor }) {

        GSAP.to(document.documentElement, {
            background: backgroundColor,
            color,
            duration: 1.5,
        })
    }
}


export const colorManager = new Colors()