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
  Loader2
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

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleCapture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));

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

  const uploadFileToStorage = (file, pathPrefix = "visits/photos") =>
    new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      const filePath = `${pathPrefix}/${user.uid}/${Date.now()}_${file.name}`;
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
    <div className="relative">
      {/* 🌀 Loading Overlay */}
      {uploading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
            <p className="font-semibold text-gray-700">
              Submitting Report...
            </p>
            <div className="w-48 bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-sm text-gray-500">
              {uploadProgress}% completed
            </span>
          </div>
        </div>
      )}

      {/* 🧾 Form Card */}
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 max-w-3xl mx-auto mt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Building2 className="text-blue-600" /> Hotel Visit Report
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
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500"
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
                className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500"
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
                className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="font-semibold text-gray-700">
              Hotel Address *
            </label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Enter hotel address"
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Visit Date + Capture */}
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
                className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500"
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
                className="cursor-pointer bg-blue-600 text-white px-4 py-2 mt-1 rounded-lg inline-flex items-center gap-2 hover:bg-blue-700 transition"
              >
                <Camera size={18} /> Take Photo
              </label>
            </div>
          </div>

          {location && (
            <div className="text-sm text-gray-600 mt-1 p-2 border rounded-lg">
              📍 Lat: {location.latitude.toFixed(5)}, Lng:{" "}
              {location.longitude.toFixed(5)}
            </div>
          )}

          {photoPreview && (
            <div className="w-32 h-24 rounded-md overflow-hidden border mt-2">
              <img
                src={photoPreview}
                alt="preview"
                className="w-full h-full object-cover"
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
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500"
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
                className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500"
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
                className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500"
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
              className="w-full border rounded-lg p-2 mt-1 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              disabled={uploading}
              className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-semibold transition"
            >
              {uploading ? "Submitting..." : "Submit Report"}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(initial);
                if (photoPreview) URL.revokeObjectURL(photoPreview);
                setPhotoFile(null);
                setPhotoPreview(null);
                setLocation(null);
              }}
              className="px-5 py-2 rounded-lg border hover:bg-gray-100 transition"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



