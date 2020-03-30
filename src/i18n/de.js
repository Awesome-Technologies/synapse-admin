import germanMessages from "ra-language-german";

export default {
  ...germanMessages,
  synapseadmin: {
    auth: {
      homeserver: "Heimserver",
      welcome: "Willkommen bei Synapse-admin",
    },
    users: {
      invalid_user_id:
        "Muss eine vollständige Matrix Benutzer-ID sein, z.B. @benutzer_id:homeserver",
    },
  },
  resources: {
    users: {
      backtolist: "Zurück zur Liste",
      name: "Benutzer",
      email: "E-Mail",
      msisdn: "Telefon",
      fields: {
        avatar: "Avatar",
        id: "Benutzer-ID",
        name: "Name",
        is_guest: "Gast",
        admin: "Admin",
        deactivated: "Deaktiviert",
        guests: "Zeige Gäste",
        show_deactivated: "Zeige deaktivierte Benutzer",
        user_id: "Suche Benutzer",
        displayname: "Anzeigename",
        password: "Passwort",
        avatar_url: "Avatar URL",
        medium: "Medium",
        threepids: "3PIDs",
        address: "Adresse",
      },
    },
    rooms: {
      name: "Raum |||| Räume",
      fields: {
        room_id: "Raum-ID",
        name: "Name",
        canonical_alias: "Alias",
        joined_members: "Mitglieder",
      },
    },
    connections: {
      name: "Verbindungen",
      fields: {
        last_seen: "Datum",
        ip: "IP-Adresse",
        user_agent: "User Agent",
      },
    },
  },
};
