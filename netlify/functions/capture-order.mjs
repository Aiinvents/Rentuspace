const PAYPAL_API = "https://api-m.sandbox.paypal.com";
const APPLICATION_FEE = "35.00";
const CURRENCY = "USD";
const ALLOWED_ORIGIN = "https://aiinvents.github.io";

export default async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders()
    });
  }

  if (request.method !== "POST") {
    return jsonResponse(
      { error: "Method not allowed." },
      405
    );
  }

  const origin = request.headers.get("origin");

  if (origin && origin !== ALLOWED_ORIGIN) {
    return jsonResponse(
      { error: "Origin not allowed." },
      403
    );
  }

  try {
    const clientId =
      process.env.PAYPAL_CLIENT_ID;

    const clientSecret =
      process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return jsonResponse(
        { error: "PayPal credentials are not configured." },
        500
      );
    }

    const body = await request.json();

    const orderID =
      String(
        body.orderID || ""
      ).trim();

    if (
      !orderID ||
      !/^[A-Za-z0-9]+$/.test(orderID)
    ) {
      return jsonResponse(
        { error: "Invalid order ID." },
        400
      );
    }

    const token = await getAccessToken(
      clientId,
      clientSecret
    );

    const verifyResponse = await fetch(
      `${PAYPAL_API}/v2/checkout/orders/${encodeURIComponent(orderID)}`,
      {
        headers: {
          "Authorization":
            `Bearer ${token}`
        }
      }
    );

    const order =
      await verifyResponse.json();

    if (!verifyResponse.ok) {
      return jsonResponse(
        { error: "Unable to verify PayPal order." },
        400
      );
    }

    const amount =
      order.purchase_units?.[0]?.amount;

    if (
      amount?.value !== APPLICATION_FEE ||
      amount?.currency_code !== CURRENCY
    ) {
      return jsonResponse(
        { error: "Payment amount verification failed." },
        400
      );
    }

    const captureResponse = await fetch(
      `${PAYPAL_API}/v2/checkout/orders/${encodeURIComponent(orderID)}/capture`,
      {
        method: "POST",
        headers: {
          "Authorization":
            `Bearer ${token}`,
          "Content-Type":
            "application/json",
          "PayPal-Request-Id":
            crypto.randomUUID()
        },
        body: "{}"
      }
    );

    const capture =
      await captureResponse.json();

    if (!captureResponse.ok) {
      console.error(
        "PayPal capture error:",
        capture
      );

      return jsonResponse(
        { error: "Unable to capture payment." },
        500
      );
    }

    const transaction =
      capture.purchase_units?.[0]
        ?.payments?.captures?.[0];

    return jsonResponse(
      {
        success:
          capture.status === "COMPLETED",
        status:
          capture.status,
        orderID:
          capture.id,
        transactionID:
          transaction?.id || null
      },
      200
    );

  } catch (error) {
    console.error(error);

    return jsonResponse(
      { error: "Unable to process payment." },
      500
    );
  }
};

async function getAccessToken(
  clientId,
  clientSecret
) {
  const credentials = btoa(
    `${clientId}:${clientSecret}`
  );

  const response = await fetch(
    `${PAYPAL_API}/v1/oauth2/token`,
    {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type":
          "application/x-www-form-urlencoded"
      },
      body: "grant_type=client_credentials"
    }
  );

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    throw new Error(
      "PayPal authentication failed."
    );
  }

  return data.access_token;
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin":
      ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods":
      "POST, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type"
  };
}

function jsonResponse(
  data,
  status = 200
) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        "Content-Type":
          "application/json",
        ...corsHeaders()
      }
    }
  );
}
