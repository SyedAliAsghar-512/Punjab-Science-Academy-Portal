import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {userApi} from "./userApi"
import {setIsAuthenticated, setLoading, setUser} from "../features/userSlice"

export const authApi = createApi({
    reducerPath: "authApi",
    baseQuery: fetchBaseQuery({ baseUrl: "/api/v1" }),
    endpoints: (builder) => ({

        register: builder.mutation({
            query(body) {
                return {
                    url: "/register",
                    method: 'POST',
                    body,
                }
            }
        }),
          
    login: builder.mutation({
        query(body) {
            return {
                url: "/login",
                method: 'POST',
                body,
            }
        },
        async onQueryStarted(args, {dispatch, queryFulfilled}) {
         try {
            await queryFulfilled;
            await dispatch(userApi.endpoints.getMe.initiate(null))
           
         } catch (error) {
           
            console.log(error);
         }
        }
    }),
     logout: builder.query({
        query: () => `/logout`,
    }),
    getDashboardStats: builder.query({
        query: ({ month, year }) => ({
            url: `/admin/dashboard-stats?month=${month}&year=${year}`,
            method: "GET",
        }),
    }),
        })
    })
        
export const {useGetDashboardStatsQuery, useLoginMutation, useRegisterMutation, useLazyLogoutQuery } = authApi