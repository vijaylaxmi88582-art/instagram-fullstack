import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { setUserData } from '../redux/userSlice'

const useGetCurrent = () => {
    const dispatch = useDispatch()
    useEffect(()=>{
        const fetchUser=async()=>{
            try{
                const result=await axios.get(`${serverUrl}/api/user/current`,{withCredentials:true})
                
                dispatch(setUserData(result.data))
            } catch(error){
                console.log(error.response?.data);
        
            };

        }
        fetchUser()

    }, [])
}

export default useGetCurrent