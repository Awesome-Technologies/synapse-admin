import { formalGermanMessages } from "@haleos/ra-language-german";

import { SynapseTranslationMessages } from ".";

const de: SynapseTranslationMessages = {
  ...formalGermanMessages,
  ra: {
    ...formalGermanMessages.ra,
    navigation: {
      ...formalGermanMessages.ra.navigation,
      no_filtered_results: "Keine Ergebnisse",
      clear_filters: "Alle Filter entfernen",
    },
  },
  synapseadmin: {
    auth: {
      base_url: "Heimserver URL",
      welcome: "Willkommen bei Synapse-admin",
      server_version: "Synapse Version",
      supports_specs: "unterstützt Matrix-Specs",
      username_error: "Bitte vollständigen Nutzernamen angeben: '@user:domain'",
      protocol_error: "Die URL muss mit 'http://' oder 'https://' beginnen",
      url_error: "Keine gültige Matrix Server URL",
      sso_sign_in: "Anmeldung mit SSO",
    },
    users: {
      invalid_user_id: "Lokaler Anteil der Matrix Benutzer-ID ohne Homeserver.",
      tabs: { sso: "SSO" },
    },
    rooms: {
      details: "Raumdetails",
      tabs: {
        basic: "Allgemein",
        members: "Mitglieder",
        detail: "Details",
        permission: "Berechtigungen",
      },
    },
    reports: { tabs: { basic: "Allgemein", detail: "Details" } },
  },
  import_users: {
    error: {
      at_entry: "Bei Eintrag %{entry}: %{message}",
      error: "Fehler",
      required_field: "Pflichtfeld '%{field}' fehlt",
      invalid_value:
        "Ungültiger Wert in Zeile %{row}. Feld '%{field}' darf nur die Werte 'true' oder 'false' enthalten",
      unreasonably_big: "Datei ist zu groß für den Import (%{size} Megabytes)",
      already_in_progress: "Es läuft bereits ein Import",
      id_exits: "ID %{id} existiert bereits",
    },
    title: "Benutzer aus CSV importieren",
    goToPdf: "Gehe zum PDF",
    cards: {
      importstats: {
        header: "Benutzer importieren",
        users_total: "%{smart_count} Benutzer in der CSV Datei |||| %{smart_count} Benutzer in der CSV Datei",
        guest_count: "%{smart_count} Gast |||| %{smart_count} Gäste",
        admin_count: "%{smart_count} Server Administrator |||| %{smart_count} Server Administratoren",
      },
      conflicts: {
        header: "Konfliktstrategie",
        mode: {
          stop: "Stoppe bei Fehlern",
          skip: "Zeige Fehler und überspringe fehlerhafte Einträge",
        },
      },
      ids: {
        header: "IDs",
        all_ids_present: "IDs in jedem Eintrag vorhanden",
        count_ids_present: "%{smart_count} Eintrag mit ID |||| %{smart_count} Einträge mit IDs",
        mode: {
          ignore: "Ignoriere IDs der CSV-Datei und erstelle neue",
          update: "Aktualisiere existierende Benutzer",
        },
      },
      passwords: {
        header: "Passwörter",
        all_passwords_present: "Passwörter in jedem Eintrag vorhanden",
        count_passwords_present: "%{smart_count} Eintrag mit Passwort |||| %{smart_count} Einträge mit Passwörtern",
        use_passwords: "Verwende Passwörter aus der CSV Datei",
      },
      upload: {
        header: "CSV Datei importieren",
        explanation:
          "Hier können Sie eine Datei mit kommagetrennten Daten hochladen, die verwendet werden um Benutzer anzulegen oder zu ändern. Die Datei muss mindestens die Felder 'id' und 'displayname' enthalten. Hier können Sie eine Beispieldatei herunterladen und anpassen: ",
      },
      startImport: {
        simulate_only: "Nur simulieren",
        run_import: "Importieren",
      },
      results: {
        header: "Ergebnis",
        total: "%{smart_count} Eintrag insgesamt |||| %{smart_count} Einträge insgesamt",
        successful: "%{smart_count} Einträge erfolgreich importiert",
        skipped: "%{smart_count} Einträge übersprungen",
        download_skipped: "Übersprungene Einträge herunterladen",
        with_error: "%{smart_count} Eintrag mit Fehlern ||| %{smart_count} Einträge mit Fehlern",
        simulated_only: "Import-Vorgang war nur simuliert",
      },
    },
  },
  delete_media: {
    name: "Medien",
    fields: {
      before_ts: "Letzter Zugriff vor",
      size_gt: "Größer als (in Bytes)",
      keep_profiles: "Behalte Profilbilder",
    },
    action: {
      send: "Medien löschen",
      send_success: "Anfrage erfolgreich versendet.",
      send_failure: "Beim Versenden ist ein Fehler aufgetreten.",
    },
    helper: {
      send: "Diese API löscht die lokalen Medien von der Festplatte des eigenen Servers. Dies umfasst alle lokalen Miniaturbilder und Kopien von Medien. Diese API wirkt sich nicht auf Medien aus, die sich in externen Medien-Repositories befinden.",
    },
  },
  resources: {
    users: {
      name: "Benutzer",
      email: "E-Mail",
      msisdn: "Telefon",
      threepid: "E-Mail / Telefon",
      fields: {
        avatar: "Avatar",
        id: "Benutzer-ID",
        name: "Name",
        is_guest: "Gast",
        admin: "Server Administrator",
        locked: "Gesperrt",
        deactivated: "Deaktiviert",
        erased: "Gelöscht",
        guests: "Zeige Gäste",
        show_deactivated: "Zeige deaktivierte Benutzer",
        user_id: "Suche Benutzer",
        displayname: "Anzeigename",
        password: "Passwort",
        avatar_url: "Avatar URL",
        avatar_src: "Avatar",
        medium: "Medium",
        threepids: "3PIDs",
        address: "Adresse",
        creation_ts_ms: "Zeitpunkt der Erstellung",
        consent_version: "Zugestimmte Geschäftsbedingungen",
        auth_provider: "Provider",
        user_type: "Benutzertyp",
      },
      helper: {
        password: "Durch die Änderung des Passworts wird der Benutzer von allen Sitzungen abgemeldet.",
        deactivate: "Sie müssen ein Passwort angeben, um ein Konto wieder zu aktivieren.",
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
        joined_local_members: "Lokale Mitglieder",
        joined_local_devices: "Lokale Endgeräte",
        state_events: "Zustandsereignisse / Komplexität",
        version: "Version",
        is_encrypted: "Verschlüsselt",
        encryption: "Verschlüsselungs-Algorithmus",
        federatable: "Fö­de­rierbar",
        public: "Sichtbar im Raumverzeichnis",
        creator: "Ersteller",
        join_rules: "Beitrittsregeln",
        guest_access: "Gastzugriff",
        history_visibility: "Historie-Sichtbarkeit",
        topic: "Thema",
        avatar: "Avatar",
      },
      helper: {
        forward_extremities:
          "Forward extremities are the leaf events at the end of a Directed acyclic graph (DAG) in a room, aka events that have no children. The more exist in a room, the more state resolution that Synapse needs to perform (hint: it's an expensive operation). While Synapse has code to prevent too many of these existing at one time in a room, bugs can sometimes make them crop up again. If a room has >10 forward extremities, it's worth checking which room is the culprit and potentially removing them using the SQL queries mentioned in #1760.",
      },
      enums: {
        join_rules: {
          public: "Öffentlich",
          knock: "Auf Anfrage",
          invite: "Nur auf Einladung",
          private: "Privat",
        },
        guest_access: {
          can_join: "Gäste können beitreten",
          forbidden: "Gäste können nicht beitreten",
        },
        history_visibility: {
          invited: "Ab Einladung",
          joined: "Ab Beitritt",
          shared: "Ab Setzen der Einstellung",
          world_readable: "Jeder",
        },
        unencrypted: "Nicht verschlüsselt",
      },
      action: {
        erase: {
          title: "Raum löschen",
          content:
            "Sind Sie sicher dass Sie den Raum löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden. Alle Nachrichten und Medien, die der Raum beinhaltet werden vom Server gelöscht!",
        },
      },
    },
    reports: {
      name: "Gemeldetes Ereignis |||| Gemeldete Ereignisse",
      fields: {
        id: "ID",
        received_ts: "Meldezeit",
        user_id: "Meldender",
        name: "Raumname",
        score: "Wert",
        reason: "Grund",
        event_id: "Event-ID",
        event_json: {
          origin: "Ursprungsserver",
          origin_server_ts: "Sendezeit",
          type: "Eventtyp",
          content: {
            msgtype: "Inhaltstyp",
            body: "Nachrichteninhalt",
            format: "Nachrichtenformat",
            formatted_body: "Formatierter Nachrichteninhalt",
            algorithm: "Verschlüsselungsalgorithmus",
            info: {
              mimetype: "Typ",
            },
            url: "URL",
          },
        },
      },
      action: {
        erase: {
          title: "Gemeldetes Event löschen",
          content:
            "Sind Sie sicher dass Sie das gemeldete Event löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.",
        },
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
    devices: {
      name: "Gerät |||| Geräte",
      fields: {
        device_id: "Geräte-ID",
        display_name: "Gerätename",
        last_seen_ts: "Zeitstempel",
        last_seen_ip: "IP-Adresse",
      },
      action: {
        erase: {
          title: "Entferne %{id}",
          content: 'Möchten Sie das Gerät "%{name}" wirklich entfernen?',
          success: "Gerät erfolgreich entfernt.",
          failure: "Beim Entfernen ist ein Fehler aufgetreten.",
        },
      },
    },
    users_media: {
      name: "Medien",
      fields: {
        media_id: "Medien ID",
        media_length: "Größe",
        media_type: "Typ",
        upload_name: "Dateiname",
        quarantined_by: "Zur Quarantäne hinzugefügt",
        safe_from_quarantine: "Schutz vor Quarantäne",
        created_ts: "Erstellt",
        last_access_ts: "Letzter Zugriff",
      },
      action: {
        open: "Mediendatei in neuem Fenster öffnen",
      },
    },
    protect_media: {
      action: {
        create: "Ungeschützt, Schutz erstellen",
        delete: "Geschützt, Schutz aufheben",
        none: "In Quarantäne",
        send_success: "Erfolgreich den Schutz-Status geändert.",
        send_failure: "Beim Versenden ist ein Fehler aufgetreten.",
      },
    },
    quarantine_media: {
      action: {
        name: "Quarantäne",
        create: "Zur Quarantäne hinzufügen",
        delete: "In Quarantäne, Quarantäne aufheben",
        none: "Geschützt vor Quarantäne",
        send_success: "Erfolgreich den Quarantäne-Status geändert.",
        send_failure: "Beim Versenden ist ein Fehler aufgetreten.",
      },
    },
    pushers: {
      name: "Pusher |||| Pushers",
      fields: {
        app: "App",
        app_display_name: "App-Anzeigename",
        app_id: "App ID",
        device_display_name: "Geräte-Anzeigename",
        kind: "Art",
        lang: "Sprache",
        profile_tag: "Profil-Tag",
        pushkey: "Pushkey",
        data: { url: "URL" },
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
        send: 'Sendet eine Serverbenachrichtigung an die ausgewählten Nutzer. Hierfür muss das Feature "Server Notices" auf dem Server aktiviert sein.',
      },
    },
    user_media_statistics: {
      name: "Dateien je Benutzer",
      fields: {
        media_count: "Anzahl der Dateien",
        media_length: "Größe der Dateien",
      },
    },
    forward_extremities: {
      name: "Vorderextremitäten",
      fields: {
        id: "Event-ID",
        received_ts: "Zeitstempel",
        depth: "Tiefe",
        state_group: "Zustandsgruppe",
      },
    },
    room_state: {
      name: "Zustandsereignisse",
      fields: {
        type: "Typ",
        content: "Inhalt",
        origin_server_ts: "Sendezeit",
        sender: "Absender",
      },
    },
    room_directory: {
      name: "Raumverzeichnis",
      fields: {
        world_readable: "Gastbenutzer dürfen ohne Beitritt lesen",
        guest_can_join: "Gastbenutzer dürfen beitreten",
      },
      action: {
        title: "Raum aus Verzeichnis löschen |||| %{smart_count} Räume aus Verzeichnis löschen",
        content:
          "Möchten Sie den Raum wirklich aus dem Raumverzeichnis löschen? |||| Möchten Sie die %{smart_count} Räume wirklich aus dem Raumverzeichnis löschen?",
        erase: "Lösche aus Verzeichnis",
        create: "Eintragen ins Verzeichnis",
        send_success: "Raum erfolgreich eingetragen.",
        send_failure: "Beim Entfernen ist ein Fehler aufgetreten.",
      },
    },
    destinations: {
      name: "Föderation",
      fields: {
        destination: "Ziel",
        failure_ts: "Fehlerzeitpunkt",
        retry_last_ts: "Letzter Wiederholungsversuch",
        retry_interval: "Wiederholungsintervall",
        last_successful_stream_ordering: "letzte erfogreicher Stream",
        stream_ordering: "Stream",
      },
      action: { reconnect: "Neu verbinden" },
    },
    registration_tokens: {
      name: "Registrierungstoken",
      fields: {
        token: "Token",
        valid: "Gültige Token",
        uses_allowed: "Anzahl",
        pending: "Ausstehend",
        completed: "Abgeschlossen",
        expiry_time: "Ablaufzeit",
        length: "Länge",
      },
      helper: { length: "Länge des Tokens, wenn kein Token vorgegeben wird." },
    },
  },
};
export default de;
