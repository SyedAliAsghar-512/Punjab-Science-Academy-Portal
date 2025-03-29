import React, { useEffect } from "react";
import toast from "react-hot-toast";
import Loader from "../layouts/loader";
import { MDBDataTable } from "mdbreact";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faTrash } from "@fortawesome/free-solid-svg-icons";
import AdminLayout from "../layouts/AdminLayout";
import { useDeleteUserMutation, useGetAdminUsersQuery } from "../../redux/api/userApi";
import MetaData from "../layouts/MetaData";

const ListUsers = () => {
  const { data, isLoading, error } = useGetAdminUsersQuery();
  const [deleteUser, { error: deleteError, isLoading: isErrorLoading, isSuccess }] = useDeleteUserMutation();

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message);
    }
    if (deleteError) {
      toast.error(deleteError?.data?.message);
    }
    if (isSuccess) {
      toast.success("User Deleted");
    }
  }, [error, deleteError, isSuccess]);

  if (isLoading) return <Loader />;

  const deleteUserHandler = (id) => {
    deleteUser(id);
  };

  const setUsers = () => {
    const users = {
      columns: [
        {
          label: "ID",
          field: "id",
          sort: "asc",
        },
        {
          label: "Name",
          field: "name",
          sort: "asc",
        },
        {
          label: "Role",
          field: "role",
          sort: "asc",
        },
        {
          label: "Actions",
          field: "actions",
          sort: "asc",
        },
      ],
      rows: [],
    };

    data?.users?.forEach((user) => {
      if (user?.role === "user") {
        users.rows.push({
          id: user._id,
          name: user?.name,
          role: "Student",
          actions: (
            <>
              <Link to={`/admin/users/${user?._id}`} className="btn btn-outline-primary">
                <FontAwesomeIcon icon={faPencil} fontSize="30px" />
              </Link>

              <button
                className="btn btn-outline-danger ms-2"
                onClick={() => deleteUserHandler(user?._id)}
                disabled={isErrorLoading}
              >
                <FontAwesomeIcon icon={faTrash} fontSize="30px" />
              </button>
            </>
          ),
        });
      }
    });

    return users;
  };

  // Filtering users with role "user"
  const userCount = data?.users?.filter(user => user.role === "user").length || 0;

  return (
    <>
      <MetaData title="Users List - Shopholic" />
      <AdminLayout>
        <h1 className="my-5">{userCount} Students Enrolled</h1>
        <MDBDataTable data={setUsers()} className="px-3" bordered striped hover />
      </AdminLayout>
    </>
  );
};

export default ListUsers;