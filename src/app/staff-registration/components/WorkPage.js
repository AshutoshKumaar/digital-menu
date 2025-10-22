"use client";
import React, { useEffect, useState } from "react";
import { db, auth, storage } from "@/app/firebase/config";
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import {
  Building2,
  CheckCircle2,
  Wallet,
  Camera,
  UploadCloud,
  FileText,
} from "lucide-react";
import { getAuth } from "firebase/auth";


/* --------------------- Main Dashboard --------------------- */
export default function WorkDashboardPage() {
  const [user, setUser] = useState(undefined);
  const [activeTab, setActiveTab] = useState("visit");
  const [approvedEarnings, setApprovedEarnings] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);


  console.log("Logged in user:", user?.uid);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u || null));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) {
      setApprovedEarnings(0);
      setPendingCount(0);
      return;
    }
    // FIX: Changed collection name to "workDetails" (consistent casing)
    const q = query(collection(db, "workDetails"), where("staffId", "==", user.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      let approved = 0;
      let pending = 0;
      snapshot.docs.forEach((d) => {
        const data = d.data();
        if (data.rewardStatus === "approved" && typeof data.calculatedReward === "number") {
          approved += data.calculatedReward;
        } else if (data.rewardStatus === "pending") pending += 1;
      });
      setApprovedEarnings(approved);
      setPendingCount(pending);
    });
    return () => unsub();
  }, [user]);

  if (user === undefined) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="animate-pulse text-blue-600 font-semibold">Loading dashboard...</p>
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 max-w-md w-full text-center">
          <p className="text-gray-700 mb-4">You must be logged in to access the work dashboard.</p>
          <p className="text-sm text-gray-500">Please login and return to submit reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-5">
      {/* Header */}
     

      {/* Tabs */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <TabButton
          active={activeTab === "visit"}
          onClick={() => setActiveTab("visit")}
          icon={<Building2 />}
        >
          Hotel Visit
        </TabButton>
        <TabButton
          active={activeTab === "deal"}
          onClick={() => setActiveTab("deal")}
          icon={<CheckCircle2 />}
        >
          Deal Confirm
        </TabButton>
        <TabButton
          active={activeTab === "overview"}
          onClick={() => setActiveTab("overview")}
          icon={<Wallet />}
        >
          Earnings Overview
        </TabButton>
      </div>

      {/* Panels */}
      <div>
        {activeTab === "visit" && <HotelVisitPanel user={user} />}
        {activeTab === "deal" && <DealConfirmPanel user={user} />}
        {activeTab === "overview" && <EarningsOverview user={user} />}
      </div>
    </div>
  );
}

