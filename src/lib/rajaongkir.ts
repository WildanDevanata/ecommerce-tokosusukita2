import type {
  Province,
  City,
  CourierResult,
  CostRequest,
} from "./types";

const BASE_URL =
  process.env.RAJAONGKIR_BASE_URL ||
  "https://rajaongkir.komerce.id/api/v1";

const API_KEY = process.env.RAJAONGKIR_API_KEY!;

// ======================================================
// FETCH HELPER
// ======================================================

async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 30000
): Promise<Response> {
  console.log("FETCH URL:", url);

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      cache: "no-store",
    });

    return response;
  } catch (error) {
    console.error("FETCH ERROR:", error);

    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timeout RajaOngkir");
    }

    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

// ======================================================
// HEADERS
// ======================================================

const headers = {
  key: API_KEY,
  accept: "application/json",
};

// ======================================================
// GET PROVINCES
// ======================================================

export async function getProvinces(): Promise<Province[]> {
  const response = await fetchWithTimeout(
    `${BASE_URL}/destination/province`,
    {
      method: "GET",
      headers,
    }
  );

  console.log("STATUS:", response.status);

  if (!response.ok) {
    const text = await response.text();

    console.log("ERROR BODY:", text);

    throw new Error(`Province Error ${response.status}`);
  }

  const json = await response.json();

  console.log("PROVINCE RESPONSE:", json);

  return json.data || [];
}

// ======================================================
// GET CITIES
// ======================================================

export async function getCities(
  provinceId: string
): Promise<City[]> {
  const response = await fetchWithTimeout(
    `${BASE_URL}/destination/city/${provinceId}`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    throw new Error(`City Error ${response.status}`);
  }

  const json = await response.json();

  return json.data || [];
}

// ======================================================
// CALCULATE COST
// ======================================================

export async function calculateCost(data: CostRequest): Promise<CourierResult[]> {
  // Validate that strings are actual numbers
  if (!data.destination || data.destination === "undefined") {
    throw new Error("Invalid destination city ID provided.");
  }
  const url =
    "https://rajaongkir.komerce.id/api/v1/calculate/domestic-cost";

  console.log("CALCULATE:", data);

  // WAJIB x-www-form-urlencoded
  const body = new URLSearchParams();

  body.append("origin", data.origin);
  body.append("destination", data.destination);
  body.append("weight", data.weight.toString());
  body.append("courier", data.courier);

  console.log("BODY:", body.toString());

  const response = await fetch(url, {
    method: "POST",
    headers: {
      key: API_KEY,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
    cache: "no-store",
  });

  const text = await response.text();

  console.log("STATUS:", response.status);
  console.log("RESPONSE:", text);

  const json = JSON.parse(text);

  if (!response.ok) {
    throw new Error(
      json?.meta?.message || `Cost Error ${response.status}`
    );
  }

  return json.data || [];
}