import { cloudinary } from "@/lib/cloudinaryStorage";
import sequelize from "@/lib/config/db";
import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    // --- Updated Email Section (Reference: AdminAuth) ---
    email: {
      type: DataTypes.STRING(150), // Size specify panniyachu
      allowNull: false,
      //   unique: true, // DB level unique
      validate: {
        isEmail: {
          msg: "Valid email address provide", // Custom error message
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: { type: DataTypes.STRING(100), allowNull: true },
    lastName: { type: DataTypes.STRING(100), allowNull: true },
    // --- Profile Image Section (Cloudinary) ---
    avatar: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    avatarPublicId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // --- Role & Status ---
    role: {
      type: DataTypes.ENUM(
        "SUPER_ADMIN",
        "HDT_ADMIN",
        "HDT_MANAGER",
        "HDT_TECH",
        "ORG_ADMIN",
        "ORG_TECH",
      ),
      defaultValue: "ORG_ADMIN",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // --- Multi-Factor Authentication ---
    mfaEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    mfaSecret: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    setupStep: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    isSetupCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    companyName: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    jobTitle: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(100),
      defaultValue: "India",
    },
    communityUsername: {
      type: DataTypes.STRING(25),
      // unique: true,
      allowNull: true,
    },

    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // OTP verify aana thaan ithu true aagum
    },
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verificationExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    // --- User Preferences ---
    preferences: {
      type: DataTypes.JSON,
      defaultValue: {
        theme: "light",
        language: "en",
        notifications: true,
      },
    },
    lastLogin: { type: DataTypes.DATE, allowNull: true },
  },
  {
    timestamps: true,
    tableName: "users",
    indexes: [
      {
        unique: true,
        fields: ["email"],
        name: "user_email_unique", // Index name for professional DB management
      },
      {
        unique: true,
        fields: ["communityUsername"],
        name: "communityUsername", // Explicit name kudutha thirumba thirumba create aagathu
      },
    ],
    hooks: {
      beforeDestroy: async (user) => {
        try {
          if (user.avatarPublicId) {
            await cloudinary.uploader.destroy(user.avatarPublicId);
          }
        } catch (error) {
          console.error("Cloudinary Avatar Delete Error:", error);
        }
      },
      beforeUpdate: async (user) => {
        try {
          if (user.changed("avatarPublicId")) {
            const oldId = user.previous("avatarPublicId");
            if (oldId) {
              await cloudinary.uploader.destroy(oldId);
            }
          }
        } catch (error) {
          console.error("Cloudinary Avatar Update Error:", error);
        }
      },
    },
  },
);

export default User;
