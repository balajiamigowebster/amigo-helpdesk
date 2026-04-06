import { DataTypes } from "sequelize";
import sequelize from "@/lib/config/db";
import { v4 as uuidv4 } from "uuid";

const Ticket = sequelize.define(
  "Ticket",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      comment: "Ticket-oda unique database ID (UUID format)",
    },
    // 2. Custom Display ID - User-ku kaatta vendiya readable ID (e.g., TIC-001)
    displayId: {
      type: DataTypes.STRING(50),
      unique: true, // DB level-layum unique constraint irukkum
      allowNull: false,
      comment:
        "Custom readable ID (e.g., TIC-2026-001). Backend-la auto-generate pannanum",
    },
    // 3. Ticket Core Info
    summary: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: "Ticket-oda title illa short summary",
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Problem-ah pathina full detail description",
    },
    // 4. Custom Attributes - Dynamic fields store panna
    customAttributes: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {},
      comment:
        "Admin set panna custom fields (Room No, Device Type, etc.) JSON-aa store aagum",
    },
    // 5. Attachments
    attachmentUrl: {
      type: DataTypes.JSON, // STRING-ku bathila JSON
      allowNull: true,
      defaultValue: [], // Default-ah empty array
      comment: "Contains array of objects: [{url, publicId, name, type}]",
    },

    // 6. Classification & Priority
    priority: {
      type: DataTypes.ENUM("High", "Medium", "Low"),
      defaultValue: "Medium",
      comment: "Ticket-oda urgent level",
    },
    status: {
      type: DataTypes.ENUM("open", "closed", "waiting"),
      defaultValue: "open",
      comment: "Ticket ippo entha stage-la irukku",
    },
    category: {
      type: DataTypes.STRING(100),
      defaultValue: "Unspecified",
      comment: "Hardware, Software, Network madhiri category",
    },
    phone: {
      type: DataTypes.STRING(25),
      allowNull: true,
      comment: "User contact panna secondary phone number",
    },
    // 7. Organization Relationships
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "organizations",
        key: "id",
      },
      comment: "Intha ticket entha company/branch-ku serthadhu",
    },
    orgSlug: {
      type: DataTypes.STRING(150),
      allowNull: false,
      comment: "Organization-oda short name (URL-kaga)",
    },
    // 8. Creator Info - Yaaru ticket-ah create pannunanga
    creatorId: {
      type: DataTypes.UUID,
      allowNull: true,
      comment: "Yaaru ticket-ah create pannunangalo avangaloda ID",
    },
    //OLD-- creator type
    // creatorType: {
    //   type: DataTypes.ENUM("admin", "portal_user", "employee"),
    //   allowNull: false,
    //   defaultValue: "portal_user",
    //   comment: "Ticket-ah create pannunadhu employee-ah illa customer-ah?",
    // },
    // Model File
    creatorType: {
      type: DataTypes.ENUM(
        "SUPER_ADMIN",
        "HDT_ADMIN",
        "HDT_MANAGER",
        "HDT_TECH",
        "ORG_ADMIN",
        "ORG_TECH",
        "portal_user",
      ),
      allowNull: false,
      defaultValue: "portal_user", // "portal_user" ku pathila ippo "USER"
      comment: "Ticket/Message create pannunadhu endha role user?",
    },
    creatorEmail: {
      type: DataTypes.STRING(150),
      allowNull: true,
      comment: "Creator-oda email address",
    },
    // 9. Assignment - Yaaru intha ticket-la work panna poranga
    assigneeId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "employee_administration",
        key: "id",
      },
      comment: "Employee table-la irukura Tech/Agent-oda ID",
    },
    adminId: {
      type: DataTypes.UUID,
      allowNull: false, // Account owner illama ticket irukka koodathu
      references: {
        model: "users",
        key: "id",
      },
      comment: "Intha organization-oda owner (Admin) yaaro avaroda ID",
    },
    assigneeName: {
      type: DataTypes.STRING(150),
      allowNull: true,
      defaultValue: "Unassigned",
      comment: "Performance-kaga name-ah ingeye cache panrom",
    },
    // 10. SLA & Timestamps
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    firstResponseAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    reopenCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    responseTime: { type: DataTypes.STRING(50), allowNull: true },
    closeTime: { type: DataTypes.DATE, allowNull: true },
  },
  {
    timestamps: true,
    tableName: "tickets",
    indexes: [
      // 1. Optimized filtering by Org and Status
      { fields: ["organizationId", "status"], name: "idx_org_status" },
      { fields: ["adminId"], name: "org_admin_id" },
      // 2. Slug lookup for portal URL access
      { fields: ["orgSlug"], name: "org_slug_index" },
      // 3. User level ticket filtering
      { fields: ["creatorId"], name: "creator_id_index" },
      // 4. Global unique Display ID (Very Important)
      { fields: ["displayId"], unique: true, name: "unique_display_id" },
      // 5. Tech/Agent assignment filtering
      { fields: ["assigneeId"], name: "assignee_id_index" },
      // 6. Cloudinary cleanup lookup
    ],
  },
);

// // Message-ah import pannaama keezha associations-la model name (String) use pannunga
// Ticket.hasMany(sequelize.models.Message, {
//   foreignKey: "ticketId",
//   as: "messages", // Query pannum podhu intha name-la data varum
// });

export default Ticket;
