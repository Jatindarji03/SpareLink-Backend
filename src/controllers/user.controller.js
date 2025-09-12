import Role from "../models/roleModel.js";
import User from "../models/userModel.js";
import Mechanic from "../models/mechanicModel.js";
import SupplierRequest from "../models/supplierRequestModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import sendMail from "../utils/sendMail.js";
import mongoose from "mongoose";
import Supplier from "../models/supplierModel.js";
const generateToken = (user) => {
    const secret = process.env.JWT_SECRET;
    return jwt.sign(
        { id: user._id, roleId: user.roleId, email: user.email },
        secret,
        { expiresIn: '1D' })
}

const createUser = async (req, res) => {
    try {
        const { name, email, password, role, phoneNumber, address, workShop, storeName } = req.body;
        console.log(req.body,"req.body");
        //Check if all fields are present
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if(role.toLowerCase()=='supplier'){
            if(!storeName){
                return res.status(400).json({message:"Store name not found..."});
            }
        }
        if(role.toLowerCase()=='mechanic'){
            if(!workShop){
                return res.status(400).json({message:"workShop name not found..."});
            }
        }
        //check if user already exists
        const existingUser = await User.findOne({ email });
        const roleData = await Role.findOne({ roleName: role });

        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }
        if (password.length < 6) {
            return res.status(400).json({
                message: "Validation Error",
                errors: {
                    password: "Password must be at least 6 characters long"
                }
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        //create a new user
        const newUser = new User({
            name: name,
            email: email,
            password: hashedPassword,
            roleId: roleData._id,
            phoneNumber: phoneNumber
        });
        await newUser.save();
        /*If the role is mechanic, create a mechanic profile in the mechanic
         collection we can add the shop name and phone number later*/
        if (role === 'mechanic') {
            const newMechanic = new Mechanic({
                userId: newUser._id,
                workShop: workShop,
                address: address
            });
            await newMechanic.save();
        } else if (role === 'supplier') {
            /* if the role is supplier move the data to request supplier collection
               if the admin approves the request then move the data to supplier collection
            */
            const newSupplierRequest = new SupplierRequest({
                userId: newUser._id,
                storeName: storeName,
                address: address
            });
            // console.log(newSupplierRequest);
            await newSupplierRequest.save();
        }
        const options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
            httpOnly: true,
            sameSite: 'strict',
            secure: false,
        }
        const token = generateToken(newUser);
        if (!token) {
            return res.status(500).json({ error: "Failed to generate token" });
        }
        // Here you need to implement the send mail to the registred email address

        if (role === 'mechanic') {
            const subject = "Start Ordering Spare Parts with SpareLink 🚗🔧"
            const text = `Hello ${name}
            Welcome to SpareLink!\nYour account is ready, and you can now easily find and order spare parts from trusted suppliers.
            Here’s how to get started:
            1.Browse spare parts available from multiple suppliers.
            2.Send a quotation request for the product you need.
            3.Receive supplier offers and compare prices.
            4.Place your order securely and track it in real-time.
            Log in now to start your journey: [Login Page Link]
            Need help? Reach us anytime at support@sparelink.com
            We’re excited to make your spare part shopping faster and easier! 🚀
            Best Regards,
            The SpareLink Team`
            sendMail(email, subject, text);
        } else if (role === 'supplier') {
            const subject = 'Your SpareLink Account is Pending Approval 🕒';
            const text = `Hello ${name},
            Thank you for registering with SpareLink.
            Your account is currently under review by our admin team.
            Once approved, you’ll be able to:
            1.List your spare parts
            2.Receive quotation requests from mechanics
            3.Grow your business with SpareLink 🚀
            We’ll notify you as soon as your account is approved.
            Best Regards,
            The SpareLink Team`;
            sendMail(email, subject, text);
        }
        await newUser.populate('roleId', 'roleName');
        return res.cookie("authtoken", token, options).status(200).json({
            data: newUser, message: "user registered successful"
        });
    } catch (error) {
        if (error.name === "ValidationError") {
            const validationErrors = {};

            // Extract all validation error messages
            Object.keys(error.errors).forEach((key) => {
                validationErrors[key] = error.errors[key].message;
            });
            return res.status(400).json({ message: "Validation Error", errors: validationErrors });
        }
        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyValue)[0];
            return res.status(409).json({
                message: `${duplicateField} already exists`,
                field: duplicateField
            });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        const user = await User.findOne({ email: email }).populate('roleId', 'roleName');
        if (!user) {
            return res.status(401).json({ message: "User not found please enter correct email" });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Invalid password please enter correct password" });
        }



        if (user.roleId.roleName === 'supplier') {
            const supplierRequest = await SupplierRequest.findOne({ userId: user._id });
            if (supplierRequest && supplierRequest.status === 'pending') {
                return res.status(403).json({ message: "Your supplier account is still pending approval. Please wait for admin approval." });
            }
        }
        console.log("dd");
        const token = generateToken(user);
        if (!token) {
            return res.status(500).json({ error: "Failed to generate token" });
        }
        console.log("dd");
        const options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
            httpOnly: true,   // secure cookie (not accessible in React)
            sameSite: "strict", // ✅ allow cross-origin cookies
            secure: false,    // set true if HTTPS
        };
        return res.cookie("authtoken", token, options).status(200).json({ data: user, authtoken: token, message: "Login successful" });

    } catch (error) {
        if (error.name === "ValidationError") {
            const validationErrors = {};

            // Extract all validation error messages
            Object.keys(error.errors).forEach((key) => {
                validationErrors[key] = error.errors[key].message;
            });
            return res.status(400).json({ message: "Validation Error", errors: validationErrors });
        }
        return res.status(500).json({ message: "Internal server error" });
    }
}

