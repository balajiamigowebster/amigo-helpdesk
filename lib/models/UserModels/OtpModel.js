import { DataTypes } from "sequelize";
import sequelize from "@/lib/config/db";

const OTP = sequelize.define(
  "OTP",
  {
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      // unique: true,
    },
    otpCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    otpExpires: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    // Inga temporary-ah user details-ah store panni vachukalam
    tempData: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "otps",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["email"],
        name: "email",
      },
    ],
  },
);

export default OTP;
