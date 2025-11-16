import express from "express";
import router from "./routes/services.js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

app.use("/api", router);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`server listening on http://localhost:${PORT}`);
});
