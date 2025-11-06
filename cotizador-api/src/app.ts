import express from "express";
import cors from "cors";
import dotenv from "dotenv"; 
import morgan from "morgan";
import router from "./routes/route";
import { errorHandler } from "./core/errors/errorHandler";
import "./config/prisma";
dotenv.config(); 
import path from "path";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev")); 
app.use('/api',router);
app.use(errorHandler);
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));




export default app;