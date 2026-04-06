import sequelize from "@/lib/config/db";
import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

const UserPortal = sequelize.define(
  "UserPortal",
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
    // Portal enable/disable toggle
    isEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // User portal-oda main heading
    pageTitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Ticket form title
    formTitle: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Form description message
    formMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Success popup title
    successTitle: {
      type: DataTypes.STRING,
      defaultValue: "Your ticket has been submitted!",
    },
    // Success popup message
    successMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Login welcome message
    loginWelcomeMessage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // News/Updates field
    announcements: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    // Display support email
    displayedEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { isEmail: true },
    },
    // Checkbox: Display reference email
    includeReferenceEmail: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // Portal image URL
    portalImageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // New field to handle Cloudinary deletion
    portalImagePublicId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    // Form-la Category field-ah kaatanuma
    includeCategoryField: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // Category selection mandatory-ah
    requireCategory: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    portalTheme: {
      type: DataTypes.ENUM("orange", "blue", "green", "purple", "grey"),
      defaultValue: "orange",
    },
    authType: {
      type: DataTypes.ENUM("guest", "email"),
      defaultValue: "email",
    },
  },
  {
    timestamps: true,
    tableName: "user_portal_settings",
    indexes: [
      {
        unique: true,
        fields: ["orgId"],
        name: "unique_org_portal_settings",
      },
    ],
  },
);

export default UserPortal;
