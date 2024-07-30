import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import Midtrans from './midtrands/midtrands.js';
import './database/koneksi.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use('/api/paymnet', Midtrans);

app.listen(port, () => {
    console.log(`Server started at port ${port}`);
});
