import sequelize from "@/lib/config/db";
import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

const UserManagement = sequelize.define(
  "UserManagement",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    orgId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "organizations",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Magic link verification-kaga intha rendu fields mukkiyam
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true, // Login attempt pannum pothu mattum thaan token irukkum
    },
    tokenExpiry: {
      type: DataTypes.DATE,
      allowNull: true, // Token generate pannum pothu expiry set pannuvom
    },
  },
  {
    timestamps: true,
    tableName: "user_management",
    indexes: [
      {
        fields: ["orgId"],
      },
      {
        unique: true,
        fields: ["orgId", "email"],
        name: "unique_org_user_management",
      },
    ],
  },
);

export default UserManagement;
