import chineseMessages from "ra-language-chinese";

const zh = {
  ...chineseMessages,
  synapseadmin: {
    auth: {
      base_url: "服务器 URL",
      welcome: "欢迎来到 Synapse-admin",
      server_version: "Synapse 版本",
      username_error: "请输入完整有效的用户 ID: '@user:domain'",
      protocol_error: "URL 需要以'http://'或'https://'作为起始",
      url_error: "不是一个有效的 Matrix 服务器地址",
      sso_sign_in: "使用 SSO 登录",
    },
    users: {
      invalid_user_id:
        "必须要是一个有效的 Matrix 用户 ID ，例如 @user_id:homeserver",
      tabs: { sso: "SSO" },
    },
    rooms: {
      tabs: {
        basic: "基本",
        members: "成员",
        detail: "细节",
        permission: "权限",
      },
      delete: {
        title: "删除房间",
        message:
          "您确定要删除这个房间吗？该操作无法被撤销。这个房间里所有的消息和分享的媒体都将被从服务器上删除！",
      },
    },
    reports: { tabs: { basic: "基本", detail: "细节" } },
  },
  import_users: {
    error: {
      at_entry: "在条目 %{entry}: %{message}",
      error: "错误",
      required_field: "需要的值 '%{field}' 未被设置。",
      invalid_value:
        "第 %{row} 行出现无效值。 '%{field}' 只可以是 'true' 或 'false'。",
      unreasonably_big: "拒绝加载过大的文件： %{size} MB",
      already_in_progress: "一个导入进程已经在运行中",
      id_exits: "ID %{id} 已经存在",
    },
    title: "通过 CSV 导入用户",
    goToPdf: "转到 PDF",
    cards: {
      importstats: {
        header: "导入用户",
        users_total:
          "%{smart_count} 用户在 CSV 文件中 |||| %{smart_count} 用户在 CSV 文件中",
        guest_count: "%{smart_count} 访客 |||| %{smart_count} 访客",
        admin_count: "%{smart_count} 管理员 |||| %{smart_count} 管理员",
      },
      conflicts: {
        header: "冲突处理策略",
        mode: {
          stop: "在冲突处停止",
          skip: "显示错误并跳过冲突",
        },
      },
      ids: {
        header: "IDs",
        all_ids_present: "每条记录的 ID",
        count_ids_present:
          "%{smart_count} 个含 ID 的记录 |||| %{smart_count} 个含 ID 的记录",
        mode: {
          ignore: "忽略 CSV 中的 ID 并创建新的",
          update: "更新已经存在的记录",
        },
      },
      passwords: {
        header: "密码",
        all_passwords_present: "每条记录的密码",
        count_passwords_present:
          "%{smart_count} 个含密码的记录 |||| %{smart_count} 个含密码的记录",
        use_passwords: "使用 CSV 中标记的密码",
      },
      upload: {
        header: "导入 CSV 文件",
        explanation:
          "在这里，你可以上传一个用逗号分隔的文件，用于创建或更新用户。该文件必须包括 'id' 和 'displayname' 字段。你可以在这里下载并修改一个示例文件：",
      },
      startImport: {
        simulate_only: "模拟模式",
        run_import: "导入",
      },
      results: {
        header: "导入结果",
        total: "共计 %{smart_count} 条记录 |||| 共计 %{smart_count} 条记录",
        successful: "%{smart_count} 条记录导入成功",
        skipped: "跳过 %{smart_count} 条记录",
        download_skipped: "下载跳过的记录",
        with_error:
          "%{smart_count} 条记录出现错误 ||| %{smart_count} 条记录出现错误",
        simulated_only: "只是一次模拟运行",
      },
    },
  },
  resources: {
    users: {
      name: "用户",
      email: "邮箱",
      msisdn: "电话",
      threepid: "邮箱 / 电话",
      fields: {
        avatar: "邮箱",
        id: "用户 ID",
        name: "用户名",
        is_guest: "访客",
        admin: "服务器管理员",
        deactivated: "被禁用",
        guests: "显示访客",
        show_deactivated: "显示被禁用的账户",
        user_id: "搜索用户",
        displayname: "显示名字",
        password: "密码",
        avatar_url: "头像 URL",
        avatar_src: "头像",
        medium: "Medium",
        threepids: "3PIDs",
        address: "地址",
        creation_ts_ms: "创建时间戳",
        consent_version: "协议版本",
      },
      helper: {
        deactivate: "您必须提供一串密码来激活账户。",
        erase: "将用户标记为根据 GDPR 的要求抹除了",
      },
      action: {
        erase: "抹除用户信息",
      },
    },
    rooms: {
      name: "房间",
      fields: {
        room_id: "房间 ID",
        name: "房间名",
        canonical_alias: "别名",
        joined_members: "成员",
        joined_local_members: "本地成员",
        state_events: "状态事件",
        version: "版本",
        is_encrypted: "已经加密",
        encryption: "加密",
        federatable: "可联合的",
        public: "公开",
        creator: "创建者",
        join_rules: "加入规则",
        guest_access: "访客访问",
        history_visibility: "历史可见性",
      },
      enums: {
        join_rules: {
          public: "公开",
          knock: "申请",
          invite: "邀请",
          private: "私有",
        },
        guest_access: {
          can_join: "访客可以加入",
          forbidden: "访客不可加入",
        },
        history_visibility: {
          invited: "自从被邀请",
          joined: "自从加入",
          shared: "自从分享",
          world_readable: "任何人",
        },
        unencrypted: "未加密",
      },
    },
    reports: {
      name: "报告事件",
      fields: {
        id: "ID",
        received_ts: "报告时间",
        user_id: "报告者",
        name: "房间名",
        score: "分数",
        reason: "原因",
        event_id: "事件 ID",
        event_json: {
          origin: "原始服务器",
          origin_server_ts: "发送时间",
          type: "事件类型",
          content: {
            msgtype: "内容类型",
            body: "内容",
            format: "格式",
            formatted_body: "格式化的数据",
            algorithm: "算法",
          },
        },
      },
    },
    connections: {
      name: "连接",
      fields: {
        last_seen: "日期",
        ip: "IP 地址",
        user_agent: "用户代理 (UA)",
      },
    },
    devices: {
      name: "设备",
      fields: {
        device_id: "设备 ID",
        display_name: "设备名",
        last_seen_ts: "时间戳",
        last_seen_ip: "IP 地址",
      },
      action: {
        erase: {
          title: "移除 %{id}",
          content: '您确定要移除设备 "%{name}"?',
          success: "设备移除成功。",
          failure: "出现了一个错误。",
        },
      },
    },
    users_media: {
      name: "媒体文件",
      fields: {
        media_id: "媒体文件 ID",
        media_length: "长度",
        media_type: "类型",
        upload_name: "文件名",
        quarantined_by: "被隔离",
        safe_from_quarantine: "取消隔离",
        created_ts: "创建",
        last_access_ts: "上一次访问",
      },
    },
    delete_media: {
      name: "媒体文件",
      fields: {
        before_ts: "最后访问时间",
        size_gt: "大于 (字节)",
        keep_profiles: "保留头像",
      },
      action: {
        send: "删除媒体",
        send_success: "请求发送成功。",
        send_failure: "出现了一个错误。",
      },
      helper: {
        send: "这个API会删除您硬盘上的本地媒体。包含了任何的本地缓存和下载的媒体备份。这个API不会影响上传到外部媒体存储库上的媒体文件。",
      },
    },
    pushers: {
      name: "发布者",
      fields: {
        app: "App",
        app_display_name: "App 名称",
        app_id: "App ID",
        device_display_name: "设备显示名",
        kind: "类型",
        lang: "语言",
        profile_tag: "数据标签",
        pushkey: "Pushkey",
        data: { url: "URL" },
      },
    },
    servernotices: {
      name: "服务器提示",
      send: "发送服务器提示",
      fields: {
        body: "信息",
      },
      action: {
        send: "发送提示",
        send_success: "服务器提示发送成功。",
        send_failure: "出现了一个错误。",
      },
      helper: {
        send: '向选中的用户发送服务器提示。服务器配置中的 "服务器提示(Server Notices)" 选项需要被设置为启用。',
      },
    },
    user_media_statistics: {
      name: "用户的媒体文件",
      fields: {
        media_count: "媒体文件统计",
        media_length: "媒体文件长度",
      },
    },
  },
};
export default zh;
