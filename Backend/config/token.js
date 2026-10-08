import jwt from 'jsonwebtoken'
const  genToken =(userId)=>{
    try{
        const token = jwt.sign({userId},process.env.JWT_SECRET,{expiresIn:"10y"})
        return token
    } catch (error){
        console.log(`gen token error ${error}`)
        throw error

    }

}
export default genToken