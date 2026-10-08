import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { setAllPosts } from '../redux/userSlice'

const useGetAllPosts = () => {
    const dispatch = useDispatch()
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const result = await axios.get(`${serverUrl}/api/post/getAll`, { withCredentials: true })
                dispatch(setAllPosts(result.data))
            } catch (error) {
                console.log(error)
            }
        }
        fetchPosts()
    }, [dispatch])
}

export default useGetAllPosts
