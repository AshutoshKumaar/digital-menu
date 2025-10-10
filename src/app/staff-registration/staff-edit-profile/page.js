"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/app/firebase/config";
import { doc, getDoc, setDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import {
  Loader2,
  Upload,
  Edit2,
  Check,
  XCircle,
  X,
  ArrowLeft,
} from "lucide-react";

export default function EditProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    position: "",
    city: "",
    photoURL: "",
  });
  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Fetch user info in real-time
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        const userRef = doc(db, "salesperson", u.uid);
        const unsub = onSnapshot(
          userRef,
          (snap) => {
            if (snap.exists()) {
              setFormData(snap.data());
              setOriginalData(snap.data());
            }
            setLoading(false);
          },
          (err) => {
            console.error("Snapshot error:", err);
            setLoading(false);
          }
        );
        return () => unsub();
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => unsubAuth();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Upload profile photo
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    setSaving(true);
    try {
      const storageRef = ref(storage, `profilePhotos/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      const userRef = doc(db, "salesperson", user.uid);
      const snap = await getDoc(userRef);

      if (snap.exists()) {
        await updateDoc(userRef, { ...formData, photoURL: url });
      } else {
        await setDoc(userRef, { ...formData, photoURL: url });
      }

      setFormData((prev) => ({ ...prev, photoURL: url }));
      setShowModal(true);
    } catch (error) {
      console.error("Photo upload error:", error);
      alert("Failed to upload photo. Check Firestore rules!");
    }
    setSaving(false);
  };

  // Save profile changes
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const userRef = doc(db, "salesperson", user.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        await updateDoc(userRef, formData);
      } else {
        await setDoc(userRef, formData);
      }
      setOriginalData(formData);
      setEditMode(false);
      setShowModal(true);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile! Check Firestore rules.");
    }
    setSaving(false);
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData(originalData);
    setEditMode(false);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        <Loader2 className="animate-spin mr-2" /> Loading profile...
      </div>
    );

  if (!user)
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        Please log in to edit your profile.
      </div>
    );

  return (
    <>
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 px-4">
        <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-2xl transition hover:shadow-blue-200">
          <div className="flex items-center mb-8">
            <button
              onClick={() => router.push("/staff-registration/staff-dashboard")}
              className="flex items-center text-white p-3 rounded-3xl hover:text-blue-700 transition bg-blue-400"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Profile
            </button>
          </div>

          <h1 className="text-3xl font-bold mb-8 text-center text-blue-700">
            Edit Your Profile
          </h1>

          {/* Profile Photo */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <img
                src={"/default-avatar.jpg"}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-lg transition-transform group-hover:scale-105"
              />
              {editMode && (
                <label className="absolute bottom-1 right-1 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700 transition">
                  <Upload className="text-white w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-3">
              {editMode ? "Click icon to update photo" : ""}
            </p>
          </div>

          {/* Input Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {["fullName", "phone", "position", "city"].map((field) => (
              <div key={field}>
                <label className="text-gray-700 block mb-1 font-semibold capitalize">
                  {field === "fullName" ? "Full Name" : field}
                </label>
                <input
                  type="text"
                  name={field}
                  value={formData[field] || ""}
                  onChange={handleChange}
                  disabled={!editMode || saving}
                  className={`border border-gray-300 p-3 w-full rounded-xl focus:ring-2 focus:ring-blue-400 outline-none transition ${
                    !editMode
                      ? "bg-gray-100 cursor-not-allowed"
                      : "bg-white hover:border-blue-400"
                  }`}
                  placeholder={`Enter your ${field}`}
                />
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-8">
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-medium flex justify-center items-center mr-3"
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>

                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition font-medium flex justify-center items-center"
                >
                  <XCircle className="mr-2 w-5 h-5 text-gray-600" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition font-medium flex justify-center items-center"
              >
                <Edit2 className="mr-2 w-5 h-5" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center w-[90%] max-w-md animate-fadeIn">
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-red-500 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-col items-center">
              <Check className="w-12 h-12 text-green-500 mb-3" />
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Profile Updated
              </h2>
              <p className="text-gray-500">
                Your profile has been updated successfully.
              </p>
            </div>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => router.push("/staff-registration/staff-dashboard")}
                className="bg-green-600 text-white py-2 px-5 rounded-xl hover:bg-green-700 transition"
              >
                Back to Profile
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-200 text-gray-800 py-2 px-5 rounded-xl hover:bg-gray-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
