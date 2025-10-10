import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get("location") || "Delhi";
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

  try {
    const restaurants = [];
    let nextPageToken = null;

    let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=restaurants+in+${encodeURIComponent(
      location
    )}&key=${apiKey}`;

    do {
      const res = await fetch(url);
      const text = await res.text();

      // Try parsing JSON safely
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Failed to parse JSON, response:", text);
        break;
      }

      if (!data.results) break;

      for (const r of data.results) {
        try {
          const detailsRes = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${r.place_id}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,rating&key=${apiKey}`
          );
          const detailsData = await detailsRes.json();
          const details = detailsData.result || {};

          restaurants.push({
            id: r.place_id,
            name: details.name || r.name,
            address: details.formatted_address || r.formatted_address,
            phone: details.formatted_phone_number || "",
            website: details.website || "",
            opening_hours: details.opening_hours?.weekday_text || [],
            rating: details.rating || null,
          });
        } catch (err) {
          console.error("Place Details API error for", r.name, err);
        }
      }

      nextPageToken = data.next_page_token;

      if (nextPageToken) {
        await new Promise((resolve) => setTimeout(resolve, 2500)); // wait before using token
        url = `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${nextPageToken}&key=${apiKey}`;
      }
    } while (nextPageToken);

    return NextResponse.json({ restaurants });
  } catch (err) {
    console.error("API fetch error:", err);
    return NextResponse.json({ restaurants: [] });
  }
}
