/* =========================================================
   HORIZON HOME RENTALS
   Rental Application JavaScript
   File: assets/js/application.js
========================================================= */

"use strict";


/* =========================================================
   WAIT FOR PAGE TO LOAD
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

  initializeApplicationPage();

});


/* =========================================================
   MAIN APPLICATION SETUP
========================================================= */

function initializeApplicationPage() {

  const config = window.RENTAL_SITE_CONFIG || {};

  const form =
    document.getElementById("rental-application");

  const propertySelect =
    document.getElementById("property");

  const formStatus =
    document.getElementById("form-status");

  const paypalStatus =
    document.getElementById("paypal-status");

  const paypalContainer =
    document.getElementById("paypal-button-container");

  const feeDisplay =
    document.getElementById("fee-display");


  /*
   * Stop if this is not the application page.
   */

  if (!form) {
    return;
  }


  /* =======================================================
     CONFIGURATION VALUES
  ======================================================= */

  const applicationFee =
    config.applicationFee || "35.00";

  const currency =
    config.currency || "USD";

  const paypalClientId =
    config.paypalClientId || "";

  const applicationEndpoint =
    config.endpoints &&
    config.endpoints.rentalApplication
      ? config.endpoints.rentalApplication
      : "";


  /*
   * Tracks whether the application was successfully
   * submitted before PayPal checkout is allowed.
   */

  let applicationSubmitted = false;

  let applicationReference = "";

  let paypalRendered = false;


  /* =======================================================
     DISPLAY APPLICATION FEE
  ======================================================= */

  if (feeDisplay) {

    feeDisplay.textContent =
      formatCurrency(
        applicationFee,
        currency
      );

  }


  /* =======================================================
     SELECT PROPERTY FROM URL
  ======================================================= */

  selectPropertyFromURL(propertySelect);


  /* =======================================================
     SET MINIMUM MOVE-IN DATE
  ======================================================= */

  setMinimumMoveInDate();


  /* =======================================================
     INITIAL PAYPAL MESSAGE
  ======================================================= */

  if (paypalStatus) {

    paypalStatus.textContent =
      "Submit your rental application before paying the application fee.";

  }


  /* =======================================================
     FORM SUBMISSION
  ======================================================= */

  form.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      clearStatus(formStatus);


      /*
       * Use the browser's built-in validation.
       */

      if (!form.checkValidity()) {

        form.reportValidity();

        setStatus(
          formStatus,
          "Please complete all required fields before submitting.",
          "error"
        );

        return;

      }


      /*
       * GitHub Pages cannot receive the application
       * by itself. A secure endpoint must be configured.
       */

      if (!applicationEndpoint) {

        setStatus(
          formStatus,
          "The rental application form is not connected to a submission service yet. Add your secure application endpoint in config.js before accepting applications.",
          "error"
        );

        return;

      }


      /*
       * Disable the submit button while processing.
       */

      const submitButton =
        form.querySelector(
          'button[type="submit"]'
        );


      if (submitButton) {

        submitButton.disabled = true;

        submitButton.textContent =
          "Submitting Application...";

      }


      try {

        /*
         * Create application reference number.
         */

        applicationReference =
          createApplicationReference();


        /*
         * Collect form data.
         */

        const formData =
          new FormData(form);


        formData.append(
          "application_reference",
          applicationReference
        );


        formData.append(
          "application_fee",
          applicationFee
        );


        formData.append(
          "currency",
          currency
        );


        formData.append(
          "submitted_at",
          new Date().toISOString()
        );


        /*
         * Send application to configured endpoint.
         */

        const response =
          await fetch(
            applicationEndpoint,
            {
              method: "POST",
              body: formData,
              headers: {
                Accept: "application/json"
              }
            }
          );


        if (!response.ok) {

          throw new Error(
            "Application submission failed."
          );

        }


        /*
         * Application successfully submitted.
         */

        applicationSubmitted = true;


        setStatus(
          formStatus,
          "Your application information was submitted successfully. You can now pay the application fee below.",
          "success"
        );


        /*
         * Lock most application fields after successful
         * submission so they are not accidentally changed
         * after the payment reference is created.
         */

        lockApplicationFields(form);


        /*
         * Load PayPal.
         */

        await initializePayPal({
          paypalClientId: paypalClientId,
          applicationFee: applicationFee,
          currency: currency,
          paypalContainer: paypalContainer,
          paypalStatus: paypalStatus,
          applicationReference: applicationReference,
          propertySelect: propertySelect,
          applicantEmail:
            document.getElementById("email"),
          firstName:
            document.getElementById("first-name"),
          lastName:
            document.getElementById("last-name"),
          getApplicationSubmitted:
            function () {
              return applicationSubmitted;
            },
          paypalRendered:
            paypalRendered,
          setPaypalRendered:
            function (value) {
              paypalRendered = value;
            }
        });


      } catch (error) {

        console.error(
          "Application submission error:",
          error
        );


        applicationSubmitted = false;


        setStatus(
          formStatus,
          "We could not submit your application. Please check your connection and try again.",
          "error"
        );

      } finally {

        if (
          submitButton &&
          !applicationSubmitted
        ) {

          submitButton.disabled = false;

          submitButton.textContent =
            "Submit Application Information";

        }

      }

    }
  );


  /* =======================================================
     FOOTER YEAR
  ======================================================= */

  initializeFooterYear();

}


