import germanMessages from "ra-language-german";

export default {
  ...germanMessages,
  synapseadmin: {
    auth: {
      base_url: "Heimserver URL",
      welcome: "Willkommen bei Synapse-admin",
      username_error: "Bitte vollständigen Nutzernamen angeben: '@user:domain'",
      protocol_error: "Die URL muss mit 'http://' oder 'https://' beginnen",
      url_error: "Keine gültige Matrix Server URL",
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
      helper: {
        purge:
          "Alle lokalen Benutzer müssen den Raum verlassen haben, bevor er entfernt werden kann.",
      },
      action: {
        purge: "Säubere Raum",
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
    servernotices: {
      name: "Serverbenachrichtigungen",
      send: "Servernachricht versenden",
      fields: {
        body: "Nachricht",
      },
      action: {
        send: "Sende Nachricht",
        send_success: "Nachricht erfolgreich versendet.",
        send_failure: "Beim Versenden ist ein Fehler aufgetreten.",
      },
      helper: {
        send:
          'Sendet eine Serverbenachrichtigung an die ausgewählten Nutzer. Hierfür muss das Feature "Server Notices" auf dem Server aktiviert sein.',
      },
    },
  },
  ra: {
    ...germanMessages.ra,
    auth: {
      ...germanMessages.ra.auth,
      auth_check_error: "Anmeldung fehlgeschlagen",
    },
    input: {
      ...germanMessages.ra.input,
      password: {
        ...germanMessages.ra.input.password,
        toggle_hidden: "Anzeigen",
        toggle_visible: "Verstecken",
      },
    },
    notification: {
      ...germanMessages.ra.notifiaction,
      logged_out: "Abgemeldet",
    },
  },
};
