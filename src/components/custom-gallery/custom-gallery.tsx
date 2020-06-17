import {
  Component,
  ComponentInterface,
  Host,
  h,
  Prop,
  Element,
} from "@stencil/core";

import Hammer from "hammerjs";

@Component({
  tag: "custom-gallery",
  styleUrl: "custom-gallery.css",
  shadow: true,
  assetsDirs: ["/assets"],
})
export class CustomGallery implements ComponentInterface {
  @Element() el: HTMLElement;
  @Prop() arrowsShow: boolean;
  @Prop() arrowsPosition: string;
  @Prop() autoscroll: boolean;
  @Prop() autoscrollDelaySeconds: number;
  @Prop() keydownscroll: boolean;
  @Prop() clickableImg: boolean;
  @Prop() infiniteScroll: boolean;
  @Prop() caption: boolean;
  @Prop() grid: boolean;
  @Prop() gridAutoheight: boolean;
  @Prop() imgFit: string;

  galleria = [];

  componentWillLoad() {
    this.el.querySelectorAll("img").forEach((immagine) => {
      this.galleria.push({
        src: immagine.src,
        caption: immagine.alt,
      });
    });
    this.el.innerHTML = ``;

    if (this.grid === true) {
      this.arrowsShow = false;
      this.infiniteScroll = false;
      this.autoscroll = false;
    }
  }

