import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./prisma";
import morgan from "morgan";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Servidor Prisma + Express funcionando 🚀");
});

// Ejemplo de ruta para crear el primer admin
app.post("/admin", async (req, res) => {
  const { email, password, firstName, lastName } = req.body;

  try {
    const admin = await prisma.user.create({
      data: {
        email,
        password, // luego deberías hashearlo con bcrypt
        firstName,
        lastName,
        role: "ADMIN",
      },
    });
    res.status(201).json(admin);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creando el admin" });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
