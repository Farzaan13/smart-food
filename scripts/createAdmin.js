const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("../models/User");

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");

        const email = "admin@smartfood.ai";

        const existingAdmin = await User.findOne({
            email
        });

        if (existingAdmin) {
            console.log("Admin already exists.");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(
            "Admin@123",
            12
        );

        const admin = await User.create({
            name: "SmartFood Admin",
            email,
            phone: "",
            password: hashedPassword,
            role: "admin",
            organizationName: "SmartFood AI",
            address: "",
            city: "Kanpur",
            isVerified: true,
            isActive: true
        });

        console.log("================================");
        console.log("Admin created successfully");
        console.log("Email:", admin.email);
        console.log("Role:", admin.role);
        console.log("================================");

        process.exit(0);

    } catch (error) {

        console.error(
            "Admin creation failed:",
            error
        );

        process.exit(1);
    }
};

createAdmin();