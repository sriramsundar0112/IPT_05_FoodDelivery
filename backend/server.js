import express  from "express"
import cors from 'cors'
import { connectDB } from "./config/db.js"
import userRouter from "./routes/userRoute.js"
import foodRouter from "./routes/foodRoute.js"
import 'dotenv/config'
import client from "prom-client";
import cartRouter from "./routes/cartRoute.js"
import orderRouter from "./routes/orderRoute.js"

// app config
const app = express()
const port = process.env.PORT || 4000;


// middlewares
app.use(express.json())
app.use(cors())

// db connection
connectDB()

// api endpoints
app.use("/api/user", userRouter)
app.use("/api/food", foodRouter)
app.use("/images",express.static('uploads'))
app.use("/api/cart", cartRouter)
app.use("/api/order",orderRouter)

// Prometheus Metrics Collection

client.collectDefaultMetrics();

const httpRequestsTotal = new client.Counter({
    name: "http_requests_total",
    help: "Total HTTP Requests",
    labelNames: ["method", "route", "status"]
});

const httpRequestDuration = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "HTTP request duration in seconds",
    labelNames: ["method", "route", "status"],
    buckets: [0.1, 0.3, 0.5, 1, 2, 5]
});

// Middleware to collect metrics
app.use((req, res, next) => {

    const end = httpRequestDuration.startTimer();

    res.on("finish", () => {

        httpRequestsTotal.inc({
            method: req.method,
            route: req.route ? req.route.path : req.path,
            status: res.statusCode
        });

        end({
            method: req.method,
            route: req.route ? req.route.path : req.path,
            status: res.statusCode
        });

    });

    next();
});

// Metrics endpoint
app.get("/metrics", async (req, res) => {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
});

// Logging the Status of Server and Metrics Endpoints

app.get("/", (req, res) => {
    res.send("API Working")
  });


app.listen(port, () => {
  
  console.log(`Server started on http://localhost:${port}`);
  console.log(`Prometheus Metrics: http://localhost:${port}/metrics`);
});