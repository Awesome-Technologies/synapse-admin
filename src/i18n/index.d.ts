import { TranslationMessages } from "ra-core";

interface SynapseTranslationMessages extends TranslationMessages {
  synapseadmin: {
    auth: {
      base_url: string;
      welcome: string;
      server_version: string;
      supports_specs?: string; // TODO: fa, fr, it, zh
      username_error: string;
      protocol_error: string;
      url_error: string;
      sso_sign_in: string;
    };
    users: {
      invalid_user_id: string;
      tabs: { sso: string };
    };
    rooms: {
      details?: string; // TODO: fa, fr, it, zh
      tabs: {
        basic: string;
        members: string;
        detail: string;
        permission: string;
      };
    };
    reports: { tabs: { basic: string; detail: string } };
  };
  import_users: {
    error: {
      at_entry: string;
      error: string;
      required_field: string;
      invalid_value: string;
      unreasonably_big: string;
      already_in_progress: string;
      id_exits: string;
    };
    title: string;
    goToPdf: string;
    cards: {
      importstats: {
        header: string;
        users_total: string;
        guest_count: string;
        admin_count: string;
      };
      conflicts: {
        header: string;
        mode: {
          stop: string;
          skip: string;
        };
      };
      ids: {
        header: string;
        all_ids_present: string;
        count_ids_present: string;
        mode: {
          ignore: string;
          update: string;
        };
      };
      passwords: {
        header: string;
        all_passwords_present: string;
        count_passwords_present: string;
        use_passwords: string;
      };
      upload: {
        header: string;
        explanation: string;
      };
      startImport: {
        simulate_only: string;
        run_import: string;
      };
      results: {
        header: string;
        total: string;
        successful: string;
        skipped: string;
        download_skipped: string;
        with_error: string;
        simulated_only: string;
      };
    };
  };
  delete_media: {
    name: string;
    fields: {
      before_ts: string;
      size_gt: string;
      keep_profiles: string;
    };
    action: {
      send: string;
      send_success: string;
      send_failure: string;
    };
    helper: {
      send: string;
    };
  };
  resources: {
    users: {
      name: string;
      email: string;
      msisdn: string;
      threepid: string;
      fields: {
        avatar: string;
        id: string;
        name: string;
        is_guest: string;
        admin: string;
        locked?: string; // TODO: fa, zh
        deactivated: string;
        erased?: string; // TODO: fa, fr, it, zh
        guests: string;
        show_deactivated: string;
        show_locked?: string; // TODO: de, fa, fr, it, zh
        user_id: string;
        displayname: string;
        password: string;
        avatar_url: string;
        avatar_src: string;
        medium: string;
        threepids: string;
        address: string;
        creation_ts_ms: string;
        consent_version: string;
        auth_provider?: string;
        user_type?: string;
      };
      helper: {
        password?: string;
        deactivate: string;
        erase: string;
      };
      action: {
        erase: string;
      };
    };
    rooms: {
      name: string;
      fields: {
        room_id: string;
        name: string;
        canonical_alias: string;
        joined_members: string;
        joined_local_members: string;
        joined_local_devices?: string;
        state_events: string;
        version: string;
        is_encrypted: string;
        encryption: string;
        federatable: string;
        public: string;
        creator: string;
        join_rules: string;
        guest_access: string;
        history_visibility: string;
        topic?: string;
        avatar?: string;
      };
      helper?: {
        forward_extremities: string;
      };
      enums: {
        join_rules: {
          public: string;
          knock: string;
          invite: string;
          private: string;
        };
        guest_access: {
          can_join: string;
          forbidden: string;
        };
        history_visibility: {
          invited: string;
          joined: string;
          shared: string;
          world_readable: string;
        };
        unencrypted: string;
      };
      action?: {
        erase: {
          title: string;
          content: string;
        };
      };
    };
    reports: {
      name: string;
      fields: {
        id: string;
        received_ts: string;
        user_id: string;
        name: string;
        score: string;
        reason: string;
        event_id: string;
        event_json: {
          origin: string;
          origin_server_ts: string;
          type: string;
          content: {
            msgtype: string;
            body: string;
            format: string;
            formatted_body: string;
            algorithm: string;
            url?: string;
            info?: {
              mimetype: string;
            };
          };
        };
      };
      action?: {
        erase: {
          title: string;
          content: string;
        };
      };
    };
    connections: {
      name: string;
      fields: {
        last_seen: string;
        ip: string;
        user_agent: string;
      };
    };
    devices: {
      name: string;
      fields: {
        device_id: string;
        display_name: string;
        last_seen_ts: string;
        last_seen_ip: string;
      };
      action: {
        erase: {
          title: string;
          content: string;
          success: string;
          failure: string;
        };
      };
    };
    users_media: {
      name: string;
      fields: {
        media_id: string;
        media_length: string;
        media_type: string;
        upload_name: string;
        quarantined_by: string;
        safe_from_quarantine: string;
        created_ts: string;
        last_access_ts: string;
      };
      action?: {
        open: string;
      };
    };
    protect_media?: {
      action: {
        create: string;
        delete: string;
        none: string;
        send_success: string;
        send_failure: string;
      };
    };
    quarantine_media?: {
      action: {
        name: string;
        create: string;
        delete: string;
        none: string;
        send_success: string;
        send_failure: string;
      };
    };
    pushers: {
      name: string;
      fields: {
        app: string;
        app_display_name: string;
        app_id: string;
        device_display_name: string;
        kind: string;
        lang: string;
        profile_tag: string;
        pushkey: string;
        data: {
          url: string;
        };
      };
    };
    servernotices: {
      name: string;
      send: string;
      fields: {
        body: string;
      };
      action: {
        send: string;
        send_success: string;
        send_failure: string;
      };
      helper: {
        send: string;
      };
    };
    user_media_statistics: {
      name: string;
      fields: {
        media_count: string;
        media_length: string;
      };
    };
    forward_extremities?: {
      name: string;
      fields: {
        id: string;
        received_ts: string;
        depth: string;
        state_group: string;
      };
    };
    room_state?: {
      name: string;
      fields: {
        type: string;
        content: string;
        origin_server_ts: string;
        sender: string;
      };
    };
    room_directory?: {
      name: string;
      fields: {
        world_readable: string;
        guest_can_join: string;
      };
      action: {
        title: string;
        content: string;
        erase: string;
        create: string;
        send_success: string;
        send_failure: string;
      };
    };
    destinations?: {
      name: string;
      fields: {
        destination: string;
        failure_ts: string;
        retry_last_ts: string;
        retry_interval: string;
        last_successful_stream_ordering: string;
        stream_ordering: string;
      };
      action: {
        reconnect: string;
      };
    };
    registration_tokens?: {
      name: string;
      fields: {
        token: string;
        valid: string;
        uses_allowed: string;
        pending: string;
        completed: string;
        expiry_time: string;
        length: string;
      };
      helper: {
        length: string;
      };
    };
  };
}
