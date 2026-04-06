import sequelize from "@/lib/config/db";
import { DataTypes } from "sequelize";
import { v4 as uuidv4 } from "uuid";

const TicketCategory = sequelize.define(
  "TicketCategory",
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "ticket_categories",
    indexes: [
      {
        fields: ["orgId"],
      },
      // Oru organization-kulla ore name-la rendu category irukka koodathu
      {
        unique: true,
        fields: ["orgId", "name"],
        name: "unique_org_category_name",
      },
    ],
  },
);

export default TicketCategory;