/* -------------------- Deal Confirm Panel -------------------- */

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
  const [calculatedReward, setCalculatedReward] = useState(0);

  useEffect(() => {
    return () => {
      if (paymentPreview) URL.revokeObjectURL(paymentPreview);
    };
  }, [paymentPreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    if (name === "dealAmount") {
      let reward = 0;
      if (value === "199") reward = 39;
      else if (value === "399") reward = 99;
      else if (value === "799") reward = 199;
      setCalculatedReward(reward);
    }
  };

  const handleFileCapture = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (paymentPreview) URL.revokeObjectURL(paymentPreview);
      setPaymentFile(file);
      setPaymentPreview(URL.createObjectURL(file));
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = ["hotelName", "ownerName", "contact", "dealAmount"];
    for (let field of requiredFields)
      if (!form[field]) return alert(`Please fill ${field}`);
    if (!paymentFile) return alert("Payment proof is required");
    if (calculatedReward <= 0)
      return alert("Please select a valid deal amount.");

    setUploading(true);
    try {
      const paymentURL = await uploadFileToStorage(paymentFile);
      await addDoc(collection(db, "workDetails"), {
        staffId: user.uid,
        staffEmail: user.email || null,
        type: "deal",
        ...form,
        calculatedReward,
        media: { paymentURL },
        rewardStatus: "pending",
        createdAt: serverTimestamp(),
      });

      setForm(initial);
      setPaymentFile(null);
      if (paymentPreview) URL.revokeObjectURL(paymentPreview);
      setPaymentPreview(null);
      setCalculatedReward(0);
      alert("✅ Deal submitted successfully (Pending approval).");
    } catch (err) {
      console.error(err);
      alert("Error submitting deal.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      {/* 🔹 Full-Screen Loading Overlay */}
      {uploading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <Loader2 className="animate-spin text-blue-600 w-12 h-12 mb-4" />
            <p className="text-blue-700 font-semibold text-lg mb-2">
              Uploading your deal...
            </p>
            <div className="w-64 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">{uploadProgress}%</p>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-blue-50 via-white to-blue-100 p-8 rounded-2xl shadow-2xl border border-blue-100 max-w-2xl mx-auto transition-all duration-300 hover:shadow-blue-200/70">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-3xl font-extrabold text-blue-800 flex items-center justify-center gap-2">
            <CheckCircle2 className="text-blue-600 w-7 h-7" />
            Deal Confirmation
          </h2>
          <p className="text-gray-600 mt-2 text-sm">
            Complete the form below to submit a confirmed deal.
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Hotel Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Hotel / Restaurant Name <span className="text-red-500">*</span>
            </label>
            <input
              name="hotelName"
              value={form.hotelName}
              onChange={handleChange}
              placeholder="e.g. The Royal Inn"
              className="w-full border border-gray-300 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition duration-200 bg-white shadow-sm"
              required
            />
          </div>

          {/* Owner and Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Owner / Manager Name <span className="text-red-500">*</span>
              </label>
              <input
                name="ownerName"
                value={form.ownerName}
                onChange={handleChange}
                placeholder="e.g. Mr. Sharma"
                className="w-full border border-gray-300 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white shadow-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                name="contact"
                value={form.contact}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                className="w-full border border-gray-300 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white shadow-sm"
                required
              />
            </div>
          </div>

          {/* Deal Amount */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Deal Amount (₹) <span className="text-red-500">*</span>
            </label>
            <select
              name="dealAmount"
              value={form.dealAmount}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-xl p-3.5 bg-white appearance-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 shadow-sm"
              required
            >
              <option value="">Select deal amount</option>
              <option value="199">₹199</option>
              <option value="399">₹399</option>
              <option value="799">₹799</option>
            </select>
          </div>

          {/* Reward */}
          {calculatedReward > 0 && (
            <div className="p-4 rounded-xl bg-green-50 border border-green-300 text-green-800 font-semibold text-sm flex items-center gap-2 shadow-sm">
              <Wallet className="w-5 h-5 text-green-600" />
              Commission: ₹{calculatedReward} (Pending approval)
            </div>
          )}

          {/* Upload Proof */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Upload Payment Proof <span className="text-red-500">*</span>
            </label>
            <label className="cursor-pointer bg-blue-100 hover:bg-blue-200 border border-blue-300 text-blue-700 font-medium p-3 rounded-xl flex items-center justify-center gap-2 transition duration-200 shadow-sm">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileCapture}
                className="hidden"
                required
              />
              <UploadCloud className="w-5 h-5" />
              {paymentFile
                ? `File Selected: ${paymentFile.name.substring(0, 15)}...`
                : "Select Payment Image"}
            </label>

            {paymentPreview && (
              <div className="mt-4 border border-gray-200 rounded-xl p-2 inline-block bg-white shadow-sm">
                <img
                  src={paymentPreview}
                  alt="Payment Proof"
                  className="w-36 h-28 object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Additional Remarks
            </label>
            <textarea
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              placeholder="Write any notes or comments here..."
              className="w-full border border-gray-300 rounded-xl p-3.5 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white shadow-sm"
              rows="3"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3.5 rounded-xl font-bold text-lg shadow-md shadow-blue-500/30 transition duration-300 disabled:bg-gray-400 disabled:shadow-none"
            >
              {uploading ? "Submitting..." : "Submit"}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(initial);
                setPaymentFile(null);
                if (paymentPreview) URL.revokeObjectURL(paymentPreview);
                setPaymentPreview(null);
                setCalculatedReward(0);
              }}
              className="px-5 py-3.5 rounded-xl border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 shadow-sm transition duration-200"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </>
  );
}


/* -------------------- Earnings Overview -------------------- */
function EarningsOverview({ user }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "workDetails"), where("staffId", "==", user.uid));

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

    return () => unsub();
  }, [user]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-40 text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading reports...
      </div>
    );

  if (error)
    return <p className="text-center text-red-500">Error: {error}</p>;

  if (reports.length === 0)
    return (
      <div className="text-center text-gray-500 py-10">
        No work reports found for your account.
      </div>
    );

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Earnings Overview</h2>

      {/* Responsive Table */}
      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="min-w-full text-sm text-gray-700 border-collapse">
          <thead className="bg-green-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Hotel / Project</th>
              <th className="px-4 py-3 text-left font-semibold">Reward Status</th>
              <th className="px-4 py-3 text-left font-semibold">Type</th>
              <th className="px-4 py-3 text-left font-semibold">Visited Date</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report, i) => (
              <tr
                key={report.id}
                className={`border-t hover:bg-green-50 transition ${
                  i % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <td className="px-4 py-3 font-medium">{report.hotelName || "N/A"}</td>
                <td className="px-4 py-3">{report.rewardStatus || "N/A"}</td>
                <td className="px-4 py-3">{report.type || "N/A"}</td>
                <td className="px-4 py-3">
                  {report.visitedDate
                    ? new Date(report.visitedDate).toLocaleDateString("en-IN")
                    : "N/A"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


