import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { setSuggestedUser, setUserData } from '../redux/userSlice'

const useGetSuggestedUsers = () => {
    const dispatch = useDispatch()
    const {userData} = useSelector((state)=>state.user)
    useEffect(()=>{
        if(!userData) return;
        const fetchUser=async()=>{
            try{
                const result=await axios.get(`${serverUrl}/api/user/suggested`,{withCredentials:true})
                dispatch(setSuggestedUser(result.data))
            } catch(error){
                console.log(error)
        
            }

        }
        fetchUser()

    }, [userData])
}

export default useGetSuggestedUsers