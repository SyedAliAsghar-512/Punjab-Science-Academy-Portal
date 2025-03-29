import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRegisterMutation } from "../../redux/api/authApi";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import MetaData from "../layouts/MetaData";
import AdminLayout from "../layouts/AdminLayout";

const Register = () => {
  const [selectedClass, setSelectedClass] = useState("");
  const [register, { isLoading, error, data, isSuccess }] = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);

  const { isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: "",
    emai: "",
    classs: "",
  });

  const [color, setColor] = useState("");
  const [textColor, setTextColor] = useState("");
  const savedMode = localStorage.getItem("darkMode") === "true";

  useEffect(() => {
    if (savedMode) {
      setColor("#0e1011");
      setTextColor("white");
    } else {
      setColor("#f5f5f5");
      setTextColor("black");
    }
  }, [savedMode]);

  const { name,email, classs } = user;

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message);
    }

    if (isSuccess) {
      toast.success("Enrolled");
    }
  }, [error, isSuccess]);

  const submitHandler = (e) => {
    e.preventDefault();

    const signUpData = {
      name,
      email,
      classs
    };

    register(signUpData);
  };

  const onChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  return (
    <>
      <MetaData title="Register - Shopholic" />
      <AdminLayout>
      <div className="row wrapper" style={{ padding: "10px", border: "1px solid black" }}>
        <div className="col-10 col-lg-5" style={{marginLeft: "20px", minWidth: "100%"}}>
          <form onSubmit={submitHandler}>
            <h2 className="mb-4">Enroll Student</h2>

            <div className="mb-3">
              <label htmlFor="name_field" className="form-label">
                Name
              </label>
              <input
                type="text"
                id="name_field"
                className="form-control"
                name="name"
                value={name}
                onChange={onChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="name_field" className="form-label">
                E-mail
              </label>
              <input
                type="text"
                id="name_field"
                className="form-control"
                name="email"
                value={email}
                onChange={onChange}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="class_field" className="form-label">
                Class
              </label>
              <select
  id="class_field"
  className="form-control"
  name="classs"
  value={classs}
  onChange={onChange}
>
  <option value="">Select Class</option>
  {[...Array(12).keys()].map((num) => (
    <option key={num + 1} value={`Class ${num + 1}`}>{`Class ${num + 1}`}</option>
  ))}
  <option value="UG">UG</option>
</select>

            </div>

            <button
              id="register_button"
              type="submit"
              className="btn w-100 py-2"
              disabled={isLoading}
              style={{
                backgroundColor: "transparent",
                color: "black",
                border: "1px grey solid",
              }}
            >
              {isLoading ? "Creating..." : "Register"}
            </button>
          </form>
        </div>
      </div>
      </AdminLayout>
    </>
  );
};

export default Register;
