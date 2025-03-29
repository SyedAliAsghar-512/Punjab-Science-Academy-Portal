import React, { useEffect } from 'react';
import Class from "./product/Classes.jsx"
import { useGetProductsQuery } from "../../redux/api/productsApi.js";
import Custompagination from './customPagination.jsx';
import toast from "react-hot-toast"
import Loader from "../layouts/loader.jsx"
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Filters from "./Filters.jsx"
import { useSelector } from 'react-redux';
import { setIsAuthenticated } from "../../redux/features/userSlice";
import Sidebar from './SideBar.jsx';
import { useMyClassesQuery } from '../../redux/api/orderApi.js';

const Home = () => {

  const {user, loading} = useSelector((state) => state.auth)
  const [searchParams] = useSearchParams();
  const page = searchParams.get("page") || 1;
  const keyword = searchParams.get("keyword") || "";
  const min = searchParams.get("min")
  const max = searchParams.get("max")
  const category = searchParams.get("category")
  const ratings = searchParams.get("ratings")

  const params = {page, keyword};
  const navigate = useNavigate()

  min !== null && (params.min = min)
  max !== null && (params.max = max)
  category !== null && (params.category = category)
  ratings !== null && (params.ratings = ratings)

  const {data, isLoading, error, isError} = useMyClassesQuery()


  useEffect(() => {
    if (isError) {
      toast.error(error?.data?.message)
    }
  }, [isError])

  if (loading) return <Loader />
  if (isLoading) return <Loader />

  const columnSize = keyword ? 4 : 3
  
   const classes = (data?.classes)
  console.log(classes)

    return (
  <>

  <div className='row'>
 <p></p>
    <div className='card col-12 col-md-2' style={{backgroundColor: "#e57373", color:"white", textAlign: "center"}}>
      <p style={{textAlign: "center", marginTop:"10px"}}><p style={{fontWeight: "bold"}}>Semester</p>{user.semester}</p>
    </div>

    <div className='card col-12 col-md-2' style={{backgroundColor: "#f7b84c", color:"white", textAlign: "center", marginLeft: "15px"}}>
      <p style={{textAlign: "center", marginTop:"10px", fontSize: "14px", fontWeight: "bold"}}>Completed CH / Total CH</p><p>{user.comphours} / 45</p>
    </div>

    <div className='card col-12 col-md-2' style={{backgroundColor: "#81c785", color:"white", textAlign: "center", marginLeft: "15px"}}>
      <p style={{textAlign: "center", marginTop:"10px", fontSize: "14px"}}>Inprogress Courses</p><p style={{fontWeight: "bold", fontSize: "24px"}}>{user.inprogresscourses}</p>
    </div>

    <div className='card col-12 col-md-2' style={{backgroundColor: "#80d9d1", color:"white", textAlign: "center", marginLeft: "15px"}}>
      <p style={{textAlign: "center", marginTop:"10px", fontSize: "14px", fontWeight: "bold"}}>Inprogress Credits</p><p style={{fontWeight: "bold", fontSize: "24px"}}>{user.inprogresscredits}</p>
    </div>

    <div className='card col-12 col-md-2' style={{backgroundColor: "#886efa", color:"white", textAlign: "center", marginLeft: "15px"}}>
      <p style={{textAlign: "center", marginTop:"10px", fontSize: "14px", fontWeight: "bold"}}>Department</p><p style={{fontWeight: "bold"}}>{user.program}</p>
    </div>

    <p></p>

    <div className='card p-6'>
      <h4 style={{color: "grey", padding: "15px"}}>My Project</h4>
      <div className='card col-12 col-md-11' style={{marginBottom: "20px"}}>
      <div className='grid-container'>
  <div class="cell">Project Name</div>
  <div class="cell">Supervisor</div>
  <div class="cell">MileStones</div>
  <div class="cell">Status</div>
  <div class="cell">Progress</div>
  <div class="cell">Due Date</div>
  </div>
  <hr></hr>
      </div>
    </div>
    <p></p>
    <div className='card p-6'>
      <h4 style={{color: "grey", padding: "15px"}}>Academics<hr></hr></h4>
      <figure className="avater">
              <img
                src={ user?.avatar ? user?.avatar?.url : "https://github.com/ghulamabbas2/shopitv2-html/blob/master/images/default_avatar.jpg?raw=true"}
                className="rounded-circle"
              />
            </figure>
   <div className='grid-container' >
  <div style={{marginLeft:"90px", textAlign: "center"}}><h5>{user.name}</h5><p style={{color: "grey"}}>{user.cms}<br></br>{user.campus}</p></div>
  <div style={{marginLeft:"300px"}}>Academic Standing:<br></br>{user.standing}</div>
  <div style={{marginLeft:"300px"}}>Presence: <p style={{color: "grey"}}>{user.presence}</p></div>
  </div>

  
  <h4 style={{color: "grey", padding: "5px"}}>Classes, Grades & Attendance<hr></hr></h4>
    <div className='row' >
            {classes?.map((classs) => (
            <Class classs={classs}/>
           ))} 
           </div>
    </div>
          </div>
    
</>
    )
}

export default Home