/* =========================================================
   PROPERTY FROM URL
========================================================= */

function selectPropertyFromURL(
  propertySelect
) {

  if (!propertySelect) {
    return;
  }


  /*
   * Example URL:
   *
   * application.html?property=Cedar%20Ridge%20House
   */

  const parameters =
    new URLSearchParams(
      window.location.search
    );


  const property =
    parameters.get("property");


  if (!property) {
    return;
  }


  /*
   * Find a matching option.
   */

  const options =
    Array.from(
      propertySelect.options
    );


  const matchingOption =
    options.find(
      function (option) {

        return (
          option.value === property ||
          option.textContent.trim() === property
        );

      }
    );


  if (matchingOption) {

    propertySelect.value =
      matchingOption.value;

  }

}


/* =========================================================
   MINIMUM MOVE-IN DATE
========================================================= */

function setMinimumMoveInDate() {

  const moveInInput =
    document.getElementById("move-in");


  if (!moveInInput) {
    return;
  }


  /*
   * Prevent choosing a date before today.
   */

  const today =
    new Date();


  const year =
    today.getFullYear();


  const month =
    String(
      today.getMonth() + 1
    ).padStart(2, "0");


  const day =
    String(
      today.getDate()
    ).padStart(2, "0");


  moveInInput.min =
    year +
    "-" +
    month +
    "-" +
    day;

}


/* =========================================================
   PAYPAL INITIALIZATION
========================================================= */

