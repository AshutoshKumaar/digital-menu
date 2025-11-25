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
  const [nameHinEng, setNameHinEng] = useState("");

  const [subname, setSubname] = useState("");
  const [subnameHi, setSubnameHi] = useState("");
  const [subnameHinEng, setSubnameHinEng] = useState("");

  const [price, setPrice] = useState("");

  const [category, setCategory] = useState("");
  const [categoryHi, setCategoryHi] = useState("");
  const [categoryHinEng, setCategoryHinEng] = useState("");

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false); // 🔥 FULL PAGE LOADING

  // ----------------------------------------
  // CSV / Excel FILE PARSING
  // ----------------------------------------
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
      return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    }
  };

  // ----------------------------------------
  // BULK UPLOAD
  // ----------------------------------------
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
          name_hineng: item.name_hineng || "",

          subname: item.subname || "",
          subname_hi: item.subname_hi || "",
          subname_hineng: item.subname_hineng || "",

          price: Number(item.price) || 0,

          category: item.category || "",
          category_hi: item.category_hi || "",
          category_hineng: item.category_hineng || "",

          imageUrl: item.imageUrl || "",
          available: true,
          createdAt: serverTimestamp(),
        });
      }

      alert(`${items.length} items uploaded successfully!`);
    } catch (err) {
      alert("Upload Failed ❌ " + err.message);
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  // ----------------------------------------
  // SINGLE ITEM ADD
  // ----------------------------------------
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
            name_hineng: nameHinEng,

            subname,
            subname_hi: subnameHi,
            subname_hineng: subnameHinEng,

            price: Number(price),

            category,
            category_hi: categoryHi,
            category_hineng: categoryHinEng,

            imageUrl: url,
            available: true,
            createdAt: serverTimestamp(),
          });

          // Reset form
          setName("");
          setNameHi("");
          setNameHinEng("");

          setSubname("");
          setSubnameHi("");
          setSubnameHinEng("");

          setPrice("");

          setCategory("");
          setCategoryHi("");
          setCategoryHinEng("");

          setFile(null);
          setPreview(null);

          alert("Item added successfully! 🎉");
          setLoading(false);
        }
      );
    } catch (err) {
      setLoading(false);
      alert(err.message);
    }
  };

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  };

  // ----------------------------------------
  // FULL SCREEN LOADER
  // ----------------------------------------
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="h-14 w-14 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-5 text-xl font-medium text-gray-600">
          Saving your data...
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-10">
      {/* FORM */}
      <form
        onSubmit={handleAdd}
        className="bg-gray-100 p-6 rounded-2xl shadow-xl space-y-6"
      >
        {/* 2 Column Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* NAME ENGLISH */}
          <div>
            <label className="font-semibold text-gray-700">Item Name (English)</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border p-3 rounded-lg"
              placeholder="Paneer Tikka"
            />
          </div>

          {/* NAME HINDI */}
          <div>
            <label className="font-semibold text-gray-700">Item Name (Hindi)</label>
            <input
              value={nameHi}
              onChange={(e) => setNameHi(e.target.value)}
              className="w-full border p-3 rounded-lg"
              placeholder="पनीर टिक्का"
            />
          </div>

          {/* HINGLISH */}
          <div className="md:col-span-2">
            <label className="font-semibold text-gray-700">Item Name (Hin-English)</label>
            <input
              value={nameHinEng}
              onChange={(e) => setNameHinEng(e.target.value)}
              className="w-full border p-3 rounded-lg"
              placeholder="Paneer Tikka (Hindi-English mix)"
            />
          </div>

          {/* SUBNAME ENGLISH */}
          <div>
            <label className="font-semibold text-gray-700">Sub Name (English)</label>
            <input
              value={subname}
              onChange={(e) => setSubname(e.target.value)}
              className="w-full border p-3 rounded-lg"
              placeholder="Spicy Starter"
            />
          </div>

          {/* SUBNAME HINDI */}
          <div>
            <label className="font-semibold text-gray-700">Sub Name (Hindi)</label>
            <input
              value={subnameHi}
              onChange={(e) => setSubnameHi(e.target.value)}
              className="w-full border p-3 rounded-lg"
              placeholder="मसालेदार स्टार्टर"
            />
          </div>

          {/* SUBNAME HINGLISH */}
          <div className="md:col-span-2">
            <label className="font-semibold text-gray-700">Sub Name (Hin-English)</label>
            <input
              value={subnameHinEng}
              onChange={(e) => setSubnameHinEng(e.target.value)}
              className="w-full border p-3 rounded-lg"
              placeholder="Masaledar Starter"
            />
          </div>

          {/* PRICE */}
          <div className="md:col-span-2">
            <label className="font-semibold text-gray-700">Price</label>
            <input
              type="number"
              value={price}
              required
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border p-3 rounded-lg"
            />
          </div>

          {/* CATEGORY ENGLISH */}
          <div>
            <label className="font-semibold text-gray-700">Category (English)</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border p-3 rounded-lg"
              placeholder="Starters"
            />
          </div>

          {/* CATEGORY HINDI */}
          <div>
            <label className="font-semibold text-gray-700">Category (Hindi)</label>
            <input
              value={categoryHi}
              onChange={(e) => setCategoryHi(e.target.value)}
              className="w-full border p-3 rounded-lg"
              placeholder="स्टार्टर्स"
            />
          </div>

          {/* CATEGORY HINGLISH */}
          <div className="md:col-span-2">
            <label className="font-semibold text-gray-700">Category (Hin-English)</label>
            <input
              value={categoryHinEng}
              onChange={(e) => setCategoryHinEng(e.target.value)}
              className="w-full border p-3 rounded-lg"
              placeholder="Starters (Hin-English)"
            />
          </div>
        </div>

        {/* IMAGE UPLOAD BOX */}
        <label className="block border-2 border-dashed border-gray-400 rounded-lg p-4 text-center cursor-pointer hover:border-yellow-500 hover:bg-yellow-50 transition-all active:scale-95">
          {file ? (
            <span className="text-green-600 font-medium">{file.name}</span>
          ) : (
            <span className="text-gray-500">📷 Upload Image</span>
          )}
          <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
        </label>

        {preview && (
          <img
            src={preview}
            className="max-h-40 rounded-lg mx-auto object-cover mt-3 shadow-md"
          />
        )}

        {/* SUBMIT BUTTON */}
        <button
          disabled={loading}
          className={`w-full cursor-pointer py-3 rounded-lg font-semibold flex items-center justify-center transition-all 
            ${loading ? "bg-yellow-400 cursor-not-allowed" : "bg-yellow-600 hover:bg-yellow-700 active:scale-95"}`}
        >
          {loading ? (
            <div className="flex items-center gap-3">
              <span className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Saving...
            </div>
          ) : (
            "Add Item"
          )}
        </button>
      </form>

      {/* BULK UPLOAD */}
      <div className="bg-white p-6 rounded-2xl shadow-xl">
        <h2 className="text-lg font-semibold mb-2">📂 Bulk Upload</h2>

        <input
          type="file"
          accept=".csv, .xlsx, .xls"
          onChange={handleBulkUpload}
          className="w-full border p-3 rounded-lg cursor-pointer"
        />

        <p className="text-sm text-gray-700 mt-2">
          Supported Columns:
          <b> name, name_hi, name_hineng, subname, subname_hi, subname_hineng, price, category, category_hi, category_hineng, imageUrl </b>
        </p>
      </div>
    </div>
  );
}
