"use client";
import { useState } from "react";
import { db, storage } from "@/app/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AddVisitForm({ user }) {
  const [restaurantName, setRestaurantName] = useState("");
  const [plan, setPlan] = useState("");
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Get current GPS location
  const getCurrentLocation = () =>
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => reject(err),
        { enableHighAccuracy: true }
      );
    });

  const handleAddVisit = async (e) => {
  e.preventDefault();
  if (!user) {
    alert("Please wait... user not loaded yet!");
    return;
  }

  setLoading(true);

  try {
    // 1️⃣ Get location
    const location = await getCurrentLocation();
    console.log("Current Location:", location);

    // 2️⃣ Upload photo to Firebase Storage
    const photoRef = ref(storage, `visits/${user.uid}_${Date.now()}`);
    await uploadBytes(photoRef, photo);
    const photoURL = await getDownloadURL(photoRef);

    // 3️⃣ Calculate commission
    let commission = 0;
    if (plan === "basic") commission = 50;
    else if (plan === "premium") commission = 100;
    else if (plan === "enterprise") commission = 200;
    const totalEarning = 10 + commission;

    // 4️⃣ Save to Firestore
    await addDoc(collection(db, "workDetails"), {
      staffId: user.uid,
      restaurant: restaurantName,
      plan,
      earning: totalEarning,
      photoURL,
      location,
      timestamp: serverTimestamp(),
    });

    alert("✅ Visit added successfully!");
    setRestaurantName("");
    setPlan("");
    setPhoto(null);
  } catch (err) {
    console.error("Error adding visit:", err);
    alert("❌ Failed to add visit. Try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    <form
      onSubmit={handleAddVisit}
      className="bg-white p-5 rounded-2xl shadow-md"
    >
      <h2 className="text-lg font-semibold mb-4">Add Visit</h2>

      <input
        type="text"
        placeholder="Restaurant Name"
        className="border p-2 w-full mb-3 rounded"
        value={restaurantName}
        onChange={(e) => setRestaurantName(e.target.value)}
        required
      />

      <select
        className="border p-2 w-full mb-3 rounded"
        value={plan}
        onChange={(e) => setPlan(e.target.value)}
        required
      >
        <option value="">Select Plan</option>
        <option value="basic">Basic (₹50)</option>
        <option value="premium">Premium (₹100)</option>
        <option value="enterprise">Enterprise (₹200)</option>
      </select>

      <input
        type="file"
        accept="image/*"
        className="border p-2 w-full mb-3 rounded"
        onChange={(e) => setPhoto(e.target.files[0])}
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded w-full"
      >
        {loading ? "Submitting..." : "Submit Visit"}
      </button>
    </form>
  );
}
