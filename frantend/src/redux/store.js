import {configureStore} from "@reduxjs/toolkit";
import userSlice from "./userSlice";
import themeSlice from "./themeSlice";

const store = configureStore({
    reducer:{
        user: userSlice,
        theme: themeSlice
    }
})

export default store