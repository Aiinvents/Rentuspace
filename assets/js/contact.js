/* =========================================================
   HORIZON HOME RENTALS
   Contact Page JavaScript
   File: assets/js/contact.js
========================================================= */

"use strict";


/* =========================================================
   WAIT UNTIL PAGE IS READY
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  initializeContactPage();

});


/* =========================================================
   CONTACT PAGE SETUP
========================================================= */

function initializeContactPage() {

  const config =
    window.RENTAL_SITE_CONFIG || {};

  const form =
    document.getElementById("contact-form");

  const status =
    document.getElementById("contact-status");

  const propertySelect =
    document.getElementById("property");

  const contactEndpoint =
    config.endpoints &&
    config.endpoints.contactForm
      ? config.endpoints.contactForm
      : "";

  const company =
    config.company || {};


  /* =======================================================
     FOOTER YEAR
  ======================================================= */

  initializeFooterYear();


  /* =======================================================
     PRESELECT PROPERTY FROM URL
  ======================================================= */

  selectPropertyFromURL(
    propertySelect
  );


  /*
   * Stop here if the page does not contain
   * the contact form.
   */

  if (!form) {
    return;
  }


  /* =======================================================
     CONTACT FORM SUBMISSION
  ======================================================= */

  form.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      clearStatus(status);


      /*
       * Use built-in browser validation.
       */

      if (!form.checkValidity()) {

        form.reportValidity();


        setStatus(
          status,
          "Please complete all required fields before sending your message.",
          "error"
        );


        return;

      }


      /*
       * If a contact form endpoint has been configured,
       * send the form through that endpoint.
       */

      if (contactEndpoint) {

        await submitContactForm(
          form,
          contactEndpoint,
          status
        );


        return;

      }


      /*
       * If no form endpoint has been configured,
       * fall back to opening the visitor's email app.
       */

      openEmailFallback(
        form,
        company,
        status
      );

    }
  );

}


/* =========================================================
   PRESELECT PROPERTY FROM URL
========================================================= */

function selectPropertyFromURL(
  propertySelect
) {

  if (!propertySelect) {
    return;
  }


  /*
   * Example:
   *
   * contact.html?property=Cedar%20Ridge%20House
   */

  const parameters =
    new URLSearchParams(
      window.location.search
    );


  const requestedProperty =
    parameters.get("property");


  if (!requestedProperty) {
    return;
  }


  const options =
    Array.from(
      propertySelect.options
    );


  const matchingOption =
    options.find(
      function (option) {

        return (
          option.value ===
            requestedProperty ||
          option.textContent.trim() ===
            requestedProperty
        );

      }
    );


  if (matchingOption) {

    propertySelect.value =
      matchingOption.value;

  }

}


/* =========================================================
   SUBMIT CONTACT FORM TO ENDPOINT
========================================================= */

async function submitContactForm(
  form,
  endpoint,
  status
) {

  const submitButton =
    form.querySelector(
      'button[type="submit"]'
    );


  const originalButtonText =
    submitButton
      ? submitButton.textContent
      : "";


  try {

    /*
     * Disable the button so the visitor
     * does not accidentally submit twice.
     */

    if (submitButton) {

      submitButton.disabled = true;

      submitButton.textContent =
        "Sending...";

    }


    setStatus(
      status,
      "Sending your message...",
      ""
    );


    /*
     * Collect the form fields.
     */

    const formData =
      new FormData(form);


    /*
     * Add submission timestamp.
     */

    formData.append(
      "submitted_at",
      new Date().toISOString()
    );


    /*
     * Send to the configured endpoint.
     */

    const response =
      await fetch(
        endpoint,
        {
          method: "POST",
          body: formData,
          headers: {
            Accept:
              "application/json"
          }
        }
      );


    if (!response.ok) {

      throw new Error(
        "Contact form submission failed."
      );

    }


    /*
     * Successful submission.
     */

    setStatus(
      status,
      "Your message was sent successfully. Thank you for contacting Horizon Home Rentals.",
      "success"
    );


    /*
     * Clear the form.
     */

    form.reset();


  } catch (error) {

    console.error(
      "Contact form error:",
      error
    );


    setStatus(
      status,
      "Your message could not be sent. Please try again or contact us directly by email.",
      "error"
    );


  } finally {

    /*
     * Re-enable the button.
     */

    if (submitButton) {

      submitButton.disabled = false;

      submitButton.textContent =
        originalButtonText ||
        "Send Message";

    }

  }

}