async function initializePayPal(options) {

  const {
    paypalClientId,
    applicationFee,
    currency,
    paypalContainer,
    paypalStatus,
    applicationReference,
    propertySelect,
    applicantEmail,
    firstName,
    lastName,
    getApplicationSubmitted,
    paypalRendered,
    setPaypalRendered
  } = options;


  /*
   * Don't render PayPal twice.
   */

  if (paypalRendered) {
    return;
  }


  if (!paypalContainer) {
    return;
  }


  /*
   * Verify PayPal Client ID.
   */

  if (
    !paypalClientId ||
    paypalClientId ===
      "YOUR_PAYPAL_CLIENT_ID"
  ) {

    setStatus(
      paypalStatus,
      "PayPal is not configured yet. Add your PayPal Client ID in config.js.",
      "error"
    );

    return;

  }


  /*
   * Load PayPal SDK if it has not already loaded.
   */

  try {

    await loadPayPalScript(
      paypalClientId,
      currency
    );

  } catch (error) {

    console.error(
      "PayPal SDK error:",
      error
    );


    setStatus(
      paypalStatus,
      "PayPal checkout could not load. Please refresh the page and try again.",
      "error"
    );

    return;

  }


  /*
   * Verify PayPal object exists.
   */

  if (
    typeof window.paypal ===
    "undefined"
  ) {

    setStatus(
      paypalStatus,
      "PayPal checkout is currently unavailable.",
      "error"
    );

    return;

  }


  /*
   * Remove previous status.
   */

  clearStatus(paypalStatus);


  /*
   * Clear the PayPal container before rendering.
   */

  paypalContainer.innerHTML = "";


  /* =======================================================
     PAYPAL BUTTONS
  ======================================================= */

  try {

    await window.paypal
      .Buttons({

        style: {

          layout: "vertical",

          shape: "pill",

          label: "paypal"

        },


        /* ===============================================
           CREATE PAYPAL ORDER
        =============================================== */

        createOrder:
          function (
            data,
            actions
          ) {

            /*
             * Do not allow payment unless the application
             * was successfully submitted.
             */

            if (
              !getApplicationSubmitted()
            ) {

              setStatus(
                paypalStatus,
                "Please submit your rental application before paying the application fee.",
                "error"
              );

              return Promise.reject(
                new Error(
                  "Application has not been submitted."
                )
              );

            }


            const selectedProperty =
              propertySelect
                ? propertySelect.value
                : "Rental Application";


            const applicantName =
              buildApplicantName(
                firstName,
                lastName
              );


            /*
             * Create PayPal order.
             */

            return actions.order.create({

              purchase_units: [

                {

                  reference_id:
                    applicationReference,

                  description:
                    "Rental application fee - " +
                    selectedProperty,

                  custom_id:
                    applicationReference,

                  amount: {

                    currency_code:
                      currency,

                    value:
                      Number(
                        applicationFee
                      ).toFixed(2)

                  }

                }

              ],


              /*
               * Prefill some PayPal payer information
               * when available.
               */

              payer: {

                name: {

                  given_name:
                    firstName
                      ? firstName.value.trim()
                      : "",

                  surname:
                    lastName
                      ? lastName.value.trim()
                      : ""

                },

                email_address:
                  applicantEmail
                    ? applicantEmail.value.trim()
                    : ""

              },

              application_context: {

                brand_name:
                  "Horizon Home Rentals",

                shipping_preference:
                  "NO_SHIPPING",

                user_action:
                  "PAY_NOW"

              }

            });

          },


        /* ===============================================
           APPROVE AND CAPTURE PAYMENT
        =============================================== */

        onApprove:
          async function (
            data,
            actions
          ) {

            setStatus(
              paypalStatus,
              "Processing your payment...",
              ""
            );


            try {

              const details =
                await actions.order.capture();


              const transactionId =
                getTransactionId(
                  details
                );


              const payerName =
                getPayerName(
                  details
                );


              /*
               * Display success message.
               */

              let message =
                "Payment completed successfully.";


              if (payerName) {

                message =
                  "Thank you, " +
                  payerName +
                  ". Your application fee was paid successfully.";

              }


              if (transactionId) {

                message +=
                  " Transaction ID: " +
                  transactionId +
                  ".";

              }


              setStatus(
                paypalStatus,
                message,
                "success"
              );


              /*
               * Disable PayPal area after successful payment.
               */

              paypalContainer.setAttribute(
                "data-payment-complete",
                "true"
              );


              /*
               * Log payment information.
               *
               * IMPORTANT:
               * A production rental website should also
               * verify PayPal payments on a secure server.
               */

              console.log(
                "PayPal payment completed:",
                {
                  applicationReference:
                    applicationReference,
                  orderId:
                    data.orderID,
                  transactionId:
                    transactionId,
                  status:
                    details.status
                }
              );


            } catch (error) {

              console.error(
                "PayPal capture error:",
                error
              );


              setStatus(
                paypalStatus,
                "Your PayPal payment could not be completed. Please try again.",
                "error"
              );

            }

          },


        /* ===============================================
           PAYMENT CANCELLED
        =============================================== */

        onCancel:
          function () {

            setStatus(
              paypalStatus,
              "Payment was cancelled. Your application information remains submitted, and you can try the payment again.",
              "error"
            );

          },


        /* ===============================================
           PAYPAL ERROR
        =============================================== */

        onError:
          function (error) {

            console.error(
              "PayPal error:",
              error
            );


            setStatus(
              paypalStatus,
              "PayPal encountered an error. Please try again.",
              "error"
            );

          }

      })
      .render(
        "#paypal-button-container"
      );


    setPaypalRendered(true);


  } catch (error) {

    console.error(
      "PayPal render error:",
      error
    );


    setStatus(
      paypalStatus,
      "PayPal checkout could not be displayed.",
      "error"
    );

  }

}


/* =========================================================
   LOAD PAYPAL SDK
========================================================= */

