import express from "express"
import userRouter from "./routes/user.routes.js"
import urlRouter from "./routes/url.routes.js"
import { authenticationMiddleare } from "./middlewares/auth.middleware.js";
import { connectRedis } from "./redis/index.js";
const app= express()
const PORT=process.env.PORT ?? 8000;
app.use(express.json())
app.use(authenticationMiddleare)
app.get('/',(req,res)=>{
    return res.json({status:'Server is up and running...'})
})

app.use('/user',userRouter)
app.use(urlRouter)


try {
    await Promise.race([
        connectRedis(),
        new Promise((_, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Redis connection timed out'));
            }, 5000);

            timeout.unref();
        }),
    ]);
} catch (error) {
    console.error('Redis unavailable; starting with PostgreSQL fallback:', error.message);
}

app.listen(PORT,()=>{
    console.log(`Server is running on PORT ${PORT}`)
})
