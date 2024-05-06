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
  resources: {
    users: {
      fields: {
        locked?: string; // TODO: fa, zh
      };
    };
  };
}
