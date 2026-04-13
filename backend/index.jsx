// Required Modules
const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const cors = require("cors");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const connectDB = require("./config/db.jsx"); // Database connection
const Invigilator = require("./models/Invigilator.jsx");

// Load environment variables
dotenv.config();

// Initialize express
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB Atlas
connectDB();

// Async Handler Middleware
const asyncHandler = (fn) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

// 🟢 LOGIN API
app.post("/login", async (req, res) => {
  const { invigilatorId, password } = req.body;

  // Add debug log
  console.log("Attempting login with:", { 
      receivedId: invigilatorId,
      idType: typeof invigilatorId
  });

  if (!invigilatorId || !password) {
      return res.status(400).json({ success: false, message: "Fields are empty" });
  }

  // Convert to number if string
  const searchId = typeof invigilatorId === 'string' ? parseInt(invigilatorId) : invigilatorId;

  try {
      const invigilator = await Invigilator.findOne({ invigilatorId: searchId });
      
      console.log("Database search result:", invigilator ? "Found" : "Not Found");

      if (!invigilator || invigilator.password !== password) {
          return res.status(401).json({ success: false, message: "Invalid credentials" });
      }

      invigilator.loginStatus = true;
      await invigilator.save();

      const assignedRoom = {
          id: 1,
          name: 'Exam Room - G4',
          cameraCount: 3
      };

      res.status(200).json({
          success: true,
          message: "Login successful",
          invigilatorId: invigilator.invigilatorId,
          assignedRoom
      });
  } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ 
          success: false, 
          message: "Server error during login" 
      });
  }
});

// 🟢 FORGOT PASSWORD API
app.post("/forgot-password", async (req, res) => {
    try {
        const { username } = req.body;
        console.log("Processing forgot password for:", username);

        if (!username || !username.includes("@")) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address."
            });
        }

        // Find user
        const invigilator = await Invigilator.findOne({ username });
        if (!invigilator) {
            return res.status(404).json({
                success: false,
                message: "Enter the correct email."
            });
        }

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        console.log(`OTP generated for ${username}: ${otp}`);
        
        // Calculate expiry time (15 minutes)
        const expiryTime = Date.now() + (15 * 60 * 1000);
        
        // Store OTP and expiry in database
        invigilator.resetToken = otp;
        invigilator.resetTokenExpiry = expiryTime;
        await invigilator.save();
        console.log(`OTP saved to database for user: ${username}`);
        
        // Configure email sending with precise Gmail SMTP settings
        const transporter = nodemailer.createTransport({
            host:"smtp.hostinger.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        
        // Create email content with OTP
        const mailOptions = {
            from: `"Examify" <${process.env.EMAIL_USER}>`,
            to: username,
            subject: "Examify - Password Reset Code",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 5px;">
                    <h2 style="color: #333; text-align: center;">Password Reset Code</h2>
                    <p>Dear Examify User,</p>
                    <p>We received a request to reset your password. Please use the following code to complete the process:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="background-color: #f1f1f1; padding: 12px 24px; font-size: 24px; font-weight: bold; letter-spacing: 3px; border-radius: 4px; display: inline-block;">
                            ${otp}
                        </div>
                    </div>
                    <p>This code will expire in 15 minutes.</p>
                    <p>If you did not request a password reset, please ignore this email or contact our support team.</p>
                    <p>Thank you,<br>The Examify Team</p>
                </div>
            `
        };
        
        // Send email
        await transporter.sendMail(mailOptions);
        
        return res.status(200).json({
            success: true,
            message: "Reset code sent successfully"
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to process your request. Please try again later."
        });
    }
});

// 🟢 RESET PASSWORD API
// 🟢 RESET PASSWORD API
app.post("/reset-password", async (req, res) => {
    try {
        const { username, otp, newPassword } = req.body;
    
        // Input validation
        if (!username || !otp || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields."
            });
        }
    
        // Find user by username and verify OTP
        const invigilator = await Invigilator.findOne({
            username: username,
            resetToken: otp,
            resetTokenExpiry: { $gt: Date.now() }
        });
    
        if (!invigilator) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset code."
            });
        }

        // Update password using updateOne to ensure the update happens
        const updateResult = await Invigilator.updateOne(
            { _id: invigilator._id },
            {
                $set: {
                    password: newPassword,
                    resetToken: null,
                    resetTokenExpiry: null
                }
            }
        );

        if (updateResult.modifiedCount === 0) {
            return res.status(500).json({
                success: false,
                message: "Failed to update password. Please try again."
            });
        }
    
        return res.status(200).json({
            success: true,
            message: "Password has been reset successfully."
        });
    
    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to reset password. Please try again."
        });
    }
});

// 🟢 ERROR HANDLING MIDDLEWARE
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Something went wrong!",
        error: process.env.NODE_ENV === "development" ? err.message : {},
    });
});

// 🟢 START SERVER
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});

// 🟢 HANDLE UNHANDLED PROMISE REJECTIONS
process.on("unhandledRejection", (err) => {
    console.error("Unhandled Promise Rejection:", err);
    server.close(() => process.exit(1));
});