/* -------------------- Tab Button -------------------- */
function TabButton({ children, active, onClick, icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition ${
        active ? "bg-blue-600 text-white" : "bg-white text-gray-700 border border-gray-200"
      }`}
    >
      {icon}
      <span>{children}</span>
    </button>
  );
}

/* -------------------- Hotel Visit Panel -------------------- */
function HotelVisitPanel({ user }) {
  const initial = {
    hotelName: "",
    ownerName: "",
    contact: "",
    address: "",
    visitedDate: "",
    whatSaid: "",
    interest: "Interested",
    nextMeet: "",
    remarks: "",
  };

  const [form, setForm] = useState(initial);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    setForm((f) => ({
      ...f,
      visitedDate: new Date().toISOString().slice(0, 10),
    }));
  }, []);

  // NEW: Memory cleanup for photo preview
  useEffect(() => {
    // Revoke the old object URL when the component unmounts or photoPreview changes
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  // ✅ Handle Form Input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  // ✅ Handle Camera / File Upload
  const handleCapture = (e) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Revoke the previous URL before creating a new one to manage memory
    if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
    }
    
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));

    // get live GPS
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          }),
        (err) => console.error("Location error:", err),
        { enableHighAccuracy: true }
      );
    }
  };

  // ✅ Upload File to Firebase Storage
  const uploadFileToStorage = (file, pathPrefix = "visits/photos") =>
    new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      const filePath = `${pathPrefix}/${user.uid}/${Date.now()}_${file.name}`;
      
      // FIX: Used 'storage' directly instead of calling getStorage()
      const sRef = storageRef(storage, filePath); 
      const uploadTask = uploadBytesResumable(sRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(Math.round(progress));
        },
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });

  // ✅ Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      "hotelName",
      "ownerName",
      "contact",
      "address",
      "visitedDate",
      "whatSaid",
      "interest",
    ];
    for (let field of requiredFields)
      if (!form[field]) return alert(`Please fill ${field}`);
    if (!photoFile) return alert("Please take a photo first!");
    if (!location) return alert("Please allow location access!");

    setUploading(true);
    try {
      const photoURL = await uploadFileToStorage(photoFile);
      const calculatedReward = 10;

      await addDoc(collection(db, "workDetails"), {
        staffId: user.uid,
        staffEmail: user.email || null,
        type: "visit",
        ...form,
        media: { photoURL },
        location,
        calculatedReward,
        rewardStatus: "pending",
        createdAt: serverTimestamp(),
      });

      alert("✅ Report submitted successfully!");
      setForm(initial);
      setPhotoFile(null);
      setPhotoPreview(null);
      setLocation(null);
      setUploadProgress(0);
    } catch (err) {
      console.error(err);
      alert("❌ Error submitting report: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 max-w-3xl mx-auto">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Building2 /> Hotel Visit Report
      </h2>

      <form className="space-y-3" onSubmit={handleSubmit}>
        {/* Hotel Name */}
        <div>
          <label className="font-semibold text-gray-700">
            Hotel / Restaurant Name *
          </label>
          <input
            name="hotelName"
            value={form.hotelName}
            onChange={handleChange}
            placeholder="Enter hotel or restaurant name"
            className="w-full border rounded-lg p-2 mt-1"
            required
          />
        </div>

        {/* Owner & Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-gray-700">
              Owner / Manager Name *
            </label>
            <input
              name="ownerName"
              value={form.ownerName}
              onChange={handleChange}
              placeholder="Enter owner's name"
              className="w-full border rounded-lg p-2 mt-1"
              required
            />
          </div>
          <div>
            <label className="font-semibold text-gray-700">
              Contact Number *
            </label>
            <input
              name="contact"
              value={form.contact}
              onChange={handleChange}
              placeholder="Enter contact number"
              className="w-full border rounded-lg p-2 mt-1"
              required
            />
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="font-semibold text-gray-700">Hotel Address *</label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            placeholder="Enter hotel address"
            className="w-full border rounded-lg p-2 mt-1"
            required
          />
        </div>

        {/* Visit Date + Camera */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-gray-700">
              Visited Date *
            </label>
            <input
              type="date"
              name="visitedDate"
              value={form.visitedDate}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mt-1"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-gray-700">
              Capture Photo & Location *
            </label>
            <input
              id="photo-input"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCapture}
              className="hidden"
            />
            <label
              htmlFor="photo-input"
              className="cursor-pointer bg-blue-600 text-white px-3 py-2 mt-1 rounded-lg inline-flex items-center gap-2 hover:bg-blue-700"
            >
              <Camera /> Take Photo
            </label>
          </div>
        </div>

        {/* Location Info */}
        {location && (
          <div className="text-sm text-gray-600 mt-1 p-2 border rounded-lg">
            📍 Lat: {location.latitude.toFixed(5)}, Lng:{" "}
            {location.longitude.toFixed(5)}
          </div>
        )}

        {/* Preview */}
        {photoPreview && (
          <div className="w-32 h-24 rounded-md overflow-hidden border mt-2">
            <img
              src={photoPreview}
              alt="preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Progress Bar */}
        {uploading && uploadProgress > 0 && (
          <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
            <div
              className="bg-green-600 h-3 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {/* What Said */}
        <div>
          <label className="font-semibold text-gray-700">
            What Customer Said *
          </label>
          <textarea
            name="whatSaid"
            value={form.whatSaid}
            onChange={handleChange}
            placeholder="Notes from customer conversation"
            className="w-full border rounded-lg p-2 mt-1"
            required
          />
        </div>

        {/* Interest + Next Meet */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="font-semibold text-gray-700">
              Customer Interest *
            </label>
            <select
              name="interest"
              value={form.interest}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mt-1"
              required
            >
              <option>Interested</option>
              <option>Maybe Later</option>
              <option>Not Interested</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-gray-700">
              Next Meeting Date
            </label>
            <input
              type="date"
              name="nextMeet"
              value={form.nextMeet}
              onChange={handleChange}
              className="w-full border rounded-lg p-2 mt-1"
            />
          </div>
        </div>

        {/* Remarks */}
        <div>
          <label className="font-semibold text-gray-700">
            Additional Remarks
          </label>
          <textarea
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
            placeholder="Any additional comments or details"
            className="w-full border rounded-lg p-2 mt-1"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            type="submit"
            disabled={uploading}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            {uploading ? "Submitting..." : "Submit Report"}
          </button>
          <button
            type="button"
            onClick={() => {
              setForm(initial);
              setPhotoFile(null);
              // Clean up on reset
              if (photoPreview) URL.revokeObjectURL(photoPreview); 
              setPhotoPreview(null);
              setLocation(null);
            }}
            className="px-4 py-2 rounded-lg border"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}



/* -------------------- Deal Confirm Panel -------------------- */

function DealConfirmPanel({ user }) {
  const initial = {
    hotelName: "",
    ownerName: "",
    contact: "",
    dealAmount: "",
    remarks: "",
  };
  const [form, setForm] = useState(initial);
  const [paymentFile, setPaymentFile] = useState(null);
  const [paymentPreview, setPaymentPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [commission, setCommission] = useState(0);
  
  // NEW: Memory cleanup for payment preview
  useEffect(() => {
    return () => {
      if (paymentPreview) {
        URL.revokeObjectURL(paymentPreview);
      }
    };
  }, [paymentPreview]);

  // 🔹 Handle Form Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));

    // 🔹 Auto set commission based on deal amount
    if (name === "dealAmount") {
      if (value === "199") setCommission(39);
      else if (value === "399") setCommission(99);
      else if (value === "799") setCommission(199);
      else setCommission(0);
    }
  };

  // 🔹 Handle File Selection
  const handleFileCapture = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Revoke the previous URL before creating a new one
      if (paymentPreview) {
        URL.revokeObjectURL(paymentPreview);
      }
      setPaymentFile(file);
      setPaymentPreview(URL.createObjectURL(file));
    }
  };

  // 🔹 Upload Image to Firebase Storage
  const uploadFileToStorage = (file, pathPrefix = "deals/payment") =>
    new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      const filename = `${pathPrefix}/${user.uid}/${Date.now()}_${file.name}`;
      const sRef = storageRef(storage, filename);
      const uploadTask = uploadBytesResumable(sRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) =>
          setUploadProgress(
            Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          ),
        (error) => reject(error),
        async () => resolve(await getDownloadURL(uploadTask.snapshot.ref))
      );
    });

  // 🔹 Submit Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = ["hotelName", "ownerName", "contact", "dealAmount"];
    for (let field of requiredFields)
      if (!form[field]) return alert(`Please fill ${field}`);
    if (!paymentFile) return alert("Payment proof is required");

    setUploading(true);
    try {
      const paymentURL = await uploadFileToStorage(paymentFile);
      const calculatedReward = commission;

      await addDoc(collection(db, "workDetails"), {
        staffId: user.uid,
        staffEmail: user.email || null,
        type: "deal",
        ...form,
        commission: calculatedReward,
        media: { paymentURL },
        rewardStatus: "pending",
        createdAt: serverTimestamp(),
      });

      setForm(initial);
      setPaymentFile(null);
      // Clean up after successful submission
      if (paymentPreview) URL.revokeObjectURL(paymentPreview);
      setPaymentPreview(null);
      setCommission(0);
      alert("✅ Deal submitted successfully (Pending approval).");
    } catch (err) {
      console.error(err);
      alert("Error submitting deal.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 max-w-3xl mx-auto">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <CheckCircle2 /> Deal Confirmation Form
      </h2>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Hotel Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hotel / Restaurant Name *
          </label>
          <input
            name="hotelName"
            value={form.hotelName}
            onChange={handleChange}
            placeholder="e.g. The Royal Inn"
            className="w-full border rounded-lg p-2"
            required
          />
        </div>

        {/* Owner and Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner / Manager Name *
            </label>
            <input
              name="ownerName"
              value={form.ownerName}
              onChange={handleChange}
              placeholder="e.g. Mr. Sharma"
              className="w-full border rounded-lg p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Number *
            </label>
            <input
              name="contact"
              value={form.contact}
              onChange={handleChange}
              placeholder="e.g. 9876543210"
              className="w-full border rounded-lg p-2"
              required
            />
          </div>
        </div>

        {/* Deal Amount Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Deal Amount (₹) *
          </label>
          <select
            name="dealAmount"
            value={form.dealAmount}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          >
            <option value="">Select deal amount</option>
            <option value="199">₹199</option>
            <option value="399">₹399</option>
            <option value="799">₹799</option>
          </select>
        </div>

        {/* Auto-calculated commission */}
        {commission > 0 && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 font-medium">
            You will earn ₹{commission} commission for this deal (after owner approval).
          </div>
        )}

        {/* Upload Proof */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload Payment Proof *
          </label>
          <label className="cursor-pointer bg-white border p-2 rounded-lg flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileCapture}
              className="hidden"
              required
            />
            <UploadCloud /> Select Image
          </label>
          {paymentPreview && (
            <div className="w-28 h-20 rounded-md overflow-hidden border mt-2">
              <img
                src={paymentPreview}
                alt="preview"
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Remarks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Additional Remarks
          </label>
          <textarea
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
            placeholder="Write any notes or comments here..."
            className="w-full border rounded-lg p-2"
          />
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            type="submit"
            disabled={uploading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            {uploading ? "Submitting..." : "Submit Deal"}
          </button>
          <button
            type="button"
            onClick={() => {
              setForm(initial);
              setPaymentFile(null);
              // Clean up on reset
              if (paymentPreview) URL.revokeObjectURL(paymentPreview);
              setPaymentPreview(null);
              setCommission(0);
            }}
            className="px-4 py-2 rounded-lg border"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}


/* -------------------- Earnings Overview -------------------- */
function EarningsOverview({ user }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 🧠 1️⃣ Only run if user is logged in
    if (!user) return;

    // 🧠 2️⃣ Create a Firestore query for the logged-in staff
    const q = query(
      collection(db, "workDetails"),
      where("staffId", "==", user.uid)
    );

    // 🧠 3️⃣ Real-time snapshot listener
    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReports(data);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching reports:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    // 🧠 4️⃣ Clean up listener when component unmounts
    return () => unsub();
  }, [user]);
  
  console.log("Earnings reports:", reports);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;
  if (error)
    return (
      <p className="text-center text-red-500">
        Error fetching data: {error}
      </p>
    );

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Earnings Overview</h2>

      {reports.length === 0 ? (
        <p>No work reports found for your account.</p>
      ) : (
        <ul className="space-y-3">
          {reports.map((report) => (
            <li
              key={report.id}
              className="border rounded-lg p-3 shadow-sm bg-white"
            >
              <p>
                <strong>Project:</strong> {report.hotelName || "N/A"}
              </p>
               <p>
                <strong>Money:</strong> {report.rewardStatus || "N/A"}
              </p>
               <p>
                <strong>Type :</strong> {report.type || "N/A"}
              </p>
              <p>
                <strong>Date:</strong>{report.visitedDate || "N/A"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}