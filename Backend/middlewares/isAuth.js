import jwt from 'jsonwebtoken'

const isAuth=(req,res,next)=>{
    try{
        const authHeader = req.headers.authorization;
        const token = req.cookies.token || (authHeader && authHeader.split(" ")[1]);
        if(!token){
            return res.status(400).json({message:"token is not found"})
        }
        const verifyToken=jwt.verify(token, process.env.JWT_SECRET)
        req.userId=verifyToken.userId
        next()

    } catch (error){
        return res.status(500).json({message: `is auth ${error}`})

    }
}
export default isAuth