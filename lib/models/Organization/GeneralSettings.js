import sequelize from "@/lib/config/db";
import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

const GeneralSettings = sequelize.define(
  "GeneralSettings",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    orgId: {
      type: DataTypes.UUID,
      allowNull: false,
      // unique: true, // Oru org-ku oru set of settings thaan
      references: {
        model: "organizations",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    helpDeskUrl: {
      type: DataTypes.STRING,
      allowNull: false, // e.g., https://amigo.vercel.app
    },
    portalUrl: {
      type: DataTypes.STRING,
      allowNull: false, // e.g., https://amigo.vercel.app/portal
    },
    supportEmail: {
      type: DataTypes.STRING,
      allowNull: false, // UI: help@amigo.vercel.app
    },
    autoAssign: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // UI: Toggle button
    },
  },
  {
    timestamps: true,
    tableName: "general_settings",
    indexes: [
      {
        unique: true,
        fields: ["orgId"],
        name: "orgId",
      },
    ],
  },
);

export default GeneralSettings;
