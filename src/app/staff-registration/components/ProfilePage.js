"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  LogOut,
  MapPin,
  Phone,
  Briefcase,
  Mail,
  PhoneCall,
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import Image from "next/image";
import { FaWhatsapp, FaInstagram, FaFacebook } from "react-icons/fa";
import CouchImg from '../../images/sid.jpeg';

const ProfilePage = () => {
  const router = useRouter();
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaffData = async () => {
      const user = auth.currentUser;
      if (!user) {
        setStaff(null);
        setLoading(false);
        return;
      }
      try {
        const userRef = doc(db, "salespersons", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) setStaff(snap.data());
        else setStaff(null);
      } catch (error) {
        console.error("Error fetching staff details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStaffData();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/staff-registration/staff-login"); // redirect after logout
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 text-gray-600">
        Loading staff details...
      </div>
    );

  if (!staff)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 text-red-500">
        No staff details found.
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-100 py-10 px-4 flex flex-col items-center space-y-10">

      {/* Profile Card */}
      <div className="bg-white shadow-xl rounded-3xl overflow-hidden max-w-5xl w-full flex flex-col md:flex-row transition hover:shadow-2xl hover:shadow-blue-200">

        {/* Left Section */}
        <div className="md:w-1/3 bg-gradient-to-br from-blue-600 to-blue-700 flex flex-col items-center justify-center text-white p-10 relative">
          <div className="relative w-40 h-40 mb-20">
            <Image
              src={"/default-avatar.jpg"}
              alt="Profile"
              width={160}
              height={160}
              className="rounded-full object-cover border-4 border-white shadow-lg"
              onError={(e) => (e.currentTarget.src = "/default-avatar.jpg")}
            />
          </div>
          <h2 className="text-2xl font-bold mb-1">
            {staff.fullName || "Staff Name"}
          </h2>
          <p className="text-blue-100 text-sm">
            {staff.position || "Employee"}
          </p>
          <div className="absolute bottom-5 text-xs text-blue-200">
            Employee ID: {staff.uid || "N/A"}
          </div>
        </div>

        {/* Right Section */}
        <div className="md:w-2/3 p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-2">
              Employee Details
            </h3>
            <div className="space-y-4">
              <div className="flex items-center text-gray-700">
                <MapPin className="w-5 h-5 mr-3 text-blue-600" />
                <span>{staff.district || "Not Provided"}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Phone className="w-5 h-5 mr-3 text-blue-600" />
                <span>{staff.phone || "Not Provided"}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Mail className="w-5 h-5 mr-3 text-blue-600" />
                <span>{auth.currentUser?.email || "No email"}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <Briefcase className="w-5 h-5 mr-3 text-blue-600" />
                <span>{staff.department || "Sales Department"}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link href="staff-edit-profile" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2.5 rounded-full hover:bg-blue-700 transition font-medium flex justify-center items-center">
                Edit Profile
              </button>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full sm:w-auto bg-red-100 text-red-600 font-semibold px-6 py-2.5 rounded-full hover:bg-red-200 transition flex justify-center items-center"
            >
              <LogOut className="inline-block w-5 h-5 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Trainer Section */}
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl overflow-hidden transition hover:shadow-2xl hover:shadow-blue-200">
        {/* Background */}
        <div className="relative w-full h-64 md:h-80">
          <Image
            src={CouchImg}
            alt="Trainer Background"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <h2 className="text-3xl md:text-4xl text-white font-bold text-center px-4 drop-shadow-lg">
              Meet Your Expert Trainer
            </h2>
          </div>
        </div>

        {/* Trainer Content */}
        <div className="p-6 md:p-10 flex flex-col md:flex-row items-start gap-8">
          {/* Trainer Image */}
          <div className="relative w-full md:w-1/3 h-64 md:h-80 rounded-xl overflow-hidden shadow-lg group">
            <Image
              src={CouchImg}
              alt="Trainer"
              fill
              className="object-cover rounded-xl transform group-hover:scale-105 transition duration-500"
            />
          </div>

          {/* Trainer Info */}
          <div className="flex-1 text-gray-800 space-y-4">
           <div>
             <h3 className="text-2xl font-bold text-blue-800">
              Guru Sharma 
            </h3>
            <p className="text-[12px] text-yellow-700 font-bold">Your Personal coach</p>
           </div>
            <p className="text-gray-700 text-sm md:text-base leading-relaxed">
              Guru Sharma is a seasoned sales trainer with over 4 years of
              experience in empowering sales teams across the country. His training
              methods focus on practical customer engagement and consistent growth.
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 text-sm md:text-base">
              <li>Menu Sales Mastery</li>
              <li>Boost Conversion Rates</li>
              <li>Lead to Loyal Customer Training</li>
              <li>Weekly Performance Mentorship</li>
            </ul>

            {/* Social Icons */}
            <div className="flex items-center gap-5 pt-4">
              <a
                href="https://wa.me/917061362739"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition transform hover:scale-110"
              >
                <FaWhatsapp size={22} />
              </a>
              <a
                href="tel:+917061362739"
                className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition transform hover:scale-110"
              >
                <PhoneCall size={22} />
              </a>
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-pink-500 hover:bg-pink-600 text-white p-3 rounded-full shadow-lg transition transform hover:scale-110"
              >
                <FaInstagram size={22} />
              </a>
              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-700 hover:bg-blue-800 text-white p-3 rounded-full shadow-lg transition transform hover:scale-110"
              >
                <FaFacebook size={22} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
