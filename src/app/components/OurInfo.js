"use client";
import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { db, auth } from "@/app/firebase/config";

function OurInfo({ ownerId }) {
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOwners() {
      try {
        // ✅ Correct reference to the specific owner document
        const ownerRef = doc(db, "owners", ownerId);
        const ownerSnap = await getDoc(ownerRef);

        if (ownerSnap.exists()) {
          setOwners([{ id: ownerSnap.id, ...ownerSnap.data() }]);
        } else {
          setOwners([]);
        }
      } catch (error) {
        console.error("Error fetching owners:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOwners();
  }, [ownerId]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert("Logged out successfully");
    } catch (error) {
      alert("Logout failed: " + error.message);
    }
  };

  // QR Image Download function
  const downloadQR = (url, restaurantName, ownerId) => {
    fetch(url)
      .then(res => res.blob())
      .then(blob => {
        const urlBlob = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = urlBlob;
        // Filename example: "RestaurantName_ownerId_qr.png"
        a.download = `${restaurantName || "qr"}_${ownerId}_qr.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(urlBlob);
      })
      .catch(err => {
        alert("Failed to download QR code: " + err.message);
      });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center text-slate-600">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-slate-800 mb-4"></div>
        <p className="text-lg font-medium">Wait For Your Info.......</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md font-sans">
      <h2 className="text-2xl font-semibold mb-4 border-b pb-2">Our Information</h2>

      {owners.length === 0 && <p>No owner information found.</p>}

      {owners.map((owner) => (
        <div
          key={owner.id}
          className="mb-6 p-4 border rounded-lg shadow-sm hover:shadow-lg transition-shadow"
        >
          <p>
            <span className="font-semibold">Restaurant Name:</span> {owner.restaurantName}
          </p>
          <p>
            <span className="font-semibold">Owner Email:</span> {owner.ownerEmail}
          </p>
          {owner.qrUrl && (
            <div className="mt-3 flex flex-col items-center">
              <img
                src={owner.qrUrl}
                alt="QR Code"
                className="w-32 h-32 object-contain"
              />
              <button
                onClick={() => downloadQR(owner.qrUrl, owner.restaurantName, owner.id)}
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-4 rounded"
              >
                Download QR
              </button>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={handleLogout}
        className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-md transition"
      >
        Log Out
      </button>
    </div>
  );
}

export default OurInfo;
