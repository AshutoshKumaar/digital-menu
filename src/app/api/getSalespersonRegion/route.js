// /app/api/getSalespersonRegion/route.js
import { NextResponse } from "next/server";
import { db } from "@/app/firebase/config";
import { doc, getDoc } from "firebase/firestore";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");
    console.log("Fetching region for UID:", uid);

    if (!uid) {
      return NextResponse.json({ assignedRegion: [] }, { status: 200 });
    }

    // Fetch from "salespersons" collection
    const userRef = doc(db, "salespersons", uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      return NextResponse.json({ assignedRegion: [] }, { status: 200 });
    }

    const data = snap.data();
    // Wrap string assignedRegion into array if needed
    const assignedRegion = data.assignedRegion
      ? Array.isArray(data.assignedRegion)
        ? data.assignedRegion
        : [data.assignedRegion]
      : [];

    return NextResponse.json({ assignedRegion }, { status: 200 });
  } catch (err) {
    console.error("Error fetching salesperson region:", err);
    return NextResponse.json({ assignedRegion: [] }, { status: 500 });
  }
}
