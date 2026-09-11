/* =========================================================
   HORIZON HOME RENTALS
   Main JavaScript
   File: assets/js/main.js
========================================================= */

"use strict";


/* =========================================================
   WAIT UNTIL THE PAGE IS READY
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  initializeMobileMenu();

  initializeSlideshows();

  initializeFooterYear();

});


/* =========================================================
   MOBILE NAVIGATION
========================================================= */

function initializeMobileMenu() {

  const menuButton = document.querySelector(".menu-toggle");

  const navigation = document.querySelector(
    ".site-nav:not(.always-visible)"
  );


  /*
   * Some pages do not use the mobile menu button.
   * If either element does not exist, stop here.
   */

  if (!menuButton || !navigation) {
    return;
  }


  /*
   * Open and close the mobile navigation.
   */

  menuButton.addEventListener("click", function () {

    const menuIsOpen =
      navigation.classList.toggle("open");


    menuButton.setAttribute(
      "aria-expanded",
      menuIsOpen ? "true" : "false"
    );


    menuButton.textContent =
      menuIsOpen ? "Close" : "Menu";

  });


  /*
   * Close the mobile menu after the visitor
   * selects a navigation link.
   */

  const navigationLinks =
    navigation.querySelectorAll("a");


  navigationLinks.forEach(function (link) {

    link.addEventListener("click", function () {

      navigation.classList.remove("open");

      menuButton.setAttribute(
        "aria-expanded",
        "false"
      );

      menuButton.textContent = "Menu";

    });

  });


  /*
   * Close the mobile menu if the visitor
   * presses the Escape key.
   */

  document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {

      navigation.classList.remove("open");

      menuButton.setAttribute(
        "aria-expanded",
        "false"
      );

      menuButton.textContent = "Menu";

    }

  });


  /*
   * If the browser is resized from mobile
   * to desktop, reset the mobile menu.
   */

  window.addEventListener("resize", function () {

    if (window.innerWidth > 760) {

      navigation.classList.remove("open");

      menuButton.setAttribute(
        "aria-expanded",
        "false"
      );

      menuButton.textContent = "Menu";

    }

  });

}


/* =========================================================
   PROPERTY SLIDESHOWS
========================================================= */

function initializeSlideshows() {

  /*
   * Find every slideshow on the page.
   *
   * Each rental property has its own slideshow,
   * so every slideshow is controlled independently.
   */

  const slideshows =
    document.querySelectorAll("[data-slideshow]");


  /*
   * If there are no slideshows on the current page,
   * there is nothing else to do.
   */

  if (!slideshows.length) {
    return;
  }


  slideshows.forEach(function (slideshow) {

    const slides =
      slideshow.querySelectorAll(".slide");

    const previousButton =
      slideshow.querySelector(".prev");

    const nextButton =
      slideshow.querySelector(".next");

    const counter =
      slideshow.querySelector(".slide-counter");


    /*
     * Stop if this slideshow has no images.
     */

    if (!slides.length) {
      return;
    }


    /*
     * Start each property on its first image.
     */

    let currentSlide = 0;


    /* =====================================================
       SHOW A SPECIFIC SLIDE
    ===================================================== */

    function showSlide(index) {

      /*
       * If the visitor goes past the final image,
       * return to the first image.
       */

      if (index >= slides.length) {
        index = 0;
      }


      /*
       * If the visitor goes backward from the first
       * image, go to the final image.
       */

      if (index < 0) {
        index = slides.length - 1;
      }


      currentSlide = index;


      /*
       * Remove the active class from every image.
       */

      slides.forEach(function (slide) {

        slide.classList.remove("active");

        slide.setAttribute(
          "aria-hidden",
          "true"
        );

      });


      /*
       * Display the selected image.
       */

      slides[currentSlide].classList.add("active");

      slides[currentSlide].setAttribute(
        "aria-hidden",
        "false"
      );


      /*
       * Update the image counter.
       *
       * Example:
       * 1 / 8
       * 2 / 8
       * 3 / 8
       */

      if (counter) {

        counter.textContent =
          (currentSlide + 1) +
          " / " +
          slides.length;

      }

    }


    /* =====================================================
       PREVIOUS IMAGE BUTTON
    ===================================================== */

    if (previousButton) {

      previousButton.addEventListener(
        "click",
        function () {

          showSlide(currentSlide - 1);

        }
      );

    }


    /* =====================================================
       NEXT IMAGE BUTTON
    ===================================================== */

    if (nextButton) {

      nextButton.addEventListener(
        "click",
        function () {

          showSlide(currentSlide + 1);

        }
      );

    }


    /* =====================================================
       KEYBOARD ACCESSIBILITY
    ===================================================== */

    slideshow.setAttribute(
      "tabindex",
      "0"
    );


    slideshow.addEventListener(
      "keydown",
      function (event) {

        /*
         * Left arrow = previous picture
         */

        if (event.key === "ArrowLeft") {

          event.preventDefault();

          showSlide(currentSlide - 1);

        }


        /*
         * Right arrow = next picture
         */

        if (event.key === "ArrowRight") {

          event.preventDefault();

          showSlide(currentSlide + 1);

        }

      }
    );


    /* =====================================================
       TOUCH / SWIPE SUPPORT
    ===================================================== */

    let touchStartX = 0;

    let touchEndX = 0;


    slideshow.addEventListener(
      "touchstart",
      function (event) {

        touchStartX =
          event.changedTouches[0].screenX;

      },
      {
        passive: true
      }
    );


    slideshow.addEventListener(
      "touchend",
      function (event) {

        touchEndX =
          event.changedTouches[0].screenX;


        handleSwipe();

      },
      {
        passive: true
      }
    );


    function handleSwipe() {

      const swipeDistance =
        touchStartX - touchEndX;


      /*
       * Require a swipe of at least 50 pixels
       * so normal taps do not change pictures.
       */

      const minimumSwipeDistance = 50;


      /*
       * Swipe left = next image
       */

      if (
        swipeDistance >
        minimumSwipeDistance
      ) {

        showSlide(currentSlide + 1);

      }


      /*
       * Swipe right = previous image
       */

      if (
        swipeDistance <
        -minimumSwipeDistance
      ) {

        showSlide(currentSlide - 1);

      }

    }


    /*
     * Make sure the slideshow is initialized
     * correctly when the page first loads.
     */

    showSlide(0);

  });

}


/* =========================================================
   FOOTER YEAR
========================================================= */

function initializeFooterYear() {

  /*
   * Find the element:
   *
   * <span id="year"></span>
   */

  const yearElement =
    document.getElementById("year");


  /*
   * Some pages may not contain the year element.
   */

  if (!yearElement) {
    return;
  }


  /*
   * Automatically display the current year.
   *
   * This means you do not have to manually
   * update the copyright year every January.
   */

  yearElement.textContent =
    new Date().getFullYear();

}


/* =========================================================
   END OF MAIN.JS
========================================================= */
