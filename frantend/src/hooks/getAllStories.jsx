import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { setStories } from '../redux/userSlice'

const useGetAllStories = () => {
    const dispatch = useDispatch()
    useEffect(() => {
        const fetchStories = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/user/stories`, { withCredentials: true })
                dispatch(setStories(result.data))
            } catch (error) {
                console.log(error)
            }
        }
        fetchStories()
    }, [])
}

export default useGetAllStories