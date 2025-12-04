"use client";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { storage, db } from "../firebase/config";
import { ref as storageRef, uploadString, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, getDoc } from "firebase/firestore";

export default function GenerateQR({ ownerId }) {
  const [loading, setLoading] = useState(false);
  const [qrUrl, setQrUrl] = useState(null);

  useEffect(() => {
    if (ownerId) {
      checkExistingQR();
    }
  }, [ownerId]);

  // Check if QR already exists in Firestore
  const checkExistingQR = async () => {
    setLoading(true);
    try {
      const ownerDoc = await getDoc(doc(db, "owners", ownerId));
      if (ownerDoc.exists()) {
        const data = ownerDoc.data();
        if (data.qrUrl) {
          setQrUrl(data.qrUrl);
        }
      }
    } catch (err) {
      alert("Error fetching QR info: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateQR = async () => {
    setLoading(true);
    try {
      const url = `https://digitalbharatmenu.vercel.app/restaurant/${ownerId}`;
      const dataUrl = await QRCode.toDataURL(url, { width: 400, margin: 1 });

      // Upload to Firebase Storage
      const path = `owners/${ownerId}/qr/qr.png`;
      const ref = storageRef(storage, path);
      await uploadString(ref, dataUrl, "data_url");
      const downloadUrl = await getDownloadURL(ref);

      // Save QR URL to Firestore
      await updateDoc(doc(db, "owners", ownerId), { qrUrl: downloadUrl });

      // Update state to show QR
      setQrUrl(downloadUrl);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center mt-4">
      <h3 className="text-lg font-semibold mb-2">Scan to View Menu</h3>

      {loading && <div className="flex flex-col items-center text-slate-600">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-slate-800 mb-4"></div>
          <p className="text-lg font-medium">Your QR in Progress.......</p></div> }

      {!loading && !qrUrl && (
        <button
          onClick={generateQR}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded"
        >
          Generate QR
        </button>
      )}

      {qrUrl && (
        <img
          src={qrUrl}
          alt="QR Code"
          className="border p-2 bg-white rounded shadow mt-3"
          width={200}
          height={200}
        />
      )}
    </div>
  );
}