const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const {
      name,
      email,
      password,
      phoneNumber,
      address,
      workShop,
      storeName,
    } = req.body;

    // Build user update object
    const updatedUserData = {};
    if (name) updatedUserData.name = name;
    if (phoneNumber) updatedUserData.phoneNumber = phoneNumber;

    // Password validation & hashing
    if (password) {
      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must be at least 6 characters long" });
      }
      updatedUserData.password = await bcrypt.hash(password, 10);
    }

    // Email validation (unique)
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(409).json({ message: "Email already exists" });
      }
      updatedUserData.email = email;
    }

    // Update user document
    let updatedUser = await User.findByIdAndUpdate(userId, updatedUserData, {
      new: true,
      runValidators: true,
    }).populate("roleId"); // populate roleId

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    // Safely get roleName
    const roleName = updatedUser?.roleId?.roleName?.toLowerCase();

    // Update role-specific info
    if (roleName === "mechanic") {
      let mechanic = await Mechanic.findOne({ userId });
      if (mechanic) {
        if (workShop) mechanic.workShop = workShop;
        if (address) {
          mechanic.address = {
            ...mechanic.address,
            street: address.street || mechanic.address.street,
            city: address.city || mechanic.address.city,
            state: address.state || mechanic.address.state,
            country: address.country || mechanic.address.country,
            pincode: address.pincode || mechanic.address.pincode,
          };
        }
        await mechanic.save();
      }
    }

    if (roleName === "supplier") {
      let supplier = await Supplier.findOne({ userId });
      if (supplier) {
        if (storeName) supplier.storeName = storeName;
        if (address) {
          supplier.address = {
            ...supplier.address,
            street: address.street || supplier.address.street,
            city: address.city || supplier.address.city,
            state: address.state || supplier.address.state,
            country: address.country || supplier.address.country,
            pincode: address.pincode || supplier.address.pincode,
          };
        }
        await supplier.save();
      }
    }

    // Fetch updated role-specific details for response
    const mechanicDetails =
      roleName === "mechanic" ? await Mechanic.findOne({ userId }).lean() : null;
    const supplierDetails =
      roleName === "supplier" ? await Supplier.findOne({ userId }).lean() : null;

    updatedUser = updatedUser.toObject();

    return res.status(200).json({
      message: "Profile updated successfully",
      data: { ...updatedUser, mechanicDetails, supplierDetails },
    });
  } catch (error) {
    console.error("Update failed:", error);
    if (error.name === "ValidationError") {
      const errors = {};
      Object.keys(error.errors).forEach(
        (key) => (errors[key] = error.errors[key].message)
      );
      return res.status(400).json({ message: "Validation Error", errors });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
const viewProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.roleId.roleName;
    const objectId = new mongoose.Types.ObjectId(userId);
    console.log(role);
    

    const pipeline = [
      { $match: { _id: objectId } },

      // Join Role
      {
        $lookup: {
          from: "roles",
          localField: "roleId",
          foreignField: "_id",
          as: "role"
        }
      },
      { $unwind: { path: "$role", preserveNullAndEmptyArrays: true } },

      // Conditionally join based on role
      ...(role.toLowerCase() === "mechanic"
        ? [
            {
              $lookup: {
                from: "mechanics",
                localField: "_id",
                foreignField: "userId",
                as: "mechanicDetails"
              }
            },
            {
              $unwind: {
                path: "$mechanicDetails",
                preserveNullAndEmptyArrays: true
              }
            }
          ]
        : []),

      ...(role.toLowerCase() === "supplier"
        ? [
            {
              $lookup: {
                from: "suppliers", // ✅ FIXED
                localField: "_id",
                foreignField: "userId",
                as: "supplierDetails"
              }
            },
            {
              $unwind: {
                path: "$supplierDetails",
                preserveNullAndEmptyArrays: true
              }
            }
          ]
        : []),

      {
        $project: {
          name: 1,
          email: 1,
          phoneNumber: 1,
          createdAt: 1,
          role: "$role.roleName",
          mechanicDetails: "$mechanicDetails",
          supplierDetails: "$supplierDetails"
        }
      }
    ];

    const result = await User.aggregate(pipeline);

    if (!result || result.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      data: result[0],
      message: "User profile fetched successfully"
    });
  } catch (error) {
    console.error("Error in viewProfile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export { createUser, loginUser, updateUser, viewProfile };