/* =========================================================
   EMAIL FALLBACK
========================================================= */

function openEmailFallback(
  form,
  company,
  status
) {

  const formData =
    new FormData(form);


  const emailAddress =
    company.email ||
    "rentals@example.com";


  const firstName =
    String(
      formData.get(
        "first_name"
      ) || ""
    ).trim();


  const lastName =
    String(
      formData.get(
        "last_name"
      ) || ""
    ).trim();


  const visitorEmail =
    String(
      formData.get(
        "email"
      ) || ""
    ).trim();


  const phone =
    String(
      formData.get(
        "phone"
      ) || ""
    ).trim();


  const property =
    String(
      formData.get(
        "property"
      ) || "General question"
    ).trim();


  const subjectField =
    String(
      formData.get(
        "subject"
      ) || ""
    ).trim();


  const message =
    String(
      formData.get(
        "message"
      ) || ""
    ).trim();


  const fullName =
    (
      firstName +
      " " +
      lastName
    ).trim();


  /*
   * Build the email subject.
   */

  let emailSubject =
    "Rental Inquiry";


  if (
    property &&
    property !==
      "General question"
  ) {

    emailSubject +=
      " - " +
      property;

  }


  if (subjectField) {

    emailSubject +=
      " - " +
      subjectField;

  }


  /*
   * Build the email body.
   */

  const bodyLines = [

    "Name: " +
      (fullName || "Not provided"),

    "Email: " +
      (visitorEmail ||
       "Not provided"),

    "Phone: " +
      (phone ||
       "Not provided"),

    "Property: " +
      (property ||
       "General question"),

    "",

    "Message:",

    message

  ];


  const emailBody =
    bodyLines.join("\n");


  /*
   * Build the mailto link.
   */

  const mailtoURL =
    "mailto:" +
    encodeURIComponent(
      emailAddress
    ) +
    "?subject=" +
    encodeURIComponent(
      emailSubject
    ) +
    "&body=" +
    encodeURIComponent(
      emailBody
    );


  /*
   * Let the visitor know what is happening.
   */

  setStatus(
    status,
    "Opening your email app so you can send the message.",
    "success"
  );


  /*
   * Open the visitor's default email application.
   */

  window.location.href =
    mailtoURL;

}


/* =========================================================
   STATUS MESSAGE
========================================================= */

function setStatus(
  element,
  message,
  type
) {

  if (!element) {
    return;
  }


  element.textContent =
    message;


  element.classList.remove(
    "success",
    "error"
  );


  if (
    type === "success"
  ) {

    element.classList.add(
      "success"
    );

  }


  if (
    type === "error"
  ) {

    element.classList.add(
      "error"
    );

  }

}


/* =========================================================
   CLEAR STATUS MESSAGE
========================================================= */

function clearStatus(
  element
) {

  if (!element) {
    return;
  }


  element.textContent = "";


  element.classList.remove(
    "success",
    "error"
  );

}


/* =========================================================
   FOOTER YEAR
========================================================= */

function initializeFooterYear() {

  const yearElement =
    document.getElementById(
      "year"
    );


  if (!yearElement) {
    return;
  }


  yearElement.textContent =
    new Date().getFullYear();

}


/* =========================================================
   END OF CONTACT.JS
========================================================= */
