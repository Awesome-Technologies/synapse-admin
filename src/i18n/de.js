import germanMessages from "ra-language-german";

export default {
  ...germanMessages,
  synapseadmin: {
    auth: {
      homeserver: "Heimserver",
      welcome: "Willkommen bei Synapse-admin",
    },
    action: {
      save_and_show: "Speichern und QR Code erzeugen",
      save_only: "Nur speichern",
      download_pdf: "PDF speichern",
    },
    users: {
      invalid_user_id:
        "Muss eine vollständige Matrix Benutzer-ID sein, z.B. @benutzer_id:homeserver",
    },
    rooms: {
      details: "Raumdetails",
      room_name: "Raumname",
      make_public: "Öffentlicher Raum",
      room_name_required: "Muss angegeben werden",
      alias_required_if_public: "Muss für öffentliche Räume angegeben werden.",
      alias: "Alias",
      alias_too_long:
        "Darf zusammen mit der Domain des Homeservers 255 bytes nicht überschreiten",
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
      helper: {
        deactivate: "Deaktivierte Nutzer können nicht wieder aktiviert werden.",
        erase: "DSGVO konformes Löschen der Benutzerdaten",
      },
      action: {
        erase: "Lösche Benutzerdaten",
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
  ra: {
    ...germanMessages.ra,
    input: {
      ...germanMessages.ra.input,
      password: {
        ...germanMessages.ra.input.password,
        toggle_hidden: "Anzeigen",
        toggle_visible: "Verstecken",
      },
    },
  },
};
