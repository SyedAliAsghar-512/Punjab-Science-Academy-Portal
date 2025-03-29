import React, { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import { useNavigate, useParams } from "react-router-dom";
import { useGetUserDetailsQuery, useUpdateUserMutation } from "../../redux/api/userApi";
import toast from "react-hot-toast";
import MetaData from "../layouts/MetaData";

const UpdateUser = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [classs, setClasss] = useState("");
    const [feeAmount, setFeeAmount] = useState(0);
    const [isFeePaid, setIsFeePaid] = useState(false);

    const navigate = useNavigate();
    const params = useParams();

    const { data } = useGetUserDetailsQuery(params?.id);
    const [updateUser, { error, isSuccess }] = useUpdateUserMutation();

    useEffect(() => {
        if (data?.user) {
            setName(data.user.name);
            setEmail(data.user.email);
            setRole(data.user.role);
            setClasss(data.user.classs || "");
            setFeeAmount(data.user.fees?.amount || 0);
            setIsFeePaid(data.user.fees?.isPaid || false);
        }
    }, [data]);

    useEffect(() => {
        if (error) {
            toast.error(error?.data?.message);
        }
        if (isSuccess) {
            toast.success("User Updated");
            navigate("/admin/users");
        }
    }, [error, isSuccess]);

    const submitHandler = (e) => {
        e.preventDefault();

        const userData = {
            name,
            classs,
        };

        updateUser({ id: params?.id, body: userData });
    };

    return (
        <>
            <MetaData title="Update User - Shopholic" />
            <AdminLayout>
                <div className="row wrapper">
                    <div className="col-10 col-lg-8">
                        <form className="shadow-lg" onSubmit={submitHandler}>
                            <h2 className="mb-4">Update Student</h2>

                            <div className="mb-3">
                                <label htmlFor="name_field" className="form-label">Name</label>
                                <input
                                    type="text"
                                    id="name_field"
                                    className="form-control"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>


                            <div className="mb-3">
                                <label htmlFor="class_field" className="form-label">Class</label>
                                <select
                                    id="class_field"
                                    className="form-select"
                                    value={classs}
                                    onChange={(e) => setClasss(e.target.value)}
                                >
                                    <option value="">Select Class</option>
                                    {[...Array(12).keys()].map((num) => (
                                        <option key={num + 1} value={`Class ${num + 1}`}>{`Class ${num + 1}`}</option>
                                    ))}
                                    <option value="UG">UG</option>
                                </select>
                            </div>

                            <button type="submit" className="btn update-btn w-100 py-2">
                                Update
                            </button>
                        </form>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
};

export default UpdateUser;
