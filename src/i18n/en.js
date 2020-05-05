import englishMessages from "ra-language-english";

export default {
  ...englishMessages,
  synapseadmin: {
    auth: {
      base_url: "Homeserver URL",
      welcome: "Welcome to Synapse-admin",
      username_error: "Please enter fully qualified user ID: '@user:domain'",
      protocol_error: "URL has to start with 'http://' or 'https://'",
      url_error: "Not a valid Matrix server URL",
    },
    action: {
      save_and_show: "Create QR code",
      save_only: "Save",
      download_pdf: "Download PDF",
    },
    users: {
      invalid_user_id:
        "Must be a fully qualified Matrix user-id, e.g. @user_id:homeserver",
    },
    rooms: {
      details: "Room Details",
      room_name: "Room Name",
      make_public: "Make room public",
      room_name_required: "Must be provided",
      alias_required_if_public: "Must be provided for a public room",
      alias: "Alias",
      alias_too_long:
        "Must not exceed 255 bytes including the domain of the homeserver.",
    },
  },
  resources: {
    users: {
      backtolist: "Back to list",
      name: "User |||| Users",
      email: "Email",
      msisdn: "Phone",
      fields: {
        avatar: "Avatar",
        id: "User-ID",
        name: "Name",
        is_guest: "Guest",
        admin: "Admin",
        deactivated: "Deactivated",
        guests: "Show guests",
        show_deactivated: "Show deactivated users",
        user_id: "Search user",
        displayname: "Displayname",
        password: "Password",
        avatar_url: "Avatar URL",
        medium: "Medium",
        threepids: "3PIDs",
        address: "Address",
      },
      helper: {
        deactivate: "Deactivated users cannot be reactivated",
        erase: "Mark the user as GDPR-erased",
      },
      action: {
        erase: "Erase user data",
      },
    },
    rooms: {
      name: "Room |||| Rooms",
      fields: {
        room_id: "Room-ID",
        name: "Name",
        canonical_alias: "Alias",
        joined_members: "Members",
        invite_members: "Invite Members",

        invitees: "Invitations",
      },
    },
    connections: {
      name: "Connections",
      fields: {
        last_seen: "Date",
        ip: "IP address",
        user_agent: "User agent",
      },
    },
    servernotices: {
      name: "Server Notices",
      send: "Send server notices",
      fields: {
        body: "Message",
      },
      action: {
        send: "Send note",
        send_success: "Server notice successfully sent.",
        send_failure: "An error has occurred.",
      },
      helper: {
        send:
          'Sends a server notice to the selected users. The feature "Server Notices" has to be activated at the server.',
      },
    },
  },
};
