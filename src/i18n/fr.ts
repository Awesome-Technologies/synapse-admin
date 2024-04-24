import frenchMessages from "ra-language-french";

import { SynapseTranslationMessages } from ".";

const fr: SynapseTranslationMessages = {
  ...frenchMessages,
  synapseadmin: {
    auth: {
      base_url: "URL du serveur d’accueil",
      welcome: "Bienvenue sur Synapse-admin",
      server_version: "Version du serveur Synapse",
      username_error: "Veuillez entrer un nom d'utilisateur complet : « @utilisateur:domaine »",
      protocol_error: "L'URL doit commencer par « http:// » ou « https:// »",
      url_error: "L'URL du serveur Matrix n'est pas valide",
      sso_sign_in: "Se connecter avec l’authentification unique",
    },
    users: {
      invalid_user_id: "Partie locale d'un identifiant utilisateur Matrix sans le nom du serveur d’accueil.",
      tabs: { sso: "Authentification unique" },
    },
    rooms: {
      tabs: {
        basic: "Informations de base",
        members: "Membres",
        detail: "Détails",
        permission: "Permissions",
      },
    },
    reports: { tabs: { basic: "Informations de base", detail: "Détails" } },
  },
  import_users: {
    error: {
      at_entry: "Pour l'entrée %{entry} : %{message}",
      error: "Erreur",
      required_field: "Le champ requis « %{field} » est manquant",
      invalid_value:
        "Valeur non valide à la ligne %{row}. Le champ « %{field} » ne peut être que « true » ou « false »",
      unreasonably_big: "Refus de charger un fichier trop volumineux de %{size} mégaoctets",
      already_in_progress: "Un import est déjà en cours",
      id_exits: "L'identifiant %{id} déjà présent",
    },
    title: "Importer des utilisateurs à partir d'un fichier CSV",
    goToPdf: "Voir le PDF",
    cards: {
      importstats: {
        header: "Importer des utilisateurs",
        users_total:
          "%{smart_count} utilisateur dans le fichier CSV |||| %{smart_count} utilisateurs dans le fichier CSV",
        guest_count: "%{smart_count} visiteur |||| %{smart_count} visiteurs",
        admin_count: "%{smart_count} administrateur |||| %{smart_count} administrateurs",
      },
      conflicts: {
        header: "Stratégie de résolution des conflits",
        mode: {
          stop: "S'arrêter en cas de conflit",
          skip: "Afficher l'erreur et ignorer le conflit",
        },
      },
      ids: {
        header: "Identifiants",
        all_ids_present: "Identifiants présents pour chaque entrée",
        count_ids_present: "%{smart_count} entrée avec identifiant |||| %{smart_count} entrées avec identifiant",
        mode: {
          ignore: "Ignorer les identifiants dans le ficher CSV et en créer de nouveaux",
          update: "Mettre à jour les enregistrements existants",
        },
      },
      passwords: {
        header: "Mots de passe",
        all_passwords_present: "Mots de passe présents pour chaque entrée",
        count_passwords_present:
          "%{smart_count} entrée avec mot de passe |||| %{smart_count} entrées avec mot de passe",
        use_passwords: "Utiliser les mots de passe provenant du fichier CSV",
      },
      upload: {
        header: "Fichier CSV en entrée",
        explanation:
          "Vous pouvez télécharger ici un fichier contenant des valeurs séparées par des virgules qui sera traité pour créer ou mettre à jour des utilisateurs. Le fichier doit inclure les champs « id » et « displayname ». Vous pouvez télécharger et adapter un fichier d'exemple ici : ",
      },
      startImport: {
        simulate_only: "Simuler",
        run_import: "Importer",
      },
      results: {
        header: "Résultats de l'import",
        total: "%{smart_count} entrée au total |||| %{smart_count} entrées au total",
        successful: "%{smart_count} entrées importées avec succès",
        skipped: "%{smart_count} entrées ignorées",
        download_skipped: "Télécharger les entrées ignorées",
        with_error: "%{smart_count} entrée avec des erreurs ||| %{smart_count} entrées avec des erreurs",
        simulated_only: "L'import était simulé",
      },
    },
  },
  delete_media: {
    name: "Media",
    fields: {
      before_ts: "Dernier accès avant",
      size_gt: "Plus grand que (en octets)",
      keep_profiles: "Conserver les images de profil",
    },
    action: {
      send: "Supprimer le média",
      send_success: "Requête envoyée avec succès",
      send_failure: "Une erreur s'est produite",
    },
    helper: {
      send: "Cette API supprime les médias locaux du disque de votre propre serveur. Cela inclut toutes les vignettes locales et les copies des médias téléchargés. Cette API n'affectera pas les médias qui ont été téléversés dans des dépôts de médias externes.",
    },
  },
  resources: {
    users: {
      name: "Utilisateur |||| Utilisateurs",
      email: "Adresse électronique",
      msisdn: "Numéro de téléphone",
      threepid: "Adresse électronique / Numéro de téléphone",
      fields: {
        avatar: "Avatar",
        id: "Identifiant",
        name: "Nom",
        is_guest: "Visiteur",
        admin: "Administrateur du serveur",
        locked: "Verrouillé",
        deactivated: "Désactivé",
        guests: "Afficher les visiteurs",
        show_deactivated: "Afficher les utilisateurs désactivés",
        user_id: "Rechercher un utilisateur",
        displayname: "Nom d'affichage",
        password: "Mot de passe",
        avatar_url: "URL de l'avatar",
        avatar_src: "Avatar",
        medium: "Type",
        threepids: "Identifiants tiers",
        address: "Adresse",
        creation_ts_ms: "Date de création",
        consent_version: "Version du consentement",
        auth_provider: "Fournisseur d'identité",
      },
      helper: {
        deactivate: "Vous devrez fournir un mot de passe pour réactiver le compte.",
        erase: "Marquer l'utilisateur comme effacé conformément au RGPD",
      },
      action: {
        erase: "Effacer les données de l'utilisateur",
      },
    },
    rooms: {
      name: "Salon |||| Salons",
      fields: {
        room_id: "Identifiant du salon",
        name: "Nom",
        canonical_alias: "Alias",
        joined_members: "Membres",
        joined_local_members: "Membres locaux",
        joined_local_devices: "Appareils locaux",
        state_events: "Événements d'État / Complexité",
        version: "Version",
        is_encrypted: "Chiffré",
        encryption: "Chiffrement",
        federatable: "Fédérable",
        public: "Visible dans le répertoire des salons",
        creator: "Créateur",
        join_rules: "Règles d'adhésion",
        guest_access: "Accès des visiteurs",
        history_visibility: "Visibilité de l'historique",
        topic: "Sujet",
        avatar: "Avatar",
      },
      helper: {
        forward_extremities:
          "Les extrémités avant sont les événements feuilles à la fin d'un graphe orienté acyclique (DAG) dans un salon, c'est-à-dire les événements qui n'ont pas de descendants. Plus il y en a dans un salon, plus la résolution d'état que Synapse doit effectuer est importante (indice : c'est une opération coûteuse). Bien que Synapse dispose d'un algorithme pour éviter qu'un trop grand nombre de ces événements n'existent en même temps dans un salon, des bogues peuvent parfois les faire réapparaître. Si un salon présente plus de 10 extrémités avant, cela vaut la peine d'y prêter attention et éventuellement de les supprimer en utilisant les requêtes SQL mentionnées dans la discussion traitant du problème https://github.com/matrix-org/synapse/issues/1760.",
      },
      enums: {
        join_rules: {
          public: "Public",
          knock: "Sur demande",
          invite: "Sur invitation",
          private: "Privé",
        },
        guest_access: {
          can_join: "Les visiteurs peuvent rejoindre le salon",
          forbidden: "Les visiteurs ne peuvent pas rejoindre le salon",
        },
        history_visibility: {
          invited: "Depuis l'invitation",
          joined: "Depuis l'adhésion",
          shared: "Depuis le partage",
          world_readable: "Tout le monde",
        },
        unencrypted: "Non chiffré",
      },
      action: {
        erase: {
          title: "Supprimer le salon",
          content:
            "Voulez-vous vraiment supprimer le salon ? Cette opération ne peut être annulée. Tous les messages et médias partagés du salon seront supprimés du serveur !",
        },
      },
    },
    reports: {
      name: "Événement signalé |||| Événements signalés",
      fields: {
        id: "Identifiant",
        received_ts: "Date du rapport",
        user_id: "Rapporteur",
        name: "Nom du salon",
        score: "Score",
        reason: "Motif",
        event_id: "Identifiant de l'événement",
        event_json: {
          origin: "Serveur d'origine",
          origin_server_ts: "Date d'envoi",
          type: "Type d'événement",
          content: {
            msgtype: "Type de contenu",
            body: "Contenu",
            format: "Format",
            formatted_body: "Contenu mis en forme",
            algorithm: "Algorithme",
          },
        },
      },
    },
    connections: {
      name: "Connexions",
      fields: {
        last_seen: "Date",
        ip: "Adresse IP",
        user_agent: "Agent utilisateur",
      },
    },
    devices: {
      name: "Appareil |||| Appareils",
      fields: {
        device_id: "Identifiant de l'appareil",
        display_name: "Nom de l'appareil",
        last_seen_ts: "Date",
        last_seen_ip: "Adresse IP",
      },
      action: {
        erase: {
          title: "Suppression de %{id}",
          content: "Voulez-vous vraiment supprimer l'appareil « %{name} » ?",
          success: "Appareil supprimé avec succès",
          failure: "Une erreur s'est produite",
        },
      },
    },
    users_media: {
      name: "Media",
      fields: {
        media_id: "Identifiant du média",
        media_length: "Taille du fichier (en octets)",
        media_type: "Type",
        upload_name: "Nom du fichier",
        quarantined_by: "Mis en quarantaine par",
        safe_from_quarantine: "Protection contre la mise en quarantaine",
        created_ts: "Date de création",
        last_access_ts: "Dernier accès",
      },
    },
    protect_media: {
      action: {
        create: "Protéger",
        delete: "Révoquer la protection",
        none: "En quarantaine",
        send_success: "Le statut de protection a été modifié avec succès",
        send_failure: "Une erreur s'est produite",
      },
    },
    quarantine_media: {
      action: {
        name: "Quarantaine",
        create: "Mettre en quarantaine",
        delete: "Révoquer la mise en quarantaine",
        none: "Protégé contre la mise en quarantaine",
        send_success: "Le statut de la quarantaine a été modifié avec succès",
        send_failure: "Une erreur s'est produite",
      },
    },
    pushers: {
      name: "Émetteur de notifications |||| Émetteurs de notifications",
      fields: {
        app: "Application",
        app_display_name: "Nom d'affichage de l'application",
        app_id: "Identifiant de l'application",
        device_display_name: "Nom d'affichage de l'appareil",
        kind: "Type",
        lang: "Langue",
        profile_tag: "Profil",
        pushkey: "Identifiant de l'émetteur",
        data: { url: "URL" },
      },
    },
    servernotices: {
      name: "Annonces du serveur",
      send: "Envoyer des « Annonces du serveur »",
      fields: {
        body: "Message",
      },
      action: {
        send: "Envoyer une annonce",
        send_success: "Annonce envoyée avec succès",
        send_failure: "Une erreur s'est produite",
      },
      helper: {
        send: "Envoie une annonce au nom du serveur aux utilisateurs sélectionnés. La fonction « Annonces du serveur » doit être activée sur le serveur.",
      },
    },
    user_media_statistics: {
      name: "Médias des utilisateurs",
      fields: {
        media_count: "Nombre de médias",
        media_length: "Taille des médias",
      },
    },
    forward_extremities: {
      name: "Extrémités avant",
      fields: {
        id: "Identifiant de l'événement",
        received_ts: "Date de réception",
        depth: "Profondeur",
        state_group: "Groupe d'état",
      },
    },
    room_state: {
      name: "Événements d'état",
      fields: {
        type: "Type",
        content: "Contenu",
        origin_server_ts: "Date d'envoi",
        sender: "Expéditeur",
      },
    },
    room_directory: {
      name: "Répertoire des salons",
      fields: {
        world_readable: "Tout utilisateur peut avoir un aperçu du salon, sans en devenir membre",
        guest_can_join: "Les visiteurs peuvent rejoindre le salon",
      },
      action: {
        title: "Supprimer un salon du répertoire |||| Supprimer %{smart_count} salons du répertoire",
        content:
          "Voulez-vous vraiment supprimer ce salon du répertoire ? |||| Voulez-vous vraiment supprimer ces %{smart_count} salons du répertoire ?",
        erase: "Supprimer du répertoire des salons",
        create: "Publier dans le répertoire des salons",
        send_success: "Salon publié avec succès",
        send_failure: "Une erreur s'est produite",
      },
    },
    registration_tokens: {
      name: "Jetons d'inscription",
      fields: {
        token: "Jeton",
        valid: "Jeton valide",
        uses_allowed: "Nombre d'inscription autorisées",
        pending: "Nombre d'inscription en cours",
        completed: "Nombre d'inscription accomplie",
        expiry_time: "Date d'expiration",
        length: "Longueur",
      },
      helper: {
        length: "Longueur du jeton généré aléatoirement si aucun jeton n'est pas spécifié",
      },
    },
  },
};
export default fr;
