import {createSlice} from "@reduxjs/toolkit";
const userSlice = createSlice({
    name: "user",
    initialState: {
        userData:null,
        suggestedUsers:null,
        profileData:null,
        stories:null,
        allPosts:null
    },
    reducers: {
        setUserData: (state, action) => {
            state.userData = action.payload
        },
        setSuggestedUser: (state, action) => {
            state.suggestedUsers = action.payload
        } ,
        setProfileData: (state, action) => {
            state.profileData = action.payload
        },
        setStories: (state, action) => {
            state.stories = action.payload
        },
        setAllPosts: (state, action) => {
            state.allPosts = action.payload
        }

    }
})
export const { setUserData ,setSuggestedUser, setProfileData, setStories, setAllPosts} = userSlice.actions;
export default userSlice.reducer;
