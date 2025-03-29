import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useGetDashboardStatsQuery } from "../../redux/api/authApi.js";
import toast from "react-hot-toast";
import Loader from "../layouts/loader.jsx";
import MetaData from "../layouts/MetaData.jsx";

const Dashboard = () => {
    // State to store the selected date (Month & Year)
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Extract month & year
    const month = 3; // Convert to 1-based indexing
    const year = 2025;

    // Fetch dashboard stats with month & year as query params
    const { data, isLoading, error, refetch } = useGetDashboardStatsQuery({ month, year });

    useEffect(() => {
        if (error) {
            toast.error(error?.data?.message);
        }
    }, [error]);

    // Handle date change
    const handleDateChange = (date) => {
        setSelectedDate(date);
        refetch(); // Fetch new data
    };

    if (isLoading) return <Loader />;

    return (
        <>
            <MetaData title="Dashboard - Shopholic" />
            <AdminLayout>
                <div className="p-6 bg-gray-100 min-h-screen">
                    {/* Dashboard Stats */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="p-4 bg-white shadow rounded-lg">
                            <h2 className="text-lg font-semibold">Total Fees Collected</h2>
                            <p className="text-xl">Rs {data?.totalFeesCollected?.reduce((acc, fee) => acc + (fee?.totalFees || 0), 0)}</p>
                        </div>
                    </div>

                    {/* Monthly Fees Breakdown */}
                    <div className="mt-6 p-4 bg-white shadow rounded-lg">
                        <h2 className="text-lg font-semibold mb-3">Fees Collected Per Month</h2>
                        <ul className="list-disc pl-5">
                            {Array.isArray(data?.totalFeesCollected) && data.totalFeesCollected.length > 0 ? (
                                data.totalFeesCollected.map((item, index) => (
                                    <li key={index} className="text-lg">
                                        <strong>{item?._id?.month} {item?._id?.year}:</strong> Rs {item?.totalFees || 0}
                                    </li>
                                ))
                            ) : (
                                <li className="text-gray-500">No fee records available.</li>
                            )}
                        </ul>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
};

export default Dashboard;