  componentDidRender() {
    // Get constants and position
    let numimg = this.galleria.length;
    const gallery = this.el as HTMLCanvasElement;
    const carousel = this.el.shadowRoot.querySelector(
      ".carousel"
    ) as HTMLElement;
    const carouselContainer = this.el.shadowRoot.querySelector(
      ".carousel__container"
    ) as HTMLElement;
    let position = 0;
    const left = this.el.shadowRoot.querySelector(".arrowleft") as HTMLElement;
    const right = this.el.shadowRoot.querySelector(
      ".arrowright"
    ) as HTMLElement;

    if (this.arrowsShow === true) {
      this.arrowsPosition === "inner"
        ? (gallery.style.width = "100%")
        : (gallery.style.width = "95%");
    } else {
      gallery.style.width = "100%";
    }

    //  arrows
    if (this.arrowsShow === false) {
      left.style.display = "none";
      right.style.display = "none";
    }
    if (this.arrowsPosition === "inner") {
      left.style.backgroundColor = "#fff";
      right.style.background = "#fff";
      left.style.left = "0";
      right.style.right = "0";
    }

    // append images to carousel
    this.galleria.forEach((img) => {
      const divcontainer = document.createElement("div");
      const immagine = document.createElement("img");
      immagine.src = img.src;
      divcontainer.appendChild(immagine);
      carousel.appendChild(divcontainer);
      if (this.caption === true) {
        const imgcaption = document.createElement("p");
        imgcaption.innerText = img.caption;
        divcontainer.appendChild(imgcaption);
      }
    });

    // Click for fullscreen img
    const checkButtons = (
      index: number,
      next: HTMLImageElement,
      carouselClone: string | any[],
      prev: HTMLImageElement
    ) => {
      index >= carouselClone.length - 1
        ? (next.style.display = "none")
        : (next.style.display = "block");

      index <= 0
        ? (prev.style.display = "none")
        : (prev.style.display = "block");
    };
    if (this.clickableImg === true) {
      let carouselClone = [];
      carousel.querySelectorAll("img").forEach((immagine, index) => {
        carouselClone.push(immagine);
        immagine.addEventListener("click", () => {
          document.body.style.overflow = "hidden";
          if (this.autoscroll === true) {
            clearInterval(intervallo);
          }

          const immagineclone = immagine.cloneNode() as HTMLImageElement;
          const opacity = document.createElement("div");
          const closefullscreen = document.createElement("img");
          closefullscreen.src = `https://image.flaticon.com/icons/svg/748/748122.svg`;
          closefullscreen.className = "close__fullscreen";
          opacity.className = "fullscreen__opacity";
          opacity.style.backgroundColor = "fullscreen__opacity";
          immagineclone.className = "img__fullscreen";
          if (immagineclone.width > immagineclone.height) {
            immagineclone.className = "img__horizontal";
          } else {
            immagineclone.className = "img__vertical";
          }
          opacity.appendChild(immagineclone);
          opacity.appendChild(closefullscreen);
          const next = document.createElement("img");
          const prev = document.createElement("img");
          prev.src = `https://image.flaticon.com/icons/svg/126/126492.svg`;
          prev.alt = "Left Arrow";
          prev.className = "prev_clicked";
          next.src = `https://image.flaticon.com/icons/svg/126/126490.svg`;
          next.alt = "Right Arrow";
          next.className = "next_clicked";
          opacity.appendChild(prev);
          opacity.appendChild(next);
          next.addEventListener("click", () => {
            immagineclone.src = carouselClone[index + 1].src;
            index++;
            checkButtons(index, next, carouselClone, prev);
          });
          prev.addEventListener("click", () => {
            immagineclone.src = carouselClone[index - 1].src;
            index--;
            checkButtons(index, next, carouselClone, prev);
          });
          checkButtons(index, next, carouselClone, prev);
          if (this.keydownscroll === true) {
            document.addEventListener("keydown", (evt) => {
              if (evt.keyCode === 39) {
                next.click();
              }
              if (evt.keyCode === 37) {
                prev.click();
              }
            });
          }
          const touchTarget = new Hammer(opacity);
          touchTarget.on("swipeleft", () => {
            next.click();
          });
          touchTarget.on("swiperight", () => {
            prev.click();
          });
          carouselContainer.appendChild(opacity);
          closefullscreen.addEventListener("click", () => {
            document.body.style.overflow = "visible";
            opacity.parentNode.removeChild(opacity);
          });
        });
      });
    }

    // hide arrows function and start it
    const hide = () => {
      if (this.infiniteScroll !== true) {
        if (position === 0) {
          left.style.visibility = "hidden";
        }
        if (position < 0) {
          left.style.visibility = "visible";
        }
        if (position === -(numimg - 1) * 100) {
          right.style.visibility = "hidden";
        }
        if (position > -(numimg - 1) * 100) {
          right.style.visibility = "visible";
        }
      }
    };
    if (this.arrowsShow === true) {
      hide();
    }

    // Autoscroll
    let intervallo: number;
    if (this.autoscroll === true) {
      intervallo = setInterval(() => {
        avanti();
        hide();
      }, this.autoscrollDelaySeconds * 1000);
    }

    // Create function in order to translate the carousel that can be used in multiple listeners
    const indietro = () => {
      if (position < 0) {
        position = position + 100;
      } else {
        if (this.infiniteScroll === true) {
          position = -((numimg - 1) * 100);
        }
      }
      carousel.style.transform = `translateX(${position}%)`;
    };
    const avanti = () => {
      if (position > -((numimg - 1) * 100)) {
        position = position - 100;
      } else {
        if (this.infiniteScroll === true) {
          position = 0;
        }
      }
      carousel.style.transform = `translateX(${position}%)`;
    };

    // listening for left arrow to be clicked
    if (this.arrowsShow === true) {
      left.addEventListener("click", () => {
        if (this.autoscroll === true) {
          clearInterval(intervallo);
        }
        indietro();
        hide();
      });
    }

    // listening for right arrow to be clicked
    if (this.arrowsShow === true) {
      right.addEventListener("click", () => {
        if (this.autoscroll === true) {
          clearInterval(intervallo);
        }
        avanti();
        hide();
      });
    }

    // liistening for both keydown
    if (this.keydownscroll === true) {
      if (this.grid === false) {
        document.addEventListener("keydown", (evt) => {
          if (this.autoscroll === true) {
            clearInterval(intervallo);
          }
          if (evt.keyCode === 39) {
            avanti();
          }
          if (evt.keyCode === 37) {
            indietro();
          }
          if (
            (evt.keyCode === 37 || evt.keyCode === 39) &&
            this.arrowsShow === true
          ) {
            hide();
          }
        });
      }
    }

    // Gestures
    if (this.grid === false) {
      const touchTarget = new Hammer(carousel);
      touchTarget.on("swipeleft", () => {
        if (this.autoscroll === true) {
          clearInterval(intervallo);
        }
        avanti();
        hide();
      });
      touchTarget.on("swiperight", () => {
        if (this.autoscroll === true) {
          clearInterval(intervallo);
        }
        indietro();
        hide();
      });
    }

    // Grid
    if (this.grid === true) {
      carousel.classList.add("carousel_grid");
      if (this.gridAutoheight === true) {
        this.el.style.height = `${
          carousel.querySelectorAll("img").length * 50
        }px`;
      }
    }
    this.el.shadowRoot.querySelectorAll("img").forEach((img) => {
      img.style.objectFit = `${this.imgFit}`;
    });
  }

  render() {
    return (
      <Host>
        <div class="carousel__container">
          <div class="carousel"></div>
        </div>
        <img
          class="arrowleft"
          src="https://image.flaticon.com/icons/svg/126/126492.svg"
          alt="Left arrow"
        />
        <img
          class="arrowright"
          src="https://image.flaticon.com/icons/svg/126/126490.svg"
          alt="Right arrow"
        />
      </Host>
    );
  }
}
