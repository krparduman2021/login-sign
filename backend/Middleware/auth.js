

const jwt  = require('jsonwebtoken')
const secretKey = 'acharya'

const auth  = (req,res,next)=>{

    const data = req.headers["authorization"]
    const token = data && data.startsWith("Bearer ") ? data.split(" ")[1] : null

    if(!token){
        return res.status(401).send({msg:"Token is missing"})
    }

    jwt.verify(token,secretKey,(err,validate)=>{
        if(err){
            return res.status(401).send({msg:"Invalid or expired token"})
        }
        if(validate){
            return next()
        }
        return res.status(401).send({msg:"user is not authorized"})
    })
}

module.exports = auth






