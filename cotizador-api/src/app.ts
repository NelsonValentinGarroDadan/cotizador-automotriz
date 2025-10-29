import express from "express";
import cors from "cors";
import dotenv from "dotenv"; 
import morgan from "morgan";
import router from "./routes/route";
import { errorHandler } from "./core/errors/errorHandler";
import "./config/prisma";
dotenv.config(); 

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev")); 
app.use('/api',router);
app.use(errorHandler);

export default app;