"use client";
import { useState, useEffect, useRef } from "react";
import AddVisitForm from "./AddVisitForm";

export default function WorkPage({ user }) {
  const [assignedRegion, setAssignedRegion] = useState([]);
  const [restaurants, setRestaurants] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [selectedCities, setSelectedCities] = useState({});
  const autocompleteRef = useRef(null);
  const [selectedCity, setSelectedCity] = useState("");

  // Fetch salesperson assignedRegion
  useEffect(() => {
    if (!user) return;

    const fetchAssignedRegion = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/getSalespersonRegion?uid=${user.uid}`);
        const data = await res.json();
        setAssignedRegion(data.assignedRegion || []);
      } catch (err) {
        console.error("Error fetching assigned region:", err);
      }
      setLoading(false);
    };

    fetchAssignedRegion();
  }, [user]);

  // Fetch restaurants for each state
  useEffect(() => {
    if (assignedRegion.length === 0) return;

    const fetchRestaurantsByState = async () => {
      setLoading(true);
      const allRestaurants = {};

      for (let state of assignedRegion) {
        try {
          const res = await fetch(
            `/api/getRestaurants?location=${encodeURIComponent(state)}`
          );
          const text = await res.text();
          let data;
          try {
            data = JSON.parse(text);
          } catch {
            console.error(`Invalid JSON for ${state}:`, text);
            data = { restaurants: [] };
          }

          allRestaurants[state] = Array.isArray(data.restaurants)
            ? data.restaurants
            : [];
        } catch (err) {
          console.error(`Error fetching restaurants for ${state}:`, err);
          allRestaurants[state] = [];
        }
      }

      setRestaurants(allRestaurants);
      setLoading(false);
    };

    fetchRestaurantsByState();
  }, [assignedRegion]);

  // Initialize Google Maps Autocomplete
  useEffect(() => {
    if (!window.google) return;

    const input = document.getElementById("pac-input");
    if (!input) return;

    const autocomplete = new window.google.maps.places.Autocomplete(input, {
      types: ["(cities)"], // Only cities
      fields: ["address_components", "geometry", "name", "formatted_address"],
    });

    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (!place.address_components) return;

      const city = place.address_components.find((comp) =>
        comp.types.includes("locality")
      )?.long_name;

      setSelectedCity(city || place.name);
    });

    autocompleteRef.current = autocomplete;
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading restaurants...
      </div>
    );

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-blue-700 mb-6 text-center">
        Assigned Restaurants
      </h1>

      {assignedRegion.length === 0 && (
        <p className="text-center text-red-500">No assigned regions found.</p>
      )}

      {/* Google Maps Autocomplete Input */}
      <div className="mb-6 text-center">
        <input
          id="pac-input"
          type="text"
          placeholder="Search City..."
          className="p-2 border rounded w-full max-w-sm"
        />
      </div>

      {assignedRegion.map((state) => {
        const stateRestaurants = restaurants[state] || [];

        // Filter restaurants based on autocomplete selected city
        const filteredRestaurants = selectedCity
          ? stateRestaurants.filter((r) =>
              (r.address || "").toLowerCase().includes(selectedCity.toLowerCase())
            )
          : stateRestaurants;

        return (
          <div key={state} className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              {state} - Restaurants: {filteredRestaurants.length}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-xl shadow hover:shadow-lg transition p-4 flex flex-col justify-between"
                >
                  <h3 className="text-lg font-bold text-gray-800">{r.name}</h3>
                  <p className="text-sm text-gray-500">📍 {r.address}</p>
                  {r.phone && <p className="text-sm text-gray-500">📞 {r.phone}</p>}
                  {r.website && (
                    <a
                      href={r.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      🌐 Website
                    </a>
                  )}
                  {r.rating && <p className="text-sm text-yellow-500">⭐ {r.rating}</p>}
                  {r.opening_hours?.length > 0 && (
                    <div className="text-sm text-gray-500 mt-1">
                      <strong>Hours:</strong>
                      <ul className="list-disc list-inside">
                        {r.opening_hours.map((h, i) => (
                          <li key={i}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-3 flex gap-2">
                    {r.phone && (
                      <a
                        href={`tel:${r.phone}`}
                        className="flex-1 bg-green-500 text-white py-2 rounded text-center hover:bg-green-600 transition"
                      >
                        Call
                      </a>
                    )}
                    <button
                      onClick={() => setSelectedRestaurant(r)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded text-center hover:bg-blue-700 transition"
                    >
                      Visit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {selectedRestaurant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg relative shadow-lg">
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setSelectedRestaurant(null)}
            >
              ✖
            </button>
            <h2 className="text-xl font-semibold mb-4">
              Add Visit - {selectedRestaurant.name}
            </h2>
            <AddVisitForm
              user={user}
              restaurantName={selectedRestaurant.name}
              onSuccess={() => setSelectedRestaurant(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
