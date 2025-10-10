"use client";
import React, { useEffect, useState } from "react";

const RestaurantList = ({ location }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      const res = await fetch(`/api/getRestaurants?location=${location}`);
      const data = await res.json();
      setRestaurants(data);
      setLoading(false);
    };

    fetchRestaurants();
  }, [location]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Restaurants Nearby</h1>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : restaurants.length === 0 ? (
        <p className="text-gray-500">No restaurants found.</p>
      ) : (
        <ul className="space-y-3">
          {restaurants.map((r) => (
            <li
              key={r.place_id}
              className="p-3 border rounded-lg shadow hover:shadow-lg transition"
            >
              <h2 className="font-semibold">{r.name}</h2>
              <p className="text-gray-600 text-sm">{r.vicinity}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RestaurantList;
