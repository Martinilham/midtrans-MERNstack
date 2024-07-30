// midtransConfig.js

import express from "express";
import Midtrans from "midtrans-client";

const router = express.Router();

router.post("/pembayaran-online", async (req, res) => {
  try {
    const snap = new Midtrans.Snap({
      isProduction: false,
      serverKey: "berisi serverkey dari midtrans",
      clientKey: "berisi clientkey dari midtrans"
    });

    const parameter = {
      "transaction_details": {
        "order_id": req.body.orderId, //order id dari frontend
        "gross_amount": req.body.total //total dari frontend
      }
    };

    const transaction = await snap.createTransaction(parameter);
    const dataPayment = {
      response: JSON.stringify(transaction)
    };
    const token = transaction.token;

    res.status(200).json({
      message: "berhasil",
      dataPayment,
      token: token
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Error occurred",
      error: error.message
    });
  }
});

export default router;
