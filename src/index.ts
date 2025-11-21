import dotenv from "dotenv";
import express, {Request, Response, NextFunction} from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import xss from "xss";
dotenv.config();

import UserAuthRoutes from "./Routes/userAuthRoutes";
import UserPostRoutes from "./Routes/userPostRoutes";
import UserUserRoutes from "./Routes/userUserRoutes";
import AdminAuthRoutes from "./Routes/adminAuthRoutes";
import AdminPostRoutes from "./Routes/adminPostRoutes";
import AdminUserRoutes from "./Routes/adminUserRoutes";
import { healthCheckMiddleware } from "./Helper/healthCheckMiddleware";
import { Server } from "socket.io";
import { createServer } from "http";
import PublicRoutes from "./Routes/publicRoutes";

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests, please try again later.'
});
const corsOptions = {
    origin:['http://localhost:3000', 'https://www.edugrant.online', 'http://localhost:3001', 
    "http://192.168.1.1:3000", "http://192.168.1.2:3000", "http://192.168.1.3:3000", "http://192.168.1.4:3000",
    "http://192.168.1.5:3000", "http://192.168.1.6:3000", "http://192.168.1.7:3000", "http://192.168.1.8:3000",
    "http://192.168.1.9:3000", "http://192.168.1.10:3000", "http://192.168.1.11:3000", "http://192.168.1.12:3000",
    "http://192.168.1.13:3000", "http://192.168.1.14:3000", "http://192.168.1.15:3000",],
    credentials:true
}

const app = express();

app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(cookieParser());
app.use(express.json({limit:"10kb"}));
app.use(hpp());
app.use((req, res, next) => {
    for (const key in req.body) {
        if (req.body.hasOwnProperty(key)) {
        req.body[key] = xss(req.body[key]);
        }
    }
    next();
});
// app.set("trust proxy", 1)
// app.use(apiLimiter)
app.use(healthCheckMiddleware)

app.use(PublicRoutes)

app.use("/user",UserAuthRoutes);
app.use("/user",UserPostRoutes);
app.use("/user",UserUserRoutes);

app.use("/administrator", AdminAuthRoutes)
app.use("/administrator", AdminPostRoutes)
app.use("/administrator", AdminUserRoutes)

app.get("/", (req, res) => {
    res.send("TS Express!!");
});

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error(err);
    if (err.code === "P2025") {
        res.status(404).json({ success: false, message: "Record not found" });
        return
    }
    if (err.code?.startsWith("P20")) {
        res.status(400).json({ success: false, message: "Database constraint error" });
        return
    }
    if (err.code === "P2002") {
        res.status(409).json({ success: false, message: "Duplicate entry" });
        return
    }
    res.status(err.status || 500).json({
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
    });
});

const server = createServer(app)
const io = new Server(server, {
    cors:{
        origin:corsOptions.origin,
        credentials: true
    }
})
io.on("connection", (socket) => {// Start Connection BOOOOOOOIIIII
    socket.on("register", (data: {role: string, id: number}) => {
        if(!data?.role || !data?.id){
            return
        }
        if(data.role === "ISPSU_Staff" || data.role === "ISPSU_Head"){
            socket.join(data.id.toString())
            socket.join(data.role)
        }
        if(data.role === "Student"){
            socket.join(data.id.toString())
            socket.join("Student")
        }
        // console.log(`User Connected: ID = ${data.id} Role = ${data.role}`)
    })
    socket.on("disconnect", () => {
        
    })
})
export {io, server}

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`Server Listening to ${PORT}`);
});