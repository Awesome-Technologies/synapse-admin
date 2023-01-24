import englishMessages from "ra-language-english";

const en = {
  ...englishMessages,
  synapseadmin: {
    auth: {
      base_url: "Homeserver URL",
      welcome: "Welcome to Synapse-admin",
      server_version: "Synapse version",
      username_error: "Please enter fully qualified user ID: '@user:domain'",
      protocol_error: "URL has to start with 'http://' or 'https://'",
      url_error: "Not a valid Matrix server URL",
      sso_sign_in: "Sign in with SSO",
    },
    users: {
      invalid_user_id: "Localpart of a Matrix user-id without homeserver.",
      tabs: { sso: "SSO" },
    },
    rooms: {
      tabs: {
        basic: "Basic",
        members: "Members",
        detail: "Details",
        permission: "Permissions",
      },
    },
    reports: { tabs: { basic: "Basic", detail: "Details" } },
  },
  import_users: {
    error: {
      at_entry: "At entry %{entry}: %{message}",
      error: "Error",
      required_field: "Required field '%{field}' is not present",
      invalid_value:
        "Invalid value on line %{row}. '%{field}' field may only be 'true' or 'false'",
      unreasonably_big:
        "Refused to load unreasonably big file of %{size} megabytes",
      already_in_progress: "An import run is already in progress",
      id_exits: "ID %{id} already present",
    },
    title: "Import users via CSV",
    goToPdf: "Go to PDF",
    cards: {
      importstats: {
        header: "Import users",
        users_total:
          "%{smart_count} user in CSV file |||| %{smart_count} users in CSV file",
        guest_count: "%{smart_count} guest |||| %{smart_count} guests",
        admin_count: "%{smart_count} admin |||| %{smart_count} admins",
      },
      conflicts: {
        header: "Conflict strategy",
        mode: {
          stop: "Stop on conflict",
          skip: "Show error and skip on conflict",
        },
      },
      ids: {
        header: "IDs",
        all_ids_present: "IDs present on every entry",
        count_ids_present:
          "%{smart_count} entry with ID |||| %{smart_count} entries with IDs",
        mode: {
          ignore: "Ignore IDs in CSV and create new ones",
          update: "Update existing records",
        },
      },
      passwords: {
        header: "Passwords",
        all_passwords_present: "Passwords present on every entry",
        count_passwords_present:
          "%{smart_count} entry with password |||| %{smart_count} entries with passwords",
        use_passwords: "Use passwords from CSV",
      },
      upload: {
        header: "Input CSV file",
        explanation:
          "Here you can upload a file with comma separated values that is processed to create or update users. The file must include the fields 'id' and 'displayname'. You can download and adapt an example file here: ",
      },
      startImport: {
        simulate_only: "Simulate only",
        run_import: "Import",
      },
      results: {
        header: "Import results",
        total:
          "%{smart_count} entry in total |||| %{smart_count} entries in total",
        successful: "%{smart_count} entries successfully imported",
        skipped: "%{smart_count} entries skipped",
        download_skipped: "Download skipped records",
        with_error:
          "%{smart_count} entry with errors ||| %{smart_count} entries with errors",
        simulated_only: "Run was only simulated",
      },
    },
  },
  resources: {
    users: {
      name: "User |||| Users",
      email: "Email",
      msisdn: "Phone",
      threepid: "Email / Phone",
      fields: {
        avatar: "Avatar",
        id: "User-ID",
        name: "Name",
        is_guest: "Guest",
        admin: "Server Administrator",
        deactivated: "Deactivated",
        guests: "Show guests",
        show_deactivated: "Show deactivated users",
        user_id: "Search user",
        displayname: "Displayname",
        password: "Password",
        avatar_url: "Avatar URL",
        avatar_src: "Avatar",
        medium: "Medium",
        threepids: "3PIDs",
        address: "Address",
        creation_ts_ms: "Creation timestamp",
        consent_version: "Consent version",
        auth_provider: "Provider",
        user_type: "User type",
      },
      helper: {
        password: "Changing password will log user out of all sessions.",
        deactivate: "You must provide a password to re-activate an account.",
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
        joined_local_members: "Local members",
        joined_local_devices: "Local devices",
        state_events: "State events / Complexity",
        version: "Version",
        is_encrypted: "Encrypted",
        encryption: "Encryption",
        federatable: "Federatable",
        public: "Visible in room directory",
        creator: "Creator",
        join_rules: "Join rules",
        guest_access: "Guest access",
        history_visibility: "History visibility",
        topic: "Topic",
        avatar: "Avatar",
      },
      helper: {
        forward_extremities:
          "Forward extremities are the leaf events at the end of a Directed acyclic graph (DAG) in a room, aka events that have no children. The more exist in a room, the more state resolution that Synapse needs to perform (hint: it's an expensive operation). While Synapse has code to prevent too many of these existing at one time in a room, bugs can sometimes make them crop up again. If a room has >10 forward extremities, it's worth checking which room is the culprit and potentially removing them using the SQL queries mentioned in #1760.",
      },
      enums: {
        join_rules: {
          public: "Public",
          knock: "Knock",
          invite: "Invite",
          private: "Private",
        },
        guest_access: {
          can_join: "Guests can join",
          forbidden: "Guests can not join",
        },
        history_visibility: {
          invited: "Since invited",
          joined: "Since joined",
          shared: "Since shared",
          world_readable: "Anyone",
        },
        unencrypted: "Unencrypted",
      },
      action: {
        erase: {
          title: "Delete room",
          content:
            "Are you sure you want to delete the room? This cannot be undone. All messages and shared media in the room will be deleted from the server!",
        },
      },
    },
    reports: {
      name: "Reported event |||| Reported events",
      fields: {
        id: "ID",
        received_ts: "report time",
        user_id: "announcer",
        name: "name of the room",
        score: "score",
        reason: "reason",
        event_id: "event ID",
        event_json: {
          origin: "origin server",
          origin_server_ts: "time of send",
          type: "event type",
          content: {
            msgtype: "content type",
            body: "content",
            format: "format",
            formatted_body: "formatted content",
            algorithm: "algorithm",
          },
        },
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
    devices: {
      name: "Device |||| Devices",
      fields: {
        device_id: "Device-ID",
        display_name: "Device name",
        last_seen_ts: "Timestamp",
        last_seen_ip: "IP address",
      },
      action: {
        erase: {
          title: "Removing %{id}",
          content: 'Are you sure you want to remove the device "%{name}"?',
          success: "Device successfully removed.",
          failure: "An error has occurred.",
        },
      },
    },
    users_media: {
      name: "Media",
      fields: {
        media_id: "Media ID",
        media_length: "File Size (in Bytes)",
        media_type: "Type",
        upload_name: "File name",
        quarantined_by: "Quarantined by",
        safe_from_quarantine: "Safe from quarantine",
        created_ts: "Created",
        last_access_ts: "Last access",
      },
    },
    delete_media: {
      name: "Media",
      fields: {
        before_ts: "last access before",
        size_gt: "Larger then (in bytes)",
        keep_profiles: "Keep profile images",
      },
      action: {
        send: "Delete media",
        send_success: "Request successfully sent.",
        send_failure: "An error has occurred.",
      },
      helper: {
        send: "This API deletes the local media from the disk of your own server. This includes any local thumbnails and copies of media downloaded. This API will not affect media that has been uploaded to external media repositories.",
      },
    },
    protect_media: {
      action: {
        create: "Unprotected, create protection",
        delete: "Protected, remove protection",
        none: "In quarantine",
        send_success: "Successfully changed the protection status.",
        send_failure: "An error has occurred.",
      },
    },
    quarantine_media: {
      action: {
        name: "Quarantine",
        create: "Add to quarantine",
        delete: "In quarantine, unquarantine",
        none: "Protected from quarantine",
        send_success: "Successfully changed the quarantine status.",
        send_failure: "An error has occurred.",
      },
    },
    pushers: {
      name: "Pusher |||| Pushers",
      fields: {
        app: "App",
        app_display_name: "App display name",
        app_id: "App ID",
        device_display_name: "Device display name",
        kind: "Kind",
        lang: "Language",
        profile_tag: "Profile tag",
        pushkey: "Pushkey",
        data: { url: "URL" },
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
        send: 'Sends a server notice to the selected users. The feature "Server Notices" has to be activated at the server.',
      },
    },
    user_media_statistics: {
      name: "Users' media",
      fields: {
        media_count: "Media count",
        media_length: "Media length",
      },
    },
    forward_extremities: {
      name: "Forward Extremities",
      fields: {
        id: "Event ID",
        received_ts: "Timestamp",
        depth: "Depth",
        state_group: "State group",
      },
    },
    room_state: {
      name: "State events",
      fields: {
        type: "Type",
        content: "Content",
        origin_server_ts: "time of send",
        sender: "Sender",
      },
    },
    room_directory: {
      name: "Room directory",
      fields: {
        world_readable: "guest users may view without joining",
        guest_can_join: "guest users may join",
      },
      action: {
        title:
          "Delete room from directory |||| Delete %{smart_count} rooms from directory",
        content:
          "Are you sure you want to remove this room from directory? |||| Are you sure you want to remove these %{smart_count} rooms from directory?",
        erase: "Delete from room directory",
        create: "Publish in room directory",
        send_success: "Room successfully published.",
        send_failure: "An error has occurred.",
      },
    },
    destinations: {
      name: "Federation",
      fields: {
        destination: "Destination",
        failure_ts: "Failure timestamp",
        retry_last_ts: "Last retry timestamp",
        retry_interval: "Retry interval",
        last_successful_stream_ordering: "Last successful stream",
        stream_ordering: "Stream",
      },
      action: { reconnect: "Reconnect" },
    },
  },
  registration_tokens: {
    name: "Registration tokens",
    fields: {
      token: "Token",
      valid: "Valid token",
      uses_allowed: "Uses allowed",
      pending: "Pending",
      completed: "Completed",
      expiry_time: "Expiry time",
      length: "Length",
    },
    helper: { length: "Length of the token if no token is given." },
  },
};
export default en;
