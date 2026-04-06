import { DataTypes } from "sequelize";
import sequelize from "@/lib/config/db";
import { v4 as uuidv4 } from "uuid";

const Organization = sequelize.define(
  "Organization",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    // STEP 1 FIELDS
    name: {
      type: DataTypes.STRING(150),
      // unique: true,
      allowNull: false, // form.organizationName
    },
    // PUTHU FIELD: Slug for Dynamic URL
    slug: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    domain: {
      type: DataTypes.STRING(100),
      // unique: true,
      allowNull: false, // form.domain
    },

    fullDomainUrl: {
      type: DataTypes.STRING(255), // Store: amigo.vercel.app
      allowNull: false,
    },

    // STEP 2 FIELDS (Admin profile linked to this org)
    // Intha details oru velai separate User model-la irunthaal
    // neenga adminId-ai mattum maintain pannalaam.
    // Illai ithu direct-ah org details-oda vara vendum endraal:

    jobTitle: {
      type: DataTypes.STRING(100),
      allowNull: true, // form.jobTitle
    },
    country: {
      type: DataTypes.STRING(100),
      defaultValue: "India", // form.country
    },
    adminUsername: {
      type: DataTypes.STRING(25),
      allowNull: true, // form.username
    },

    isCategoryInitialized: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    ticketDisplayIdCounter: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },

    // Intha organization create panna user oda ID (Foreign Key)
    adminId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users", // Make sure your User model table name is 'users'
        key: "id",
      },
    },
  },
  {
    timestamps: true,
    tableName: "organizations",
    indexes: [
      {
        unique: true,
        fields: ["name"],
        name: "name",
      },
      {
        unique: true,
        fields: ["domain"],
        name: "domain",
      },
      {
        fields: ["adminId"], // Itha extra-ah add pannikonga
        name: "adminId", // DB-la irukira name-aiye kudunga
      },
      {
        unique: true,
        fields: ["slug"],
        name: "slug",
      },
    ],
  },
);

export default Organization;
