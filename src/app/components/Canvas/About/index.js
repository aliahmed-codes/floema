import { Plane, Transform } from "ogl";
import gsap from "gsap";

import { map } from "lodash";
import Gallery from "./Gallery";


export default class About {
  constructor({ gl, scene, sizes }) {
    this.group = new Transform();
    this.gl = gl;
    this.sizes = sizes;

    this.createGeometry();
    this.createGalleries();

    this.group.setParent(scene);

    this.show()
  }

  createGeometry() {
    this.geometry = new Plane(this.gl);
  }

  createGalleries() {
    this.galleriesElements = document.querySelectorAll(".about__gallery");

    this.galleries = map(this.galleriesElements, (element, index) => {
      return new Gallery({
        element,
        geometry: this.geometry,
        scene: this.group,
        gl: this.gl,
        index,
        sizes: this.sizes,
      });
    });
  }

  /**
   * Animations
   */

  show() {
    map(this.galleries, (gallery) => gallery.show());
  }

  hide() {
    map(this.galleries, (gallery) => gallery.hide());
  }

  /**
   * Events
   */

  onResize(event) {
    map(this.galleries, (gallery) => gallery.onResize(event));
  }

  onTouchDown(event) {
    map(this.galleries, (gallery) => gallery.onTouchDown(event));
  }

  onTouchMove(event) {
    map(this.galleries, (gallery) => gallery.onTouchMove(event));
  }

  onTouchUp(event) {
    map(this.galleries, (gallery) => gallery.onTouchUp(event));
  }

  onWheel({ pixelX, pixelY }) {

  }

  /**
   * Update
   */
  update() {
    map(this.galleries, (gallery) => gallery.update());
  }

  /**
 * Destroy
 */
  destroy() {
    map(this.galleries, gallery => gallery.destroy())
  }
}
