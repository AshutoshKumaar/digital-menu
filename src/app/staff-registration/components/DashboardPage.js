
import React from "react";
import RestaurantList from "./RestaurantList";

// const delhiLocation = "28.6139,77.2090";

const DashboardPage = ({earning}) => (
    
    <div>
        <div className="bg-white p-5 rounded-2xl shadow mb-6">
      <h2 className="text-lg font-semibold mb-2">Your Total Earnings</h2>
      <p className="text-4xl font-extrabold text-green-700">₹{earning}</p>
      <p className="text-gray-500 text-sm mt-2">
        ₹10 per visit + commission on successful deal
      </p>
    </div>
    {/* <RestaurantList location={delhiLocation} /> */}
    </div>
  );


export default DashboardPage;