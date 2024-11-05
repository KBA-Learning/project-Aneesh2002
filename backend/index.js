import express, { json } from 'express'
import dotenv from 'dotenv'
import { Route } from './Routes/adminRoutes.js';

dotenv.config();
const app = express();

app.use(json())
const port=process.env.port;

app.use('/',Route)
app.listen(port,()=>{
    console.log(`server listening in the port ${port}`);
    
})