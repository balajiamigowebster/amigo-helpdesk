import { DataTypes } from "sequelize";
import sequelize from "@/lib/config/db";
import { v4 as uuidv4 } from "uuid";

const Message = sequelize.define(
  "Message",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
      comment: "Unique message/activity ID",
    },
    ticketId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "tickets",
        key: "id",
      },
      onDelete: "CASCADE",
      comment: "Entha ticket-oda chat/activity idhu?",
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      comment: "Sender-oda ID (User ID or Employee ID)",
    },
    senderName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      comment: "Display name (e.g., John or Support Team)",
    },
    senderMail: {
      type: DataTypes.STRING(255),
      allowNull: true, // Activity-ku mail illama irukalam, so null allow panrom
      // validate: { isEmail: true },
      comment: "Sender-oda email address",
    },
    // --- UPDATED ROLES ---
    senderRole: {
      type: DataTypes.ENUM(
        "SUPER_ADMIN",
        "HDT_ADMIN",
        "HDT_MANAGER",
        "HDT_TECH",
        "ORG_ADMIN",
        "ORG_TECH",
        "USER", // User portal-la irundhu message vara idhu kandaipa venum
      ),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Chat message content or Activity description",
    },

    // --- VISIBILITY & LOGIC FIELDS ---
    isPrivate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: "True-na OrgAdmin/Tech-ku mattum theriyum. User-ku theriyaathu.",
    },
    showToUser: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment:
        "Activity-ah iruntha, athu user portal-la show pannanuma venama-nu control panna.",
    },

    // --- ACTIVITY TRACKING ---
    // MySQL/MariaDB-kaga JSONB-la irundhu JSON-ku mathiyachu
    activityMeta: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: "Status change details like { from: 'open', to: 'closed' }",
    },
    // --- ATTACHMENTS (Cloudinary Logic) ---
    attachmentUrl: {
      type: DataTypes.JSON, // STRING array-ku bathila full JSON Object array
      allowNull: true,
      defaultValue: null,
      comment: "Contains array of objects: [{url, publicId, name, type, size}]",
    },
    attachmentPublicId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Cloudinary-la irundhu delete panna intha ID mukkiyam",
    },
    attachmentType: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM("message", "activity"),
      defaultValue: "message",
    },
  },
  {
    timestamps: true,
    tableName: "messages",
    indexes: [
      { fields: ["ticketId"], name: "idx_msg_ticket_id" },
      { fields: ["senderId"], name: "idx_msg_sender_id" },
      { fields: ["type"], name: "idx_msg_type" },
      { fields: ["isPrivate"], name: "idx_msg_is_private" }, // Filter panna easy-ah irukum
      { fields: ["createdAt"], name: "idx_msg_created_at" },
    ],
  },
);

// // Ticket-ah import pannaama keezha associations-la model name (String) use pannunga
// Message.belongsTo(sequelize.models.Ticket, {
//   foreignKey: "ticketId",
//   as: "ticket",
// });

export default Message;
