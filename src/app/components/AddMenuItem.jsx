"use client";
import { useState } from "react";
import { storage, db } from "../firebase/config";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import * as XLSX from "xlsx";

export default function AddMenuItem({ ownerId }) {
  const [name, setName] = useState("");
  const [nameHi, setNameHi] = useState(""); 
  const [subname, setSubname] = useState("");
  const [subnameHi, setSubnameHi] = useState(""); 
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState(""); // English
  const [categoryHi, setCategoryHi] = useState(""); // 🔥 Hindi Category
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // CSV / Excel Parse
  // -----------------------------
  const parseFile = async (file) => {
    const ext = file.name.split(".").pop().toLowerCase();

    if (ext === "csv") {
      const text = await file.text();
      const lines = text.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim());

      return lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim());
        return Object.fromEntries(headers.map((h, i) => [h, values[i]]));
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      return worksheet;
    } else {
      throw new Error("Unsupported file type. Please upload CSV or Excel file.");
    }
  };

  // -----------------------------
  // Bulk Upload
  // -----------------------------
  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    try {
      const items = await parseFile(file);

      for (const item of items) {
        await addDoc(collection(db, "owners", ownerId, "menu"), {
          name: item.name || "",
          name_hi: item.name_hi || "",
          subname: item.subname || "",
          subname_hi: item.subname_hi || "",
          price: Number(item.price) || 0,
          category: item.category || "",
          category_hi: item.category_hi || "", // 🔥 Hindi category support
          imageUrl: item.imageUrl || "",
          available: true,
          createdAt: serverTimestamp(),
        });
      }

      alert(`${items.length} items uploaded successfully ✅`);
    } catch (err) {
      alert("Upload Failed ❌ " + err.message);
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  // -----------------------------
  // Single Add Item
  // -----------------------------
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
            name_hi: nameHi,
            subname,
            subname_hi: subnameHi,
            price: Number(price),
            category,
            category_hi: categoryHi, // 🔥 Save Hindi category
            imageUrl: url,
            available: true,
            createdAt: serverTimestamp(),
          });

          setName("");
          setNameHi("");
          setSubname("");
          setSubnameHi("");
          setPrice("");
          setCategory("");
          setCategoryHi(""); // reset Hindi category
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-600">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-slate-800 mb-4"></div>
        <p className="text-lg font-medium text-center">
          Please wait, uploading data...
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-8">
      {/* Single Upload */}
      <form
        onSubmit={handleAdd}
        className="bg-gray-50 p-6 rounded-2xl shadow-xl space-y-4"
      >
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Item Name (English)"
          className="w-full border border-gray-300 p-3 rounded-lg"
        />

        <input
          value={nameHi}
          onChange={(e) => setNameHi(e.target.value)}
          placeholder="Item Name (Hindi)"
          className="w-full border border-gray-300 p-3 rounded-lg"
        />

        <input
          value={subname}
          onChange={(e) => setSubname(e.target.value)}
          placeholder="Sub Name (English)"
          className="w-full border border-gray-300 p-3 rounded-lg"
        />

        <input
          value={subnameHi}
          onChange={(e) => setSubnameHi(e.target.value)}
          placeholder="Sub Name (Hindi)"
          className="w-full border border-gray-300 p-3 rounded-lg"
        />

        <input
          required
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          type="number"
          className="w-full border border-gray-300 p-3 rounded-lg"
        />

        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category (English)"
          className="w-full border border-gray-300 p-3 rounded-lg"
        />

        <input
          value={categoryHi}
          onChange={(e) => setCategoryHi(e.target.value)}
          placeholder="Category (Hindi)"
          className="w-full border border-gray-300 p-3 rounded-lg"
        />

        <label className="block border-2 border-dashed border-gray-400 rounded-lg p-4 text-center cursor-pointer">
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
          className="w-full bg-yellow-500 text-white px-4 py-3 rounded-lg hover:bg-yellow-600"
        >
          Add Item
        </button>
      </form>

      {/* Bulk Upload */}
      <div className="bg-white p-6 rounded-2xl shadow-xl">
        <h2 className="text-lg font-semibold mb-3">📂 Bulk Upload</h2>

        <input
          type="file"
          accept=".csv, .xlsx, .xls"
          onChange={handleBulkUpload}
          className="w-full border p-3 rounded-lg cursor-pointer"
        />

        <p className="text-sm text-gray-500 mt-2">
          Supported columns:
          <b>
            {" "}
            name, name_hi, subname, subname_hi, price, category, category_hi,
            imageUrl{" "}
          </b>
        </p>
      </div>
    </div>
  );
}
