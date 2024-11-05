import { Router, json } from "express";
import bcrypt from 'bcrypt'
import jwt from "jsonwebtoken";
import dotenv from 'dotenv'
import { authenticate } from "../Middleware/auth.js";
import mongoose from "mongoose";


dotenv.config()
const Route = Router();
// const user = new Map();
// const food = new Map();

const SecretKey = process.env.SecretKey
const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    userName: { type: String, unique: true },
    password: String,
    role: String

})
const foodSchema=new mongoose.Schema({
    iD:{type:String,unique:true},
    dishName:String,
    type:String,
    price:String,
    restuarant:String,
    time:String

})

const User=mongoose.model('userdetails', userSchema);

const Food=mongoose.model('FoodItems',foodSchema)

mongoose.connect('mongodb://localhost:27017/Food-Project')

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
        const existingUser = await User.findOne({ userName: UserName })
        console.log(existingUser);

        if (existingUser) {
            res.status(400).json({ message: "User already exits" })
        } else {
            const newUser = new User({
                firstName: FirstName,
                lastName: LastName,
                userName: UserName,
                password: newPass,
                role: Role

            })
            await newUser.save()
            res.status(201).json({ Message: "Data Saved" })
        }



    }
    catch (error) {
        res.status(500).json(error);
    }


})


Route.post('/login', async (req, res) => {

    try {
        const data = req.body;
        const { UserName, Password } = data;

        const result = await User.findOne({ userName: UserName })
        console.log(result);

        if (result) {
            console.log(Password)
            const invalid = await bcrypt.compare(Password, result.password);
            console.log(invalid);
            if (invalid) {

                const token = jwt.sign({ UserName: UserName, Role: result.role }, SecretKey, { expiresIn: "1h" })
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

    } catch (error) {
        console.error(error);

    }
})
Route.post('/addFood', authenticate,async (req, res) => {
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
            const existingItem =await Food.findOne({ iD:ID })

            if (req.Role == "admin") {
                if (existingItem) {
                    res.status(400).json({ message: "this item  already exsist" })
                }

                else {
                    const newItem = new Food({
                        iD:ID,
                        dishName:DishName,
                        type:Type,
                        price:Price,
                        restuarant:Restaurant,
                        time:Time



                    })
                    await newItem.save()
                    res.status(200).json({ message: 'Item Addedd Successfully' })
                    console.log(newItem);
                    

                    // food.set(ID, {DishName,Type,Price,Restaurant,Time })
                    // res.status(200).json({ message: 'itrem Added Successfully' })
                    // console.log(food.get(ID))
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

Route.patch('/update',authenticate ,async (req,res)=>{
    const {ID,
    newDishName,
    newType,
    newPrice,
    newRestaurant,
    newTime} =req.body
try {
   if(req.Role == "admin"){

      const result = await Food.findOneAndUpdate(
                       {iD:ID},{
     
                     $set:{
                        dishName:newDishName,
                        type:newType,
                        price:newPrice,
                        restuarant:newRestaurant,
                        time:newTime
     
                     }
                   
      }, { new: true });
     
             if (result.matchedCount == 0) {
               return res.status(400).json({ message: "item not found" });
                }
            res.status(200).json({message:"item updated",UpdateClass:result})
      }else {
        res.status(400).json({ message: "Unauthorized Access" });
     }
      
} catch (error) {
   res.status(500).json({ message: "An error occurred. Please check the class details." });
}

})
export { Route }