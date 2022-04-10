const express = require("express");
const app = express();
const cookieParser = require('cookie-parser');
const errorMiddleware = require("./middleware/error");
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(fileUpload());

const medicine = require("./routes/medicineRoute");
const users = require("./routes/userRoute");
const order = require("./routes/orderRoute");
const payment = require("./routes/paymentRoute");


app.use("/api/v1", medicine);
app.use("/api/v1", users);
app.use("/api/v1", order);
app.use("/api/v1", payment);

app.use(errorMiddleware);

module.exports = app;