function loadPayPalScript(
  clientId,
  currency
) {

  return new Promise(
    function (
      resolve,
      reject
    ) {

      /*
       * If PayPal is already loaded,
       * do not load it again.
       */

      if (window.paypal) {

        resolve();

        return;

      }


      /*
       * Check whether a PayPal script tag
       * already exists.
       */

      const existingScript =
        document.querySelector(
          'script[data-paypal-sdk="true"]'
        );


      if (existingScript) {

        existingScript.addEventListener(
          "load",
          function () {
            resolve();
          }
        );


        existingScript.addEventListener(
          "error",
          function () {
            reject(
              new Error(
                "PayPal SDK failed to load."
              )
            );
          }
        );


        return;

      }


      /*
       * Create PayPal SDK URL.
       */

      const script =
        document.createElement(
          "script"
        );


      const parameters =
        new URLSearchParams({

          "client-id":
            clientId,

          currency:
            currency,

          intent:
            "capture",

          components:
            "buttons"

        });


      script.src =
        "https://www.paypal.com/sdk/js?" +
        parameters.toString();


      script.async = true;


      script.setAttribute(
        "data-paypal-sdk",
        "true"
      );


      script.addEventListener(
        "load",
        function () {

          resolve();

        }
      );


      script.addEventListener(
        "error",
        function () {

          reject(
            new Error(
              "PayPal SDK failed to load."
            )
          );

        }
      );


      document.head.appendChild(
        script
      );

    }
  );

}


/* =========================================================
   LOCK APPLICATION FIELDS
========================================================= */

function lockApplicationFields(
  form
) {

  if (!form) {
    return;
  }


  const fields =
    form.querySelectorAll(
      "input, select, textarea"
    );


  fields.forEach(
    function (field) {

      field.disabled = true;

    }
  );


  const submitButton =
    form.querySelector(
      'button[type="submit"]'
    );


  if (submitButton) {

    submitButton.disabled = true;

    submitButton.textContent =
      "Application Submitted";

  }

}


/* =========================================================
   APPLICATION REFERENCE NUMBER
========================================================= */

function createApplicationReference() {

  /*
   * Creates something like:
   *
   * HHR-20260911-482731
   */

  const now =
    new Date();


  const year =
    now.getFullYear();


  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, "0");


  const day =
    String(
      now.getDate()
    ).padStart(2, "0");


  const randomNumber =
    Math.floor(
      100000 +
      Math.random() * 900000
    );


  return (
    "HHR-" +
    year +
    month +
    day +
    "-" +
    randomNumber
  );

}


/* =========================================================
   BUILD APPLICANT NAME
========================================================= */

function buildApplicantName(
  firstName,
  lastName
) {

  const first =
    firstName
      ? firstName.value.trim()
      : "";


  const last =
    lastName
      ? lastName.value.trim()
      : "";


  return (
    first +
    " " +
    last
  ).trim();

}


/* =========================================================
   GET PAYPAL TRANSACTION ID
========================================================= */

function getTransactionId(
  details
) {

  try {

    return (
      details
        .purchase_units[0]
        .payments
        .captures[0]
        .id || ""
    );

  } catch (error) {

    return "";

  }

}


/* =========================================================
   GET PAYPAL PAYER NAME
========================================================= */

function getPayerName(
  details
) {

  try {

    const givenName =
      details.payer &&
      details.payer.name
        ? details.payer.name.given_name
        : "";


    const surname =
      details.payer &&
      details.payer.name
        ? details.payer.name.surname
        : "";


    return (
      givenName +
      " " +
      surname
    ).trim();

  } catch (error) {

    return "";

  }

}


/* =========================================================
   FORMAT MONEY
========================================================= */

function formatCurrency(
  amount,
  currency
) {

  const numericAmount =
    Number(amount);


  if (
    Number.isNaN(
      numericAmount
    )
  ) {

    return "$0.00";

  }


  try {

    return new Intl
      .NumberFormat(
        "en-US",
        {
          style: "currency",
          currency:
            currency || "USD"
        }
      )
      .format(
        numericAmount
      );

  } catch (error) {

    return (
      "$" +
      numericAmount.toFixed(2)
    );

  }

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
   END OF APPLICATION.JS
========================================================= */
