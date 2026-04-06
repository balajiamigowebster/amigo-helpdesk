// Inga innum 50 models vanthaalum line-ah add pannikalam
// import Product from "./ProductModels/Product";

import CustomAttribute from "./models/Organization/CustomAttribute";
import EmployeeOrganizations from "./models/Organization/EmployeeOrganizations";
import GeneralSettings from "./models/Organization/GeneralSettings";
import Organization from "./models/Organization/Organization";
import TicketCategory from "./models/Organization/TicketCategory";
import UserManagement from "./models/Organization/UserManagement";
import EmployeeAdministration from "./models/settings/EmployeeAdministration/EmployeeAdministration";
import Message from "./models/tickets/Message";
import Ticket from "./models/tickets/Ticket";
import OTP from "./models/UserModels/OtpModel";
import User from "./models/UserModels/User";

// --- STEP 1: DEFINE ASSOCIATIONS HERE ---
// User and Organization relationship
User.hasOne(Organization, {
  foreignKey: "adminId",
  as: "MyOrganization",
});

Organization.belongsTo(User, {
  foreignKey: "adminId",
  as: "Admin",
});

// 2. Ticket and User (Creator) Relationship
// Oru user nariya tickets create pannalam

UserManagement.hasMany(Ticket, {
  foreignKey: "creatorId",
  as: "CreatedTickets",
});

Ticket.belongsTo(UserManagement, {
  foreignKey: "creatorId",
  as: "Creator",
});

// 3. Ticket and User (Assignee) Relationship
// Oru agent/user-ku nariya tickets assign aagalam

UserManagement.hasMany(Ticket, {
  foreignKey: "assigneeId",
  as: "AssignedTickets",
});
Ticket.belongsTo(UserManagement, { foreignKey: "assigneeId", as: "Assignee" });

// 4. Ticket and Organization Relationship
// Oru organization-kulla pala tickets irukkum
Organization.hasMany(Ticket, {
  foreignKey: "organizationId",
  as: "OrgTickets",
});
Ticket.belongsTo(Organization, {
  foreignKey: "organizationId",
  as: "Organization",
});

// // 5. Ticket and Message (Chat/Activity) - Ippo inga associate panrom
// Ticket.hasMany(Message, { foreignKey: "ticketId", as: "messages" });
// Message.belongsTo(Ticket, { foreignKey: "ticketId", as: "ticket" });

User.hasMany(EmployeeAdministration, {
  foreignKey: "ownerId",
  as: "MyEmployees",
});

EmployeeAdministration.belongsTo(User, {
  foreignKey: "ownerId",
  as: "Owner",
});

// Organization and GeneralSettings relationship (Phase 1 Logic)
Organization.hasOne(GeneralSettings, {
  foreignKey: "orgId",
  as: "Settings",
  onDelete: "CASCADE",
});

GeneralSettings.belongsTo(Organization, {
  foreignKey: "orgId",
});

// 6. Ticket and Admin (User Model) Relationship
// Idhu dhaan neenga GET method-la "AdminCreator" alias-ah use panna kaaranam
Ticket.belongsTo(User, {
  foreignKey: "adminId", // Ticket table-la irukura adminId
  as: "AdminCreator", // GET include-la neenga use panna same alias
});

User.hasMany(Ticket, {
  foreignKey: "adminId",
  as: "AdminTickets",
});

// Ticket and Employee (Assignee) Relationship
// Oru employee-ku pala tickets assign aagalam
EmployeeAdministration.hasMany(Ticket, {
  foreignKey: "assigneeId", // Ticket table-la irukura column
  as: "AssignedTickets",
});

Ticket.belongsTo(EmployeeAdministration, {
  foreignKey: "assigneeId",
  as: "AssigneeEmployee", // API-la neenga use pandra alias ithu thaan
});

//  Ticket and Message (Chat/Activity) - Ippo inga associate panrom

Organization.hasMany(TicketCategory, {
  foreignKey: "orgId",
  as: "Categories",
});

TicketCategory.belongsTo(Organization, {
  foreignKey: "orgId",
  as: "Organization",
});

// / Ticket has many Messages
// onDelete: CASCADE kandaipa venum, ticket azhinjaa chat-um azhiyanum
Ticket.hasMany(Message, {
  foreignKey: "ticketId",
  as: "messages",
  onDelete: "CASCADE",
});

Message.belongsTo(Ticket, {
  foreignKey: "ticketId",
  as: "ticket",
});

// 1. Many-to-Many: Employee and Organization
// Intha association thaan oru employee pala org-layum,
// oru org-la pala employees-aiyum link pannum.
EmployeeAdministration.belongsToMany(Organization, {
  through: EmployeeOrganizations,
  foreignKey: "employeeId",
  otherKey: "organizationId",
  as: "Organizations", // Employee.findAll({ include: 'Organizations' }) nu use pannalam
});

Organization.belongsToMany(EmployeeAdministration, {
  through: EmployeeOrganizations,
  foreignKey: "organizationId",
  otherKey: "employeeId",
  as: "Employees", // Org.findAll({ include: 'Employees' }) nu use pannalam
});

// Optional: Intha junction table-ai direct-ah query panna intha connection-um help-ah irukkum
EmployeeAdministration.hasMany(EmployeeOrganizations, {
  foreignKey: "employeeId",
});
EmployeeOrganizations.belongsTo(EmployeeAdministration, {
  foreignKey: "employeeId",
});

Organization.hasMany(EmployeeOrganizations, { foreignKey: "organizationId" });
EmployeeOrganizations.belongsTo(Organization, { foreignKey: "organizationId" });

// Organization has many UserManagement (Contacts/Portal Users)
Organization.hasMany(UserManagement, {
  foreignKey: "orgId", // UserManagement table-la irukura org reference column
  as: "Contacts",
});

UserManagement.belongsTo(Organization, {
  foreignKey: "orgId",
  as: "Organization",
});

// Organization and CustomAttribute Relationship
// Oru organization-ku pala custom fields/attributes irukkalaam
Organization.hasMany(CustomAttribute, {
  foreignKey: "orgId", // Unga CustomAttribute table-la irukura column name (check pannikonga)
  as: "Attributes", // API include-la use pandra same alias
  onDelete: "CASCADE",
});

CustomAttribute.belongsTo(Organization, {
  foreignKey: "orgId",
  as: "Organization",
});

const models = {
  User,
  OTP,
  Organization,
  Ticket,
  Message,
  UserManagement,
  EmployeeAdministration,
  GeneralSettings,
  TicketCategory,
  EmployeeOrganizations,
};

export {
  User,
  OTP,
  Organization,
  Ticket,
  Message,
  UserManagement,
  EmployeeAdministration,
  GeneralSettings,
  TicketCategory,
  EmployeeOrganizations,
};
export default models;
