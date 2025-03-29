import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Loader from "../layouts/loader";
import { MDBDataTable } from "mdbreact";
import { useGetStudentsQuery, useUpdateFeeStatusMutation } from "../../redux/api/orderApi";
import AdminLayout from "../layouts/AdminLayout";
import MetaData from "../layouts/MetaData";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/free-solid-svg-icons";

const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const currentMonth = months[new Date().getMonth()];

const ListFees = () => {
    const { data, isLoading, error } = useGetStudentsQuery();
    const [updateFeeStatus] = useUpdateFeeStatusMutation();
    const [filter, setFilter] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [feesData, setFeesData] = useState([]);

    useEffect(() => {
        if (error) toast.error(error?.data?.message);
    }, [error]);

    if (isLoading) return <Loader />;

    const handleShowModal = (student) => {
        setSelectedStudent(student);
        setFeesData([...student.fees.history]);
        setShowModal(true);
    };

    const handleFeeChange = (index, field, value) => {
        const updatedFees = [...feesData];
        updatedFees[index] = { ...updatedFees[index], [field]: field === "isPaid" ? value.target.checked : value.target.value };
        setFeesData(updatedFees);
    };

    const handleAddFee = () => {
        if (feesData.some(fee => fee.month === currentMonth && fee.year === currentYear)) {
            toast.error("Fee entry for this month and year already exists.");
            return;
        }
        const lastAmount = feesData.length > 0 ? feesData[feesData.length - 1].amount : 1000;
        setFeesData([...feesData, { month: currentMonth, year: currentYear, amount: lastAmount, isPaid: false }]);
    };

    const handleUpdateFee = async () => {
        try {
            await updateFeeStatus({
                id: selectedStudent._id,
                history: feesData
            }).unwrap();
            toast.success("Fee updated successfully");
        } catch (error) {
            toast.error(error?.data?.message || "Failed to update fees");
        }
        setShowModal(false);
    };

    const filteredStudents = data?.students?.filter(student => {
        if (filter === "paid") return student.fees.isPaid;
        if (filter === "unpaid") return !student.fees.isPaid;
        return true;
    });

    const printUnpaidStudents = () => {
        const printDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(printDate.getDate() + 10);

        const printableContent = `Punjab Science Academy\n\nPrinted Date: ${printDate.toDateString()}\nDue Date: ${dueDate.toDateString()}\n\nDefaulters List\n` +
            data?.students?.filter(student => !student.fees.isPaid)
                .map((student, index) => {
                    const totalDue = student.fees.history.reduce((sum, entry) => sum + (entry.isPaid ? 0 : entry.amount), 0);
                    return `${index + 1}. Name: ${student.name} - Fee Due: Rs. ${totalDue}`;
                }).join("\n");

        const printWindow = window.open("", "", "width=600,height=600");
        printWindow.document.write(`<pre>${printableContent}</pre>`);
        printWindow.document.close();
        printWindow.print();
    };

    const setFees = () => ({
        columns: [
            { label: "Name", field: "name", sort: "asc" },
            { label: "Class", field: "class", sort: "asc" },
            { label: "Total Due", field: "amount", sort: "asc" },
            { label: "Payment Status", field: "status", sort: "asc" },
            { label: "Actions", field: "actions", sort: "asc" },
        ],
        rows: filteredStudents?.map(student => ({
            name: student.name,
            class: student.classs,
            amount: `Rs. ${student.fees.history.reduce((sum, entry) => sum + (entry.isPaid ? 0 : entry.amount), 0)}`,
            status: (
                <button className={`btn ${student.fees.isPaid ? "btn-success" : "btn-warning"} btn-sm`}>
                    {student.fees.isPaid ? "Paid" : "Remaining"}
                </button>
            ),
            actions: (
                <button className="btn btn-primary btn-sm" onClick={() => handleShowModal(student)}>
                    Manage Fees
                </button>
            ),
        })),
    });

    return (
        <>
            <MetaData title="Fee Management" />
            <AdminLayout>
                <div className="d-flex justify-content-between my-3">
                    <div>
                        <button className="btn btn-primary me-2" onClick={() => setFilter("all")}>All</button>
                        <button className="btn btn-success me-2" onClick={() => setFilter("paid")}>Paid</button>
                        <button className="btn btn-warning" onClick={() => setFilter("unpaid")}>Unpaid</button>
                    </div>
                    <button className="btn btn-danger" onClick={printUnpaidStudents}>
                        <FontAwesomeIcon icon={faPrint} /> Defaulters List
                    </button>
                </div>
                <MDBDataTable data={setFees()} className="px-3" bordered striped hover />
            </AdminLayout>

            {showModal && (
                <div className="alert alert-warning position-fixed top-50 start-50 translate-middle shadow-lg p-4 rounded" style={{ zIndex: 1050 }}>
                    <h4>Manage Fees - {selectedStudent?.name}</h4>
                    {feesData.map((fee, index) => (
                        <div key={index} className="mb-3">
                            <label>Month:</label>
                            <select value={fee.month} onChange={(e) => handleFeeChange(index, "month", e)}>
                                {months.map((month, idx) => (
                                    <option key={idx} value={month}>{month}</option>
                                ))}
                            </select>
                            <label>Year:</label>
                            <input type="number" value={fee.year} onChange={(e) => handleFeeChange(index, "year", e)} />
                            <label>Fee Amount:</label>
                            <input type="number" value={fee.amount} onChange={(e) => handleFeeChange(index, "amount", e)} />
                            <label>
                                <input type="checkbox" checked={fee.isPaid} onChange={(e) => handleFeeChange(index, "isPaid", e)} /> Paid
                            </label>
                        </div>
                    ))}
                    {!feesData.some(fee => fee.month === currentMonth && fee.year === currentYear) && (
                        <button className="btn btn-secondary me-2" onClick={handleAddFee}>Add Fee</button>
                    )}
                    <button className="btn btn-success me-2" onClick={handleUpdateFee}>Update Fees</button>
                    <button className="btn btn-danger" onClick={() => setShowModal(false)}>Close</button>
                </div>
            )}
        </>
    );
};

export default ListFees;