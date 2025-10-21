import React from 'react'
import Image from 'next/image'
import Razorpay from "@/app/images/razorpay-icon.png";
import PhonePe from "@/app/images/phonepe-icon.png";
import Paytm from "@/app/images/paytm-icon.png";
import GPay from "@/app/images/google-pay-acceptance-mark-icon.png";
import BHIM from "@/app/images/bhim-app-icon.png"
function Paymentpartner() {
  return (
    <div>
       <section className="py-16 bg-white border-t border-gray-200">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-8">
                  Our Trusted Payment Partners
                </h2>
                <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
                  We’ve partnered with India’s most reliable and secure payment
                  providers to ensure smooth and safe transactions for every business.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 items-center justify-center">
                  <Image src={Razorpay} alt="Razorpay" className="w-30 h-auto mx-auto" />
                  <Image src={PhonePe} alt="PhonePe" className="w-30 h-auto mx-auto" />
                  <Image src={Paytm} alt="Paytm" className="w-30 h-auto mx-auto" />
                  <Image src={GPay} alt="Google Pay" className="w-30 h-auto mx-auto" />
                  <Image src={BHIM} alt="BHIM UPI" className="w-30 h-auto mx-auto" />
                </div>
              </div>
            </section>
    </div>
  )
}

export default Paymentpartner
