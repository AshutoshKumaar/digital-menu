"use client";
import { useEffect, useState } from "react";
import { db } from "../firebase/config";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc
} from "firebase/firestore";

export default function MenuList({ ownerId }) {
  const [items, setItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [editData, setEditData] = useState({ name: "", price: "", category: "" });

  useEffect(() => {
    const q = query(
      collection(db, "owners", ownerId, "menu"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) =>
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, [ownerId]);

  const handleDelete = async (id) => {
    if (!confirm("Delete item?")) return;
    await deleteDoc(doc(db, "owners", ownerId, "menu", id));
    alert("Deleted");
  };

  const handleEditClick = (item) => {
    setEditingItem(item.id);
    setEditData({
      name: item.name,
      price: item.price,
      category: item.category || ""
    });
  };

  const handleEditSave = async () => {
    const ref = doc(db, "owners", ownerId, "menu", editingItem);
    await updateDoc(ref, {
      name: editData.name,
      price: Number(editData.price),
      category: editData.category
    });
    setEditingItem(null);
    alert("Updated ✅");
  };

  if (!items.length) return <div className="text-gray-500 text-center text-2xl">Please add your products</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {items.map((it) => (
        <div
          key={it.id}
          className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition duration-200"
        >
          <img
            src={it.imageUrl}
            alt={it.name}
            className="h-40 w-full object-cover"
          />
          <div className="p-4">
            <h3 className="font-semibold text-lg">{it.name}</h3>
            <p className="text-yellow-600 font-medium">₹{it.price}</p>
            <p className="text-sm text-gray-500">{it.category}</p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleEditClick(it)}
                className="flex-1 bg-blue-500 text-white py-1 rounded hover:bg-blue-600 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(it.id)}
                className="flex-1 bg-red-500 text-white py-1 rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-80 shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Edit Item</h2>
            <input
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              placeholder="Item Name"
              className="w-full border p-2 rounded mb-2"
            />
            <input
              value={editData.price}
              onChange={(e) => setEditData({ ...editData, price: e.target.value })}
              placeholder="Price"
              type="number"
              className="w-full border p-2 rounded mb-2"
            />
            <input
              value={editData.category}
              onChange={(e) =>
                setEditData({ ...editData, category: e.target.value })
              }
              placeholder="Category"
              className="w-full border p-2 rounded mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={handleEditSave}
                className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
              >
                Save
              </button>
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
