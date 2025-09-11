import Role from "../models/roleModel.js";
import User from "../models/userModel.js";
import Mechanic from "../models/mechanicModel.js";
import SupplierRequest from "../models/supplierRequestModel.js";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken';
import sendMail from "../utils/sendMail.js";

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
        //Check if all fields are present
        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
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
            if (supplierRequest &&supplierRequest.status === 'pending') {
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
        return res.cookie("authtoken", token, options).status(200).json({ data: user,authtoken:token, message: "Login successful" });

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
        const { name, email, password, phoneNumber, address, shopName } = req.body;
        const updatedData = {};
        if (name) updatedData.name = name;
        if (password) {
            if (password.length < 6) {
                return res.status(400).json({ message: "Password must be at least 6 characters long" });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            updatedData.password = hashedPassword;
        }
        if (phoneNumber) updatedData.phoneNumber = phoneNumber;

        //checl if email not already exists
        if (email) {
            const existingUser = await User.findOne({ email: email });
            if (existingUser) {
                return res.status(409).json({ message: "Email already exists" });
            }
        }
        if (address) {
            updatedData.address = {};
            if (address.streetAddress) updatedData.address.streetAddress = address.streetAddress;
            if (address.city) updatedData.address.city = address.city;
            if (address.state) updatedData.address.state = address.state;
            if (address.pincode) updatedData.address.pincode = address.pincode;
        }
        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true, runValidators: true });
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ data: updatedUser, message: "User updated successfully" });

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
const viewProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate('roleId', 'roleName');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        return res.status(200).json({ data: user, message: "User profile fetched successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}
export { createUser, loginUser, updateUser ,viewProfile};