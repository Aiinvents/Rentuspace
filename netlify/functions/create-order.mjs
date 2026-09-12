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
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return jsonResponse(
        { error: "PayPal credentials are not configured." },
        500
      );
    }

    const token = await getAccessToken(
      clientId,
      clientSecret
    );

    const paypalResponse = await fetch(
      `${PAYPAL_API}/v2/checkout/orders`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "PayPal-Request-Id": crypto.randomUUID()
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              description:
                "Horizon Home Rentals Application Fee",
              amount: {
                currency_code: CURRENCY,
                value: APPLICATION_FEE
              }
            }
          ]
        })
      }
    );

    const data = await paypalResponse.json();

    if (!paypalResponse.ok) {
      console.error(
        "PayPal create-order error:",
        data
      );

      return jsonResponse(
        { error: "Unable to create PayPal order." },
        500
      );
    }

    return jsonResponse(
      {
        id: data.id
      },
      200
    );

  } catch (error) {
    console.error(error);

    return jsonResponse(
      { error: "Unable to create PayPal order." },
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
