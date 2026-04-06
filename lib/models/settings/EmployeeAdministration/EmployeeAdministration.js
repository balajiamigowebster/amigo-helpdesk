import { v4 as uuidv4 } from "uuid";
import { DataTypes } from "sequelize";
import sequelize from "@/lib/config/db";
import { cloudinary } from "@/lib/cloudinaryStorage";

const EmployeeAdministration = sequelize.define(
  "Employee-Administration",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    // Intha employee-ai yar create pannangalo avanga ID
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users", // 'users' table name
        key: "id",
      },
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { notEmpty: true },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: {
          msg: "Valid email address provide", // Custom error message
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: true, // Verification mudiyura varai null-ah irukkalaam
      validate: {
        // Password set pannum pothu adhu romba short-ah irukka koodathu
        len: {
          args: [8, 100],
          msg: "Password must be at least 8 characters long",
        },
      },
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    employeeImage: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    employeeImagePublicId: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    accessScope: {
      type: DataTypes.ENUM("ALL", "SPECIFIC"),
      allowNull: false,
      defaultValue: "ALL",
    },
    organizations: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: ["ALL"],
    },
    hourlyRate: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.0,
    },
    isNotifyEnabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Default-ah false
    },
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verificationExpiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "employee_administration",
    indexes: [
      {
        // Oru owner-ku kulla email unique-ah irukanum
        unique: true,
        fields: ["email", "ownerId"],
        name: "employee_email_unique",
      },
      {
        // System generated foreign key index-ai mention pannuvathu nallathu
        fields: ["ownerId"],
        name: "ownerId",
      },
    ],
    hooks: {
      beforeDestroy: async (employee) => {
        if (employee.employeeImagePublicId) {
          try {
            await cloudinary.uploader.destroy(employee.employeeImagePublicId, {
              resource_type: "image",
            });
          } catch (error) {
            console.error("Cloudinary error:", error);
          }
        }
      },
      beforeUpdate: async (employee) => {
        if (employee.changed("employeeImagePublicId")) {
          const previousPublicId = employee.previous("employeeImagePublicId");
          if (previousPublicId) {
            try {
              await cloudinary.uploader.destroy(previousPublicId);
            } catch (error) {
              console.error("Cloudinary error:", error);
            }
          }
        }
      },
    },
  },
);

export default EmployeeAdministration;
