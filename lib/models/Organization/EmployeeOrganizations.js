import { DataTypes } from "sequelize";
import sequelize from "@/lib/config/db";
import { v4 as uuidv4 } from "uuid";

const EmployeeOrganizations = sequelize.define(
  "EmployeeOrganizations",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "employee_administration", // Corrected to match tableName
        key: "id",
      },
      onDelete: "CASCADE", // Employee delete aana intha link-um delete aagidum
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "organizations", // Corrected to match tableName
        key: "id",
      },
      onDelete: "CASCADE", // Org delete aana intha link-um delete aagidum
    },
  },
  {
    tableName: "employee_organizations", // Table name for clarity
    timestamps: true,
    // --- IMPORTANT: Unique Constraint ---
    // Orey employee oru organization-la thirumba thirumba add aaga koodathu
    indexes: [
      {
        unique: true,
        fields: ["employeeId", "organizationId"],
      },
    ],
  },
);

export default EmployeeOrganizations;
