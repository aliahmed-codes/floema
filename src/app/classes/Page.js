import each from 'lodash/each'
import map from 'lodash/map'

import GSAP from 'gsap'

import Prefix from 'prefix'
import NormalizeWheel from 'normalize-wheel';

import Title from '../animations/Title';
import Paragraph from '../animations/Paragraph';
import Highlight from '../animations/Highlight';
import Label from '../animations/Label';

import { colorManager } from './Colors';
import AsyncLoad from './AsyncLoad';

export default class Page {
    constructor({ element, elements, id }) {
        this.id = id;
        this.selector = element;
        this.selectorChildren = {
            ...elements,
            animationsHighlights: '[data-animation="highlight"]',
            animationsTitles: '[data-animation="title"]',
            animationsParagraphs: '[data-animation="paragraph"]',
            animationsLabels: '[data-animation="label"]',
            preloaders: '[data-src]',
        };

        this.transformPrefix = Prefix('transform')


        this.onMouseWheelEvent = this.onMouseWheel.bind(this)

    }



    create() {
        this.element = document.querySelector(this.selector)
        this.elements = {}

        this.scroll = {
            current: 0,
            target: 0,
            last: 0,
            limit: 0
        }

        each(this.selectorChildren, (entry, key) => {
            if (entry instanceof window.HTMLElement || entry instanceof window.NodeList || Array.isArray(entry)) {
                this.elements[key] = entry
            } else {
                this.elements[key] = document.querySelectorAll(entry)

                if (this.elements[key].length === 0) {
                    this.elements[key] = null
                } else if (this.elements[key].length === 1) {
                    this.elements[key] = document.querySelector(entry)
                }
            }


        });

        this.createAnimations()
        this.createPreloader()


    }

    createAnimations() {

        this.animations = []

        // Highlights
        this.animationsHighlights = map(this.elements.animationsHighlights, element => {
            return new Highlight({
                element
            })
        })

        this.animations.push(...this.animationsHighlights)

        // Titles
        this.animationsTitles = map(this.elements.animationsTitles, element => {
            return new Title({
                element
            })
        })

        this.animations.push(...this.animationsTitles)

        // Paragraphs
        this.animationsParagraphs = map(this.elements.animationsParagraphs, element => {
            return new Paragraph({
                element
            })
        })

        this.animations.push(...this.animationsParagraphs)

        // Labels
        this.animationsLabels = map(this.elements.animationsLabels, element => {
            return new Label({
                element
            })
        })

        this.animations.push(...this.animationsLabels)

    }

    createPreloader() {

        this.preloaders = map(this.elements.preloaders, element => {
            return new AsyncLoad({ element })
        })

    }


    /** 
    * Animations
    */
    show() {

        colorManager.change({
            color: this.element.getAttribute('data-color'),
            backgroundColor: this.element.getAttribute('data-background')
        })

        this.animationIn = GSAP.timeline()
        return new Promise(resolve => {
            this.animationIn.fromTo(this.element,
                {
                    autoAlpha: 0,
                }, {
                autoAlpha: 1,
            })

            this.animationIn.call(_ => {
                this.addEventListeners()
                resolve()
            })
        })
    }

    hide() {

        this.destroy()

        this.animationOut = GSAP.timeline()

        return new Promise(resolve => {
            this.animationOut.to(this.element, {
                autoAlpha: 0,
                onComplete: resolve
            });
        })
    }

    /** 
    * Events
    */
    onMouseWheel(event) {

        const { pixelY } = NormalizeWheel(event)

        this.scroll.target += pixelY
    }

    onResize() {
        if (this.elements.wrapper) {
            this.scroll.limit = this.elements.wrapper.clientHeight - window.innerHeight
        }

        each(this.animations, animation => animation.onResize())
    }


    /**
     * Loops
     */
    update() {

        this.scroll.current = GSAP.utils.interpolate(this.scroll.current, this.scroll.target, 0.1)

        this.scroll.current = GSAP.utils.clamp(0, this.scroll.limit, this.scroll.current)

        if (this.scroll.target < 0.01) {
            this.scroll.target = 0
        }

        if (this.scroll.target > this.scroll.limit) {
            this.scroll.target = this.scroll.limit
        }


        if (this.elements.wrapper) {
            this.elements.wrapper.style[this.transformPrefix] = `translateY(-${this.scroll.current}px)`
        }
    }

    /**
    * Listeners
    */
    addEventListeners() {
        window.addEventListener('mousewheel', this.onMouseWheelEvent)
    }

    removeEventListeners() {
        window.addEventListener('mousewheel', this.onMouseWheelEvent)
    }


    /**
     * Destroy
     */
    destroy() {

        this.removeEventListeners()

    }

}