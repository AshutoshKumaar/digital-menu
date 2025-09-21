"use client";
import { useState, useEffect } from "react";
import { auth, db } from "@/app/firebase/config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, collection, addDoc } from "firebase/firestore";
import PaymentSection from "./PaymentSection";

export default function OrderModal({ ownerId, selectedItem, onClose }) {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [orderType, setOrderType] = useState("inside");
  const [tableNumber, setTableNumber] = useState("");
  const [address, setAddress] = useState("");
  const [distance, setDistance] = useState("1-3");
  const [quantity, setQuantity] = useState(""); // 👈 default blank
  const [loading, setLoading] = useState(false);
  const [deliveryCharge, setDeliveryCharge] = useState(30);
  const [totalPrice, setTotalPrice] = useState(selectedItem ? selectedItem.price : 0);
  const [ownerName, setOwnerName] = useState("");

  // Track logged-in user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (u) {
        setUser(u);
        setEmail(u.email);

        const userDocRef = doc(db, "users", u.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setFullName(data.fullName || "");
          setMobile(data.mobile || "");
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch owner name
  useEffect(() => {
    async function fetchOwner() {
      const snap = await getDoc(doc(db, "owners", ownerId));
      if (snap.exists()) {
        setOwnerName(snap.data().restaurantName || "Restaurant");
      }
    }
    fetchOwner();
  }, [ownerId]);

  // Calculate delivery charge & total
  useEffect(() => {
    const qty = quantity ? parseInt(quantity) : 0;
    const itemTotal = selectedItem ? selectedItem.price * qty : 0;
    let charge = 0;
    if (orderType === "outside") {
      if (distance === "1-3") charge = 30;
      else if (distance === "3-6") charge = 60;
      else if (distance === "6-9") charge = 90;
      else if (distance === "9+") charge = 120;
    }
    setDeliveryCharge(charge);
    setTotalPrice(itemTotal + charge);
  }, [quantity, distance, selectedItem, orderType]);

  const placeOrder = async () => {
    if (!fullName || !mobile) {
      alert("Please fill all fields");
      return;
    }

    if (!user && (!email || !password)) {
      alert("Please fill email and password");
      return;
    }

    if (orderType === "inside" && !tableNumber) {
      alert("Please enter table number");
      return;
    }

    if (orderType === "outside" && !address) {
      alert("Please enter your address");
      return;
    }

    if (!quantity || quantity < 1) {
      alert("Please enter valid quantity");
      return;
    }

    setLoading(true);

    try {
      let userCred;
      if (!user) {
        try {
          userCred = await createUserWithEmailAndPassword(auth, email, password);
        } catch (err) {
          if (err.code === "auth/email-already-in-use") {
            userCred = await signInWithEmailAndPassword(auth, email, password);
          } else {
            throw err;
          }
        }
      } else {
        userCred = { user };
      }

      const uid = userCred.user.uid;
      const userDocRef = doc(db, "users", uid);
      const userSnap = await getDoc(userDocRef);

      const billData = {
        createdAt: new Date(),
        ownerId: ownerId,
        orderDetails: {
          items: [
            {
              id: selectedItem.id,
              name: selectedItem.name,
              price: selectedItem.price,
              category: selectedItem.category || "",
              quantity,
              totalPrice: selectedItem.price * quantity,
            },
          ],
          subtotal: selectedItem.price * quantity,
          deliveryCharge: orderType === "outside" ? deliveryCharge : 0,
          total: totalPrice,
        },
        orderType,
        tableNumber: orderType === "inside" ? tableNumber : null,
        address: orderType === "outside" ? address : null,
        distance: orderType === "outside" ? distance : null,
        status: "pending",
        userId: uid,
        fullName: fullName,
        mobile: mobile,
      };

      // 1. Order को 'orders' collection mein save karo
      await addDoc(collection(db, "orders"), billData);

      // 2. User के 'bills' array को update karo
      if (userSnap.exists()) {
        const userData = userSnap.data();
        await updateDoc(userDocRef, {
          bills: [...(userData.bills || []), billData],
          fullName,
          mobile,
        });
      } else {
        await setDoc(userDocRef, {
          fullName,
          mobile,
          email,
          uid,
          bills: [billData],
        });
      }

      alert("Order placed successfully!");
      onClose();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to place order");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl text-black space-y-4 relative max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-2">Place Your Order</h2>

        {selectedItem && (
          <div className="mb-4 p-3 border border-slate-500 rounded shadow-sm">
            <p className="text-lg font-semibold">{selectedItem.name}</p>
            <p className="text-yellow-400 font-bold">₹{selectedItem.price}</p>
            <p className="text-sm text-black">{selectedItem.category}</p>
          </div>
        )}

        <input
          type="number"
          min={1}
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="border p-2 w-full rounded text-black"
        />

        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="border p-2 w-full rounded text-black"
         
        />
        <input
          type="text"
          placeholder="Mobile Number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          className="border p-2 w-full rounded text-black"
         
        />

        {!user && (
          <>
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 w-full rounded text-black"
            />
            <input
              type="password"
              placeholder="Enter New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 w-full rounded text-black"
            />
          </>
        )}
        <div>
          <PaymentSection amount={totalPrice} />
        </div>

        <div className="flex gap-6 items-center">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="orderType"
              value="inside"
              checked={orderType === "inside"}
              onChange={() => setOrderType("inside")}
              className="accent-blue-500"
            />
            Inside
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="orderType"
              value="outside"
              checked={orderType === "outside"}
              onChange={() => setOrderType("outside")}
              className="accent-blue-500"
            />
            Outside
          </label>
        </div>

        {orderType === "inside" && (
          <input
            type="text"
            placeholder="Table Number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="border p-2 w-full rounded text-black"
          />
        )}

        {orderType === "outside" && (
          <>
            <input
              type="text"
              placeholder="Full Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="border p-2 w-full rounded text-black"
            />
            <select
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="border p-2 w-full rounded text-black mt-2"
            >
              <option value="1-3">1-3 km</option>
              <option value="3-6">3-6 km</option>
              <option value="6-9">6-9 km</option>
              <option value="9+">9+ km</option>
            </select>
          </>
        )}

        <div className="border-t border-gray-300 pt-2 mt-2 space-y-1">
          <p>Item Total: ₹{selectedItem && quantity ? selectedItem.price * quantity : 0}</p>
          {orderType === "outside" && <p>Delivery Charge: ₹{deliveryCharge}</p>}
          <p className="font-bold">Total: ₹{totalPrice}</p>
        </div>

        <div className="flex gap-3 mt-2">
          <button
            onClick={placeOrder}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 transition-colors text-white px-4 py-2 rounded w-full font-semibold"
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="bg-gray-400 hover:bg-gray-500 transition-colors text-white px-4 py-2 rounded w-full font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* 🔥 Full Screen Loader Overlay */}
      {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-[9999]">
          <div className="bg-white text-black px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-semibold">Placing order at 🍴 {ownerName}...</span>
          </div>
        </div>
      )}
    </div>
  );
}
