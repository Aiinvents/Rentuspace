/* =========================================================
   HORIZON HOME RENTALS
   Site Configuration
   File: assets/js/config.js
========================================================= */

window.RENTAL_SITE_CONFIG = {

  /*
   * PAYPAL CLIENT ID
   *
   * Replace YOUR_PAYPAL_CLIENT_ID with your real PayPal
   * Sandbox client ID while testing.
   *
   * When you are ready to go live, replace it with your
   * PayPal Live client ID.
   */
  paypalClientId: "BAABuU2xH2oY1ckg4eb8uZ1dza_hKPSa8duAPeIvbS21x4MqmNNsWtk4AsfyA1X9S76TLymGHaWbt-Lzd0",


  /*
   * APPLICATION FEE
   *
   * Change this amount if your application fee changes.
   */
  applicationFee: "35.00",


  /*
   * CURRENCY
   *
   * USD = United States Dollar
   */
  currency: "USD",


  /*
   * COMPANY INFORMATION
   *
   * Replace these placeholder details with your real
   * rental company information before publishing.
   */
  company: {

    name: "Horizon Home Rentals",

    phone: "(555) 123-4567",

    phoneLink: "+15551234567",

    email: "rentals@example.com",

    addressLine1: "100 Main Street",

    addressLine2: "Suite 200",

    city: "Louisville",

    state: "KY",

    zip: "40216"

  },


  /*
   * FORM ENDPOINTS
   *
   * GitHub Pages cannot securely process or store form
   * submissions by itself.
   *
   * You can connect these forms to a secure backend,
   * Formspree, Netlify Forms, your own API, or another
   * form-processing service.
   *
   * Leave these blank until you have a secure endpoint.
   */
  endpoints: {

    contactForm: "https://formspree.io/f/mvkoldvn",

    rentalApplication: "https://form.jotform.com/262532139626054"

  },


  /*
   * RENTAL PROPERTIES
   *
   * These names should match the property names used
   * in index.html, contact.html, and application.html.
   */
  properties: [

    {
      id: "Broadleaf-Arms-Apartments",
      name: "Broadleaf Arms Apartments",
      rent: 1850
    },

    {
      id: "maple-court",
      name: "Maple Court Townhome",
      rent: 1675
    },

    {
      id: "willow-park",
      name: "Willow Park Bungalow",
      rent: 1525
    },

    {
      id: "riverstone",
      name: "Riverstone Family Home",
      rent: 2250
    },

    {
      id: "sunset-loft",
      name: "Sunset Loft Apartment",
      rent: 1395
    }

  ]

};


/* =========================================================
   END OF CONFIGURATION
========================================================= */
