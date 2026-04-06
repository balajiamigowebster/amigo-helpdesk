import sequelize from "@/lib/config/db";
import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

const CustomAttribute = sequelize.define(
  "CustomAttribute",
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
    // Field Name (e.g., "Complaints", "Phone Number")
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM(
        "Text Field",
        "Text Area",
        "List",
        "Phone",
        "Date",
        "Number",
      ),
      allowNull: false,
      defaultValue: "Text Field",
    },
    // If type is 'List', store options as JSON (e.g., ["Option 1", "Option 2"])
    options: {
      type: DataTypes.JSON,
      get() {
        const rawValue = this.getDataValue("options");
        return rawValue
          ? typeof rawValue === "string"
            ? JSON.parse(rawValue)
            : rawValue
          : null;
      }, // <--- INGA ORU COMMA
      allowNull: true,
    },
    // Toggle: Portal-la intha field-ah kaatanuma
    includeInPortal: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    // Toggle: Intha field mandatory-ah (Required)
    isRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    timestamps: true,
    tableName: "custom_attributes",
    indexes: [
      {
        fields: ["orgId"],
      },
    ],
  },
);

export default CustomAttribute;
