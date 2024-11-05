import { Router, json } from "express";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
import { authenticate } from "../Middleware/auth.js";


dotenv.config()
const Route = Router();
const user = new Map();
const food = new Map();

const SecretKey = process.env.SecretKey

Route.use(json())

Route.post('/signup', async (req, res) => {
    try {                                   //error handling using try catch method
        console.log("Hi")
        const data = req.body;
        console.log(data.FirstName)
        const { FirstName,
            LastName,
            UserName,
            Password,
            Role } = data;
        console.log(FirstName)

        const newPass = await (bcrypt.hash(Password, 10));
        console.log(newPass)

        if (user.has(UserName)) {
            res.status(400).json({ message: "User already exits" })
        } else {
            user.set(UserName, {
                FirstName, LastName, Password: newPass, Role
            })
        }

        console.log(user.get(UserName))
        res.status(201).json({ Message: "Data Saved" })
    }
    catch (error) {
        res.status(500).json(error);
    }


})


Route.post('/login', async (req, res) => {
    const data = req.body;
    const { UserName, Password } = data;

    const result = user.get(UserName)
    console.log(result);

    if (result) {
        console.log(Password)
        const invalid = await bcrypt.compare(Password, result.Password);
        console.log(invalid);
        if (invalid) {

            const token = jwt.sign({ UserName: UserName, Role: result.Role }, SecretKey, { expiresIn: "1h" })
            console.log(token)
            res.cookie('authToken', token, {
                httpOnly: true
            });
            res.status(200).json({ message: "Success" })
        }
        else {

            res.status(403).json({ Message: "Password Is Correct" })
        }

    }
    else {
        res.status(403).json({ message: "User is not exisit" })
    }



})
Route.post('/addFood', authenticate, (req, res) => {
    try {
        if (req.UserName) {


            console.log('Hello')
            console.log(req.UserName);
            console.log(req.Role);

            const { ID,
                DishName,
                Type,
                Price,
                Restaurant,
                Time } = req.body
            console.log(ID);

            if (req.Role == "admin") {
                if (food.has(ID)) {
                    res.status(400).json({ message: "this item  already exsist" })
                }

                else {
                    food.set(ID, {DishName,Type,Price,Restaurant,Time })
                    res.status(200).json({ message: 'itrem Added Successfully' })
                    console.log(food.get(ID))
                }


            }
            else {
                res.status(400).json({ message: 'User Is Not Admin' })
                console.log("User Is Not Admin")

            }
        } else {
            console.log("Invalid User");
        }
    }
    catch (error) {
        res.status(400).json(error)

    }
})
export { Route }