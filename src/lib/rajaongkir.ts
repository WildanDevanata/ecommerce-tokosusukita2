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
// TYPE DESTINATION
// ======================================================

export type Destination = {
  id: number;
  label: string;
  province_name: string;
  city_name: string;
  district_name: string;
  subdistrict_name: string;
  zip_code: string;
};


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

    return await fetch(url, {
      ...options,
      signal: controller.signal,
      cache: "no-store",
    });


  } catch (error) {

    console.error("FETCH ERROR:", error);


    if (
      error instanceof Error &&
      error.name === "AbortError"
    ) {
      throw new Error(
        "Request timeout RajaOngkir"
      );
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
// SEARCH DOMESTIC DESTINATION
// ======================================================

export async function searchDestination(
  keyword: string
): Promise<Destination[]> {


  if (!keyword) {
    return [];
  }


  const url =
    `${BASE_URL}/destination/domestic-destination` +
    `?search=${encodeURIComponent(keyword)}` +
    `&limit=10&offset=0`;


  const response = await fetchWithTimeout(
    url,
    {
      method: "GET",
      headers,
    }
  );


  if (!response.ok) {

    const text = await response.text();

    console.error(
      "DESTINATION ERROR:",
      text
    );

    throw new Error(
      `Destination Error ${response.status}`
    );
  }


  const json = await response.json();


  console.log(
    "DESTINATION RESPONSE:",
    json
  );


  return json.data || [];

}



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


  if (!response.ok) {

    throw new Error(
      `Province Error ${response.status}`
    );

  }


  const json = await response.json();


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

    throw new Error(
      `City Error ${response.status}`
    );

  }


  const json = await response.json();


  return json.data || [];

}



// ======================================================
// CALCULATE DOMESTIC COST
// ======================================================

export async function calculateCost(
  data: CostRequest
): Promise<CourierResult[]> {


  if (
    !data.origin ||
    !data.destination
  ) {

    throw new Error(
      "Origin dan destination wajib diisi"
    );

  }


  const url =
    `${BASE_URL}/calculate/domestic-cost`;



  console.log(
    "CALCULATE DATA:",
    data
  );



  const body =
    new URLSearchParams();


  body.append(
    "origin",
    String(data.origin)
  );


  body.append(
    "destination",
    String(data.destination)
  );


  body.append(
    "weight",
    String(data.weight)
  );


  body.append(
    "courier",
    data.courier
  );



  const response =
    await fetchWithTimeout(
      url,
      {
        method: "POST",

        headers: {
          key: API_KEY,
          "Content-Type":
            "application/x-www-form-urlencoded",
        },

        body:
          body.toString(),
      }
    );



  const text =
    await response.text();



  console.log(
    "COST RESPONSE:",
    text
  );



  const json =
    JSON.parse(text);



  if (!response.ok) {

    throw new Error(
      json?.meta?.message ||
      `Cost Error ${response.status}`
    );

  }



  return json.data || [];

}