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
    const q = query(collection(db, "workdetails"), where("staffId", "==", user.uid));
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
      {/* <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Work Dashboard</h1>
          <p className="text-sm text-gray-600">
            Hello{" "}
            <span className="font-medium text-blue-600">
              {user.displayName || user.email.split("@")[0]}
            </span>{" "}
            — share reports to earn.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Approved Earnings</p>
          <p className="text-2xl font-bold text-blue-700">
            ₹{approvedEarnings.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">{pendingCount} pending report(s)</p>
        </div>
      </div> */}

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
    setForm((f) => ({ ...f, visitedDate: new Date().toISOString().slice(0, 10) }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleCapture = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        (err) => console.error("Location error:", err),
        { enableHighAccuracy: true }
      );
    }
  };

  const uploadFileToStorage = (file, pathPrefix = "work") =>
    new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      const filename = `${pathPrefix}/${user.uid}/${Date.now()}_${file.name}`;
      const sRef = storageRef(storage, filename);
      const uploadTask = uploadBytesResumable(sRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => setUploadProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)),
        (error) => reject(error),
        async () => resolve(await getDownloadURL(uploadTask.snapshot.ref))
      );
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = ["hotelName", "ownerName", "contact", "address", "visitedDate", "whatSaid", "interest"];
    for (let field of requiredFields) if (!form[field]) return alert(`Please fill ${field}`);
    if (!photoFile) return alert("Photo is required");
    if (!location) return alert("Location is required");

    setUploading(true);
    try {
      const photoURL = await uploadFileToStorage(photoFile, "visits/photos");
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
      setForm(initial);
      setPhotoFile(null);
      setPhotoPreview(null);
      setLocation(null);
      setUploadProgress(0);
      alert("Report submitted successfully.");
    } catch (err) {
      console.error(err);
      alert("Error submitting report.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 max-w-3xl mx-auto">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Building2 /> Hotel Visit Report
      </h2>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <input
          name="hotelName"
          value={form.hotelName}
          onChange={handleChange}
          placeholder="Hotel / Restaurant Name *"
          className="w-full border rounded-lg p-2"
          required
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            name="ownerName"
            value={form.ownerName}
            onChange={handleChange}
            placeholder="Owner / Manager Name *"
            className="w-full border rounded-lg p-2"
            required
          />
          <input
            name="contact"
            value={form.contact}
            onChange={handleChange}
            placeholder="Contact Number *"
            className="w-full border rounded-lg p-2"
            required
          />
        </div>
        <textarea
          name="address"
          value={form.address}
          onChange={handleChange}
          placeholder="Address or Google Maps link *"
          className="w-full border rounded-lg p-2"
          required
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="date"
            name="visitedDate"
            value={form.visitedDate}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          />
          <label className="cursor-pointer bg-white border p-2 rounded-lg flex items-center gap-2">
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleCapture}
              className="hidden"
              required
            />
            <Camera />
            Take Photo & Capture Location
          </label>
        </div>

        {location && (
          <div className="text-sm text-gray-600 mt-1 p-2 border rounded-lg">
            Lat: {location.latitude.toFixed(5)}, Lng: {location.longitude.toFixed(5)}
          </div>
        )}

        <textarea
          name="whatSaid"
          value={form.whatSaid}
          onChange={handleChange}
          placeholder="What customer said (notes) *"
          className="w-full border rounded-lg p-2"
          required
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <select
            name="interest"
            value={form.interest}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
            required
          >
            <option>Interested</option>
            <option>Maybe Later</option>
            <option>Not Interested</option>
          </select>
          <input
            type="date"
            name="nextMeet"
            value={form.nextMeet}
            onChange={handleChange}
            className="w-full border rounded-lg p-2"
          />
        </div>
        <textarea
          name="remarks"
          value={form.remarks}
          onChange={handleChange}
          placeholder="Additional remarks"
          className="w-full border rounded-lg p-2"
        />

        {photoPreview && (
          <div className="w-28 h-20 rounded-md overflow-hidden border mt-2">
            <img src={photoPreview} alt="preview" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex gap-2 mt-3">
          <button
            type="submit"
            disabled={uploading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            {uploading ? "Submitting..." : "Submit Visit Report"}
          </button>
          <button
            type="button"
            onClick={() => {
              setForm(initial);
              setPhotoFile(null);
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
    ownerApproval: "Pending",
    remarks: "",
  };
  const [form, setForm] = useState(initial);
  const [paymentFile, setPaymentFile] = useState(null);
  const [paymentPreview, setPaymentPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleFileCapture = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentFile(file);
      setPaymentPreview(URL.createObjectURL(file));
    }
  };

  const uploadFileToStorage = (file, pathPrefix = "deal") =>
    new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      const filename = `${pathPrefix}/${user.uid}/${Date.now()}_${file.name}`;
      const sRef = storageRef(storage, filename);
      const uploadTask = uploadBytesResumable(sRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => setUploadProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)),
        (error) => reject(error),
        async () => resolve(await getDownloadURL(uploadTask.snapshot.ref))
      );
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = ["hotelName", "ownerName", "contact", "dealAmount"];
    for (let field of requiredFields) if (!form[field]) return alert(`Please fill ${field}`);
    if (!paymentFile) return alert("Payment proof is required");

    setUploading(true);
    try {
      const paymentURL = await uploadFileToStorage(paymentFile, "deals/payment");
      const calculatedReward = parseFloat(form.dealAmount) || 0;

      await addDoc(collection(db, "workDetails"), {
        staffId: user.uid,
        staffEmail: user.email || null,
        type: "deal",
        ...form,
        media: { paymentURL },
        calculatedReward,
        rewardStatus: "pending",
        createdAt: serverTimestamp(),
      });

      setForm(initial);
      setPaymentFile(null);
      setPaymentPreview(null);
      alert("Deal submitted successfully.");
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
        <CheckCircle2 /> Deal Confirmation
      </h2>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <input
          name="hotelName"
          value={form.hotelName}
          onChange={handleChange}
          placeholder="Hotel / Restaurant Name *"
          className="w-full border rounded-lg p-2"
          required
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            name="ownerName"
            value={form.ownerName}
            onChange={handleChange}
            placeholder="Owner / Manager Name *"
            className="w-full border rounded-lg p-2"
            required
          />
          <input
            name="contact"
            value={form.contact}
            onChange={handleChange}
            placeholder="Contact Number *"
            className="w-full border rounded-lg p-2"
            required
          />
        </div>
        <input
          name="dealAmount"
          value={form.dealAmount}
          onChange={handleChange}
          placeholder="Deal Amount (₹) *"
          className="w-full border rounded-lg p-2"
          type="number"
          required
        />

        <label className="cursor-pointer bg-white border p-2 rounded-lg flex items-center gap-2">
          <input type="file" accept="image/*" onChange={handleFileCapture} className="hidden" required />
          <UploadCloud /> Upload Payment Proof
        </label>

        {paymentPreview && (
          <div className="w-28 h-20 rounded-md overflow-hidden border mt-2">
            <img src={paymentPreview} alt="preview" className="w-full h-full object-cover" />
          </div>
        )}

        <textarea
          name="remarks"
          value={form.remarks}
          onChange={handleChange}
          placeholder="Additional remarks"
          className="w-full border rounded-lg p-2"
        />

        <div className="flex gap-2 mt-3">
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
              setPaymentPreview(null);
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
                <strong>Visit Type -</strong> {report.type || "N/A"}
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


