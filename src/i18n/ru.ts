import russianMessages from "ra-language-russian";

import { SynapseTranslationMessages } from ".";

const ru: SynapseTranslationMessages = {
  ...russianMessages,
  ra: {
    ...russianMessages.ra,
    navigation: {
      ...russianMessages.ra.navigation,
      no_filtered_results: "Нет результатов",
      clear_filters: "Все фильтры сбросить",
    },
  },
  synapseadmin: {
    auth: {
      base_url: "Адрес домашнего сервера",
      welcome: "Добро пожаловать в Synapse-admin",
      server_version: "Версия Synapse",
      supports_specs: "поддерживает спецификации Matrix",
      username_error: "Пожалуйста, укажите полный ID пользователя: '@user:domain'",
      protocol_error: "Адрес должен начинаться с 'http://' или 'https://'",
      url_error: "Неверный адрес сервера Matrix",
      sso_sign_in: "Вход через SSO",
    },
    users: {
      invalid_user_id: "Локальная часть ID пользователя Matrix без адреса домашнего сервера.",
      tabs: { sso: "SSO" },
    },
    rooms: {
      details: "Данные комнаты",
      tabs: {
        basic: "Основные",
        members: "Участники",
        detail: "Подробности",
        permission: "Права доступа",
      },
    },
    reports: { tabs: { basic: "Основные", detail: "Подробности" } },
  },
  import_users: {
    error: {
      at_entry: "В записи %{entry}: %{message}",
      error: "Ошибка",
      required_field: "Отсутствует обязательное поле '%{field}'",
      invalid_value: "Неверное значение в строке %{row}. Поле '%{field}' может быть либо 'true', либо 'false'",
      unreasonably_big: "Отказано в загрузке слишком большого файла размером %{size} мегабайт",
      already_in_progress: "Импорт уже в процессе",
      id_exits: "ID %{id} уже существует",
    },
    title: "Импорт пользователей из CSV",
    goToPdf: "Перейти к PDF",
    cards: {
      importstats: {
        header: "Импорт пользователей",
        users_total:
          "%{smart_count} пользователь в CSV файле |||| %{smart_count} пользователя в CSV файле |||| %{smart_count} пользователей в CSV файле",
        guest_count: "%{smart_count} гость |||| %{smart_count} гостя |||| %{smart_count} гостей",
        admin_count:
          "%{smart_count} администратор |||| %{smart_count} администратора |||| %{smart_count} администраторов",
      },
      conflicts: {
        header: "Стратегия разрешения конфликтов",
        mode: {
          stop: "Остановка при конфликте",
          skip: "Показать ошибку и пропустить при конфликте",
        },
      },
      ids: {
        header: "Идентификаторы",
        all_ids_present: "Идентификаторы присутствуют в каждой записи",
        count_ids_present:
          "%{smart_count} запись с ID |||| %{smart_count} записи с ID |||| %{smart_count} записей с ID",
        mode: {
          ignore: "Игнорировать идентификаторы в CSV и создать новые",
          update: "Обновить существующие записи",
        },
      },
      passwords: {
        header: "Пароли",
        all_passwords_present: "Пароли присутствуют в каждой записи",
        count_passwords_present:
          "%{smart_count} запись с паролем |||| %{smart_count} записи с паролями |||| %{smart_count} записей с паролями",
        use_passwords: "Использовать пароли из CSV",
      },
      upload: {
        header: "Загрузить CSV файл",
        explanation:
          "Здесь вы можете загрузить файл со значениями, разделёнными запятыми, которые будут использованы для создания или обновления данных пользователей. \
          В файле должны быть поля 'id' и 'displayname'. Вы можете скачать и изменить файл-образец отсюда: ",
      },
      startImport: {
        simulate_only: "Только симулировать",
        run_import: "Импорт",
      },
      results: {
        header: "Результаты импорта",
        total: "%{smart_count} запись всего |||| %{smart_count} записи всего |||| %{smart_count} записей всего",
        successful:
          "%{smart_count} запись успешно импортирована |||| %{smart_count} записи успешно импортированы |||| %{smart_count} записей успешно импортированы",
        skipped:
          "%{smart_count} запись пропущена |||| %{smart_count} записи пропущены |||| %{smart_count} записей пропущено",
        download_skipped: "Скачать пропущенные записи",
        with_error:
          "%{smart_count} запись с ошибкой |||| %{smart_count} записи с ошибками |||| %{smart_count} записей с ошибками",
        simulated_only: "Импорт был симулирован",
      },
    },
  },
  delete_media: {
    name: "Файлы",
    fields: {
      before_ts: "Последнее обращение до",
      size_gt: "Более чем (в байтах)",
      keep_profiles: "Сохранить аватары",
    },
    action: {
      send: "Удалить файлы",
      send_success: "Запрос успешно отправлен.",
      send_failure: "Произошла ошибка.",
    },
    helper: {
      send: "Это API удаляет локальные файлы с вашего собственного сервера, включая локальные миниатюры и копии скачанных файлов. \
      Данный API не затрагивает файлы, загруженные во внешние хранилища.",
    },
  },
  resources: {
    users: {
      name: "Пользователь |||| Пользователи",
      email: "Почта",
      msisdn: "Телефон",
      threepid: "Почта / Телефон",
      fields: {
        avatar: "Аватар",
        id: "ID пользователя",
        name: "Имя",
        is_guest: "Гость",
        admin: "Администратор сервера",
        locked: "Заблокирован",
        deactivated: "Деактивирован",
        erased: "Удалён",
        guests: "Показывать гостей",
        show_deactivated: "Показывать деактивированных",
        user_id: "Поиск пользователя",
        displayname: "Отображаемое имя",
        password: "Пароль",
        avatar_url: "Адрес аватары",
        avatar_src: "Аватар",
        medium: "Тип",
        threepids: "3PID'ы",
        address: "Адрес",
        creation_ts_ms: "Дата создания",
        consent_version: "Версия соглашения",
        auth_provider: "Провайдер",
        user_type: "Тип пользователя",
      },
      helper: {
        password: "Смена пароля завершит все сессии пользователя.",
        deactivate: "Вы должны предоставить пароль для реактивации учётной записи.",
        erase: "Пометить пользователя как удалённого в соответствии с GDPR",
      },
      action: {
        erase: "Удалить данные пользователя",
      },
    },
    rooms: {
      name: "Комната |||| Комнаты",
      fields: {
        room_id: "ID комнаты",
        name: "Название",
        canonical_alias: "Псевдоним",
        joined_members: "Участники",
        joined_local_members: "Локальные участники",
        joined_local_devices: "Локальные устройства",
        state_events: "События состояния / Сложность",
        version: "Версия",
        is_encrypted: "Зашифровано",
        encryption: "Шифрование",
        federatable: "Федерация",
        public: "Отображается в каталоге комнат",
        creator: "Создатель",
        join_rules: "Правила входа",
        guest_access: "Гостевой доступ",
        history_visibility: "Видимость истории",
        topic: "Тема",
        avatar: "Аватар",
      },
      helper: {
        forward_extremities:
          "Оконечности — это события-листья в конце ориентированного ациклического графа (DAG) в комнате, т.е. события без дочерних элементов. \
          Чем больше их в комнате, тем больше Synapse работает над разрешением состояния (это дорогостоящая операция). \
          Хотя Synapse старается не допускать существования слишком большого числа таких событий в комнате, из-за ошибок они иногда снова появляются. \
          Если в комнате >10 оконечностей, стоит найти комнату-виновника и попробовать удалить их с помощью SQL-запросов из #1760.",
      },
      enums: {
        join_rules: {
          public: "Для всех",
          knock: "Надо постучать",
          invite: "По приглашению",
          private: "Приватная",
        },
        guest_access: {
          can_join: "Гости могут войти",
          forbidden: "Гости не могут войти",
        },
        history_visibility: {
          invited: "С момента приглашения",
          joined: "С момента входа",
          shared: "С момента открытия доступа",
          world_readable: "Для всех",
        },
        unencrypted: "Без шифрования",
      },
      action: {
        erase: {
          title: "Удалить комнату",
          content:
            "Действительно удалить эту комнату? Это действие будет невозможно отменить. Все сообщения и файлы в комнате будут удалены с сервера!",
        },
      },
    },
    reports: {
      name: "Жалоба |||| Жалобы",
      fields: {
        id: "ID",
        received_ts: "Дата и время жалобы",
        user_id: "Автор жалобы",
        name: "Название комнаты",
        score: "Баллы",
        reason: "Причина",
        event_id: "ID события",
        event_json: {
          origin: "Исходнный сервер",
          origin_server_ts: "Дата и время отправки",
          type: "Тип события",
          content: {
            msgtype: "Тип содержимого",
            body: "Содержимое",
            format: "Формат",
            formatted_body: "Форматированное содержимое",
            algorithm: "Алгоритм",
            url: "Ссылка",
            info: {
              mimetype: "Тип",
            },
          },
        },
      },
      action: {
        erase: {
          title: "Удалить жалобу",
          content: "Действительно удалить жалобу? Это действие будет невозможно отменить.",
        },
      },
    },
    connections: {
      name: "Подключения",
      fields: {
        last_seen: "Дата",
        ip: "IP адрес",
        user_agent: "Юзер-агент",
      },
    },
    devices: {
      name: "Устройство |||| Устройства",
      fields: {
        device_id: "ID устройства",
        display_name: "Название",
        last_seen_ts: "Дата и время",
        last_seen_ip: "IP адрес",
      },
      action: {
        erase: {
          title: "Удаление %{id}",
          content: 'Действительно удалить устройство "%{name}"?',
          success: "Устройство успешно удалено.",
          failure: "Произошла ошибка.",
        },
      },
    },
    users_media: {
      name: "Файлы",
      fields: {
        media_id: "ID файла",
        media_length: "Размер файла (в байтах)",
        media_type: "Тип",
        upload_name: "Имя файла",
        quarantined_by: "На карантине",
        safe_from_quarantine: "Защитить от карантина",
        created_ts: "Создано",
        last_access_ts: "Последний доступ",
      },
      action: {
        open: "Открыть файл в новом окне",
      },
    },
    protect_media: {
      action: {
        create: "Не защищён, установить защиту",
        delete: "Защищён, снять защиту",
        none: "На карантине",
        send_success: "Статус защиты успешно изменён.",
        send_failure: "Произошла ошибка.",
      },
    },
    quarantine_media: {
      action: {
        name: "Карантин",
        create: "Поместить на карантин",
        delete: "На карантине, снять карантин",
        none: "Защищено от карантина",
        send_success: "Статус карантина успешно изменён.",
        send_failure: "Произошла ошибка.",
      },
    },
    pushers: {
      name: "Пушер |||| Пушеры",
      fields: {
        app: "Приложение",
        app_display_name: "Название приложения",
        app_id: "ID приложения",
        device_display_name: "Название устройства",
        kind: "Вид",
        lang: "Язык",
        profile_tag: "Тег профиля",
        pushkey: "Ключ",
        data: { url: "URL" },
      },
    },
    servernotices: {
      name: "Серверные уведомления",
      send: "Отправить серверные уведомления",
      fields: {
        body: "Сообщение",
      },
      action: {
        send: "Отправить",
        send_success: "Серверное уведомление успешно отправлено.",
        send_failure: "Произошла ошибка.",
      },
      helper: {
        send: 'Отправить серверное уведомление выбранным пользователям. На сервере должна быть активна функция "Server Notices".',
      },
    },
    user_media_statistics: {
      name: "Файлы пользователей",
      fields: {
        media_count: "Количество файлов",
        media_length: "Размер файлов",
      },
    },
    forward_extremities: {
      name: "Оконечности",
      fields: {
        id: "ID события",
        received_ts: "Дата и время",
        depth: "Глубина",
        state_group: "Группа состояния",
      },
    },
    room_state: {
      name: "События состояния",
      fields: {
        type: "Тип",
        content: "Содержимое",
        origin_server_ts: "Дата отправки",
        sender: "Отправитель",
      },
    },
    room_directory: {
      name: "Каталог комнат",
      fields: {
        world_readable: "Гости могут просматривать без входа",
        guest_can_join: "Гости могут войти",
      },
      action: {
        title:
          "Удалить комнату из каталога |||| Удалить %{smart_count} комнаты из каталога |||| Удалить %{smart_count} комнат из каталога",
        content:
          "Действительно удалить комнату из каталога? |||| Действительно удалить %{smart_count} комнаты из каталога? |||| Действительно удалить %{smart_count} комнат из каталога?",
        erase: "Удалить из каталога комнат",
        create: "Опубликовать в каталоге комнат",
        send_success: "Комната успешно опубликована.",
        send_failure: "Произошла ошибка.",
      },
    },
    destinations: {
      name: "Федерация",
      fields: {
        destination: "Назначение",
        failure_ts: "Дата и время ошибки",
        retry_last_ts: "Дата и время последней попытки",
        retry_interval: "Интервал между попытками",
        last_successful_stream_ordering: "Последний успешный поток",
        stream_ordering: "Поток",
      },
      action: { reconnect: "Переподключиться" },
    },
    registration_tokens: {
      name: "Токены регистрации",
      fields: {
        token: "Токен",
        valid: "Рабочий токен",
        uses_allowed: "Количество использований",
        pending: "Ожидает",
        completed: "Завершено",
        expiry_time: "Дата окончания",
        length: "Длина",
      },
      helper: { length: "Длина токена, если токен не задан." },
    },
  },
};
export default ru;
