import OTP from "@/lib/models/UserModels/OtpModel";
import User from "@/lib/models/UserModels/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// --- Token create panni Cookie-la set pannura common function ---
const createSession = async (user) => {
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );

  const cookieStore = await cookies();

  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 60 * 60 * 24 * 7, // 7 Days
  });
};

// --- REGISTER CONTROLLER ---
export const registerUser = async (data) => {
  const { firstName, lastName, email, password } = data;

  const existingUser = await User.findOne({
    where: {
      email,
    },
  });
  if (existingUser) throw new Error("Email already registered!");

  // --- INGA THAAN DEFINE PANNANUM ---
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
  // ---------------------------------

  const hashedPassword = await bcrypt.hash(password, 10);

  // OTP Table-la save pandrom (User create aagala!)
  await OTP.upsert({
    email,
    otpCode: otp,
    otpExpires: otpExpiry,
    tempData: {
      firstName,
      lastName,
      hashedPassword,
    },
  });

  let assignedRole = "user";
  if (email.toLowerCase() === "superadmin@gmail.com") {
    assignedRole = "super_admin";
  }

  // const newUser = await User.create({
  //   firstName,
  //   lastName,
  //   email,
  //   password: hashedPassword,
  //   role: assignedRole, // Automatic assignment
  //   otpCode: otp, // Save OTP
  //   otpExpires: otpExpiry, // Save Expiry
  //   isEmailVerified: false,
  //   setupStep: 1, // Step 1: Just Registered
  // });

  return { email, otp }; // OTP-ah return panni email anuppa use pannikalam
};

// export const verifyOTP = async (email, otp) => {
//   const user = await User.findOne({ where: { email } });
//   if (!user) throw new Error("User not found!");
//   if (user.otpCode !== otp) throw new Error("Invalid OTP!");
//   if (new Date() > user.otpExpires) throw new Error("OTP Expired!");

//   // 2. Success - Update User
//   user.isEmailVerified = true;
//   user.otpCode = null; // Clear OTP
//   user.otpExpires = null;
//   user.setupStep = 2; // Move to Step 2: Org Details
//   await user.save();

//   // 3. Auto-login after successful verification
//   await createSession(user);

//   return user;
// };

// --- LOGIN CONTROLLER ---

// --- VERIFY OTP CONTROLLER ---
export const verifyOTP = async (email, otp) => {
  const otpRecord = await OTP.findOne({
    where: {
      email,
    },
  });

  if (!otpRecord) throw new Error("No OTP request found for this email!");
  if (otpRecord.otpCode !== otp) throw new Error("Invalid OTP!");
  if (new Date() > otpRecord.otpExpires) throw new Error("OTP Expired!");

  // tempData string-ah iruntha parse pannanum, object-ah iruntha direct-ah edukalam
  const data =
    typeof otpRecord.tempData === "string"
      ? JSON.parse(otpRecord.tempData)
      : otpRecord.tempData;

  const { firstName, lastName, hashedPassword } = data;

  // Password null-ah pogutha-nu inga check pannunga
  if (!hashedPassword) {
    throw new Error(
      "Temporary password data is missing. Please register again."
    );
  }
  let assignedRole = "user";
  if (email.toLowerCase() === "superadmin@gmail.com") {
    assignedRole = "super_admin";
  }

  // 1. Ippo thaan REAL USER create aaguraan

  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role: assignedRole,
    isEmailVerified: true, // Verification success
    setupStep: 2,
  });

  // 2. Delete OTP after use
  await otpRecord.destroy();

  // 3. Cookie set pannunga
  await createSession(newUser);
  return newUser;
};

export const loginUser = async (email, password) => {
  //console.log(email);
  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error("User not found!");

  // Email verify aagalana login panna vida koodathu
  if (!user.isEmailVerified) throw new Error("Please verify your email first!");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid email or password!");

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Create session (Cookie set aagum)
  await createSession(user);
  return user;
};
