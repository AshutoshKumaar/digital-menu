"use client";
import { useState } from "react";
import { storage, db } from "../firebase/config";
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

export default function AddMenuItem({ ownerId }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select an image");

    setLoading(true);
    try {
      const fname = `owners/${ownerId}/menu/${uuidv4()}`;
      const ref = storageRef(storage, fname);
      const uploadTask = uploadBytesResumable(ref, file);

      uploadTask.on(
        "state_changed",
        () => {},
        (err) => {
          setLoading(false);
          alert(err.message);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          await addDoc(collection(db, "owners", ownerId, "menu"), {
            name,
            price: Number(price),
            category,
            imageUrl: url,
            available: true,
            createdAt: serverTimestamp(),
          });

          setName("");
          setPrice("");
          setCategory("");
          setFile(null);
          setPreview(null);
          alert("Item added successfully ✅");
          setLoading(false);
        }
      );
    } catch (err) {
      setLoading(false);
      alert(err.message);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }
  };

  // Agar loading true hai, toh sirf loading UI return karo
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-600">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-slate-800 mb-4"></div>
        <p className="text-lg font-medium text-center">
          Please wait, we are saving your product on Q/R...
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      <form
        onSubmit={handleAdd}
        className="bg-gray-50 p-6 rounded-2xl shadow-xl space-y-4 transition-transform transform hover:scale-[1.01]"
      >
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item Name"
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-200"
        />
        <input
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-200"
          type="number"
        />
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category"
          className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all duration-200"
        />

        <label className="block border-2 border-dashed border-gray-400 rounded-lg p-4 text-center cursor-pointer hover:border-yellow-400 transition-all duration-200 bg-white">
          {file ? (
            <span className="text-green-600 font-medium">{file.name}</span>
          ) : (
            <span className="text-gray-500">📷 Click to upload image</span>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {preview && (
          <div className="mt-3 flex justify-center">
            <img
              src={preview}
              alt="Preview"
              className="max-h-40 rounded-lg shadow-md border border-gray-200 object-cover"
            />
          </div>
        )}

        <button
          disabled={loading}
          className="w-full bg-yellow-500 text-white px-4 py-3 rounded-lg hover:bg-yellow-600 transition-all duration-200 transform hover:scale-105 font-medium"
        >
          Add Item
        </button>
      </form>
    </div>
  );
}
