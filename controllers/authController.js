import { EmployeeAdministration, Ticket } from "@/lib";
import Message from "@/lib/models/tickets/Message";
import OTP from "@/lib/models/UserModels/OtpModel";
import User from "@/lib/models/UserModels/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// --- Token create panni Cookie-la set pannura common function ---
const createSession = async (user) => {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      isSetupCompleted: Boolean(user.isSetupCompleted),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
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

  let assignedRole = "ORG_ADMIN";
  if (email.toLowerCase() === "superadmin@gmail.com") {
    assignedRole = "SUPER_ADMIN"; // Super admin email-na mattum ithu
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

  await OTP.upsert({
    email,
    otpCode: otp,
    otpExpires: otpExpiry,
    tempData: {
      firstName,
      lastName,
      hashedPassword,
      role: assignedRole, // tempData-la role-aiyum sethu save pannunga
    },
  });

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

  const { firstName, lastName, hashedPassword, role } = data;

  // Password null-ah pogutha-nu inga check pannunga
  if (!hashedPassword) {
    throw new Error(
      "Temporary password data is missing. Please register again.",
    );
  }
  // let assignedRole = "user";
  // if (email.toLowerCase() === "superadmin@gmail.com") {
  //   assignedRole = "SUPER_ADMIN";
  // }

  // 1. Ippo thaan REAL USER create aaguraan

  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    role: role || "ORG_ADMIN", // tempData-la role illana default ORG_ADMIN
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
  // await Ticket.sync({ alter: true });
  // await Message.sync({ alter: true });

  let user = null;
  let userType = "admin";

  // 1. Mudhallil User Table (Org Admin) check pannunga
  user = await User.findOne({
    where: {
      email,
    },
  });

  if (!user) {
    user = await EmployeeAdministration.findOne({
      where: {
        email,
        isVerified: true, // Verify aagadha employee login panna koodadhu
      },
    });
    userType = "employee";
  }

  // 3. Rendu table-laiyum user illai na error
  if (!user) throw new Error("User not found!");

  // 4. Admin-ku mattum email verification check (Employees are already verified by token)
  if (userType === "admin" && !user.isEmailVerified) {
    throw new Error("Please verify your email first!");
  }

  // 5. Password Comparison (Rendukume bcrypt hash thaan)
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid email or password!");

  // 6. Last Login update (Optional: Employee table-layum indha column irundha use pannunga)
  if (user.lastLogin !== undefined) {
    user.lastLogin = new Date();
    await user.save();
  }

  // 7. JWT Session Create (Common function neenga mela define pannirukkuradhu)
  // Employee-ku role default-ah 'employee' nu anuppalaam or table role

  await createSession({
    id: user.id,
    email: user.email,
    role: user.role || userType,
  });

  // Ippo plain object-ah return pannanum
  const userData = user.get ? user.get({ plain: true }) : user;

  console.log("UserData", userData);

  return {
    ...userData,
    userType: userType, // Manually adding userType
  };
};
