import { cloudinary } from "@/lib/cloudinaryStorage";
import sequelize from "@/lib/config/db";
import { DataTypes } from "sequelize";

import { v4 as uuidv4 } from "uuid";

const Ticket = sequelize.define(
  "Ticket",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    // 1. Manual Inputs from Form
    summary: {
      type: DataTypes.TEXT,
      allowNull: false, // Form: Summary field
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false, // Form: Description field
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high"),
      defaultValue: "medium", // Form: Radio Group
    },
    status: {
      type: DataTypes.ENUM(
        "Open",
        "Waiting",
        "Closed",
        "Unassigned",
        "My Tickets",
        "All",
        "Active Alerts",
        "Past Due",
      ),
      defaultValue: "Open", // Initial status
    },

    // --- 📎 ATTACHMENT FIELDS (ADD THIS) ---
    attachmentUrl: {
      type: DataTypes.STRING,
      allowNull: true, // File illama kooda ticket create aagalaam
      defaultValue: null, // Default-ah empty
    },
    attachmentPublicId: {
      type: DataTypes.STRING,
      allowNull: true, // Cloudinary delete panna ithu kandippa venum
      defaultValue: null, // Default-ah empty
    },
    // 2. Automated Tracking Fields (Image-la irunthathu)
    responseTime: {
      type: DataTypes.DATE, // First response eppo pannom
      allowNull: true,
    },
    closeTime: {
      type: DataTypes.DATE, // Ticket eppo close aachu
      allowNull: true,
    },
    dueDate: {
      type: DataTypes.DATE, // SLA logic padi set panna vendiyathu
      allowNull: true,
    },
    // 3. Foreign Keys (Connections)
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "organizations",
        key: "id",
      },
    },
    creatorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    assigneeId: {
      type: DataTypes.UUID,
      allowNull: true, // Starting-la yaarum irukka matanga
      references: { model: "users", key: "id" },
    },
    category: {
      type: DataTypes.STRING,
      defaultValue: "Unspecified",
      validate: {
        // Intha list-la illatha ethai hacker anuppunaalum error kidaikkum
        isIn: {
          args: [
            [
              "Unspecified",
              "Email",
              "Hardware",
              "Maintenance",
              "Network",
              "Printer",
              "Software",
              "Other",
              "Mobile Issue",
            ],
          ],
          msg: "Invalid category selected. Please choose a valid option from the list.", // Professional English message
        },
      },
    },
    internalNotes: {
      type: DataTypes.TEXT, // Customer-ku ithu theriyaathu, Admin mattum paakalam
      allowNull: true,
    },
    source: {
      type: DataTypes.ENUM("Portal", "Email", "Agent Created"),
      defaultValue: "Portal",
    },
    tags: {
      type: DataTypes.JSON, // ['bug', 'payment'] mathiri store pannalam
      allowNull: true,
      defaultValue: [],
    },
    reopenCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    timestamps: true, // Created (createdAt) & Updated (updatedAt) automatic-ah kidaikkum
    tableName: "tickets",
    hooks: {
      beforeCreate: (ticket) => {
        const now = new Date();

        // Priority base panni logic
        if (ticket.priority === "high") {
          // Created at + 4 hours
          ticket.dueDate = new Date(now.getTime() + 4 * 60 * 60 * 1000);
        } else if (ticket.priority === "medium") {
          // Created at + 24 hours
          ticket.dueDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        } else if (ticket.priority === "low") {
          // Created at + 48 hours (Optional - for safety)
          ticket.dueDate = new Date(now.getTime() + 48 * 60 * 60 * 1000);
        }
      },
      // 2. 🛡️ Delete from Cloudinary when Ticket is deleted
      beforeDestroy: async (ticket) => {
        if (ticket.attachmentPublicId) {
          try {
            await cloudinary.uploader.destroy(ticket.attachmentPublicId);
          } catch (error) {
            console.error("Cloudinary Delete Error:", error);
          }
        }
      },
      // 3. 🛡️ Clean up old file when updating new one
      beforeUpdate: async (ticket) => {
        if (ticket.changed("attachmentPublicId")) {
          const oldId = ticket.previous("attachmentPublicId");
          if (oldId) {
            try {
              await cloudinary.uploader.destroy(oldId);
            } catch (error) {
              console.error("Cloudinary Update Cleanup Error:", error);
            }
          }
        }
      },
    },
  },
);

export default Ticket;
