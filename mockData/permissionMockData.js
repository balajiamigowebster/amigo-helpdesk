// --- MOCK DATA LOGIC ---
// Intha data thaan backend-la irunthu varatha imagine pannikonga
export const INITIAL_MOCK_DATA = {
  SUPER_ADMIN: {
    global_setting: { show: true, edit: true, disable: false, expiry: null },
    my_settings: { show: true, edit: true, disable: false, expiry: null },
    access_permission: { show: true, edit: true, disable: false, expiry: null },
    emp_administration: {
      show: true,
      edit: true,
      disable: false,
      expiry: null,
    },
    task_lists: { show: true, edit: true, disable: false, expiry: null },
    ticket_rules: { show: true, edit: true, disable: false, expiry: null },
    ticket_views: { show: true, edit: true, disable: false, expiry: null },
    canned_responses: { show: true, edit: true, disable: false, expiry: null },
  },
  HDT_ADMIN: {
    global_setting: {
      show: true,
      edit: true,
      disable: false,
      expiry: new Date(2026, 5, 20),
    },
    my_settings: { show: true, edit: true, disable: false, expiry: null },
    access_permission: {
      show: true,
      edit: false,
      disable: false,
      expiry: null,
    },
    emp_administration: {
      show: true,
      edit: true,
      disable: false,
      expiry: null,
    },
    task_lists: { show: true, edit: true, disable: false, expiry: null },
    ticket_rules: { show: true, edit: true, disable: false, expiry: null },
    ticket_views: { show: true, edit: true, disable: false, expiry: null },
    canned_responses: { show: true, edit: true, disable: false, expiry: null },
  },
  ORG_TECH: {
    global_setting: { show: false, edit: false, disable: true, expiry: null },
    my_settings: { show: true, edit: false, disable: false, expiry: null },
    access_permission: {
      show: false,
      edit: false,
      disable: true,
      expiry: null,
    },
    emp_administration: {
      show: false,
      edit: false,
      disable: true,
      expiry: null,
    },
    task_lists: { show: true, edit: false, disable: false, expiry: null },
    ticket_rules: { show: false, edit: false, disable: true, expiry: null },
    ticket_views: { show: true, edit: false, disable: false, expiry: null },
    canned_responses: { show: true, edit: false, disable: false, expiry: null },
  },
};
