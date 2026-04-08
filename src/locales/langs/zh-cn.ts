const local: App.I18n.Schema = {
  system: {
    title: 'Soybean 管理系统',
    updateTitle: '系统版本更新通知',
    updateContent: '检测到系统有新版本发布，是否立即刷新页面？',
    updateConfirm: '立即刷新',
    updateCancel: '稍后再说'
  },
  common: {
    action: '操作',
    add: '新增',
    addSuccess: '添加成功',
    save: '保存',
    backToHome: '返回首页',
    batchDelete: '批量删除',
    cancel: '取消',
    close: '关闭',
    check: '勾选',
    selectAll: '全选',
    invertSelection: '反选',
    clearSelection: '清空',
    expandColumn: '展开列',
    columnSetting: '列设置',
    config: '配置',
    confirm: '确认',
    delete: '删除',
    deleteSuccess: '删除成功',
    confirmDelete: '确认删除吗？',
    edit: '编辑',
    warning: '警告',
    error: '错误',
    index: '序号',
    keywordSearch: '请输入关键词搜索',
    logout: '退出登录',
    logoutConfirm: '确认退出登录吗？',
    lookForward: '敬请期待',
    modify: '修改',
    modifySuccess: '修改成功',
    noData: '无数据',
    operate: '操作',
    pleaseCheckValue: '请检查输入的值是否合法',
    refresh: '刷新',
    reset: '重置',
    search: '搜索',
    switch: '切换',
    tip: '提示',
    trigger: '触发',
    update: '更新',
    updateSuccess: '更新成功',
    restore: '恢复',
    restoreSuccess: '恢复成功',
    batchRestoreConfirm: '确定要批量恢复选中的 {count} 个路由吗？',
    batchRestoreSuccess: '成功恢复 {count} 个路由',
    batchRestoreFail: '{count} 个路由恢复失败',
    selectFirst: '请先选择要操作的路由',
    deleteConfirmWithDays: '确定要物理删除以下路由吗？此操作不可恢复！',
    obsoleteDaysInfo: '废弃天数信息',
    minObsoleteDaysWarning: '以下路由废弃天数不足 {days} 天，无法删除：{routes}',
    userCenter: '个人中心',
    yesOrNo: {
      yes: '是',
      no: '否'
    }
  },
  request: {
    logout: '请求失败后登出用户',
    logoutMsg: '用户状态失效，请重新登录',
    logoutWithModal: '请求失败后弹出模态框再登出用户',
    logoutWithModalMsg: '用户状态失效，请重新登录',
    refreshToken: '请求的token已过期，刷新token',
    tokenExpired: 'token已过期'
  },
  theme: {
    themeSchema: {
      title: '主题模式',
      light: '亮色模式',
      dark: '暗黑模式',
      auto: '跟随系统'
    },
    grayscale: '灰色模式',
    colourWeakness: '色弱模式',
    layoutMode: {
      title: '布局模式',
      vertical: '左侧菜单模式',
      'vertical-mix': '左侧菜单混合模式',
      horizontal: '顶部菜单模式',
      'horizontal-mix': '顶部菜单混合模式',
      reverseHorizontalMix: '一级菜单与子级菜单位置反转'
    },
    recommendColor: '应用推荐算法的颜色',
    recommendColorDesc: '推荐颜色的算法参照',
    themeColor: {
      title: '主题颜色',
      primary: '主色',
      info: '信息色',
      success: '成功色',
      warning: '警告色',
      error: '错误色',
      followPrimary: '跟随主色'
    },
    scrollMode: {
      title: '滚动模式',
      wrapper: '外层滚动',
      content: '主体滚动'
    },
    page: {
      animate: '页面切换动画',
      mode: {
        title: '页面切换动画类型',
        'fade-slide': '滑动',
        fade: '淡入淡出',
        'fade-bottom': '底部消退',
        'fade-scale': '缩放消退',
        'zoom-fade': '渐变',
        'zoom-out': '闪现',
        none: '无'
      }
    },
    fixedHeaderAndTab: '固定头部和标签栏',
    header: {
      height: '头部高度',
      breadcrumb: {
        visible: '显示面包屑',
        showIcon: '显示面包屑图标'
      },
      multilingual: {
        visible: '显示多语言按钮'
      },
      globalSearch: {
        visible: '显示全局搜索按钮'
      }
    },
    tab: {
      visible: '显示标签栏',
      cache: '标签栏信息缓存',
      height: '标签栏高度',
      mode: {
        title: '标签栏风格',
        chrome: '谷歌风格',
        button: '按钮风格'
      }
    },
    sider: {
      inverted: '深色侧边栏',
      width: '侧边栏宽度',
      collapsedWidth: '侧边栏折叠宽度',
      mixWidth: '混合布局侧边栏宽度',
      mixCollapsedWidth: '混合布局侧边栏折叠宽度',
      mixChildMenuWidth: '混合布局子菜单宽度'
    },
    footer: {
      visible: '显示底部',
      fixed: '固定底部',
      height: '底部高度',
      right: '底部局右'
    },
    watermark: {
      visible: '显示全屏水印',
      text: '水印文本',
      enableUserName: '启用用户名水印'
    },
    themeDrawerTitle: '主题配置',
    pageFunTitle: '页面功能',
    configOperation: {
      copyConfig: '复制配置',
      copySuccessMsg: '复制成功，请替换 src/theme/settings.ts 中的变量 themeSettings',
      resetConfig: '重置配置',
      resetSuccessMsg: '重置成功'
    }
  },
  route: {
    login: '登录',
    403: '无权限',
    404: '页面不存在',
    500: '服务器错误',
    'iframe-page': '外链页面',
    home: '首页',
    document: '文档',
    document_project: '项目文档',
    'document_project-link': '项目文档(外链)',
    document_vue: 'Vue文档',
    document_vite: 'Vite文档',
    document_unocss: 'UnoCSS文档',
    document_naive: 'Naive UI文档',
    document_antd: 'Ant Design Vue文档',
    'document_element-plus': 'Element Plus文档',
    about: '关于',
    exception: '异常页',
    exception_403: '403',
    exception_404: '404',
    exception_500: '500',
    function: '系统功能',
    function_tab: '标签页',
    'function_multi-tab': '多标签页',
    'function_hide-child': '隐藏子菜单',
    'function_hide-child_one': '隐藏子菜单一',
    'function_hide-child_two': '菜单二',
    'function_hide-child_three': '菜单三',
    function_request: '请求',
    'function_toggle-auth': '切换权限',
    'function_super-page': '超级管理员可见',
    manage: '系统管理',
    manage_user: '用户管理',
    'manage_user-detail': '用户详情',
    manage_role: '角色管理',
    manage_menu: '菜单管理',
    manage_api: 'API管理',
    manage_department: '部门管理',
    manage_dictionary: '字典管理',
    'manage_operation-record': '操作记录',
    'manage_route-menu-obsolete': '废弃路由',
    'manage_advanced-permission': '高级权限',
    manage_organization: '组织架构',
    'manage_password-change': '修改密码',
    'manage_user-lock': '用户锁定管理',
    plugin: '插件示例',
    plugin_copy: '剪贴板',
    plugin_charts: '图表',
    plugin_charts_echarts: 'ECharts',
    plugin_charts_antv: 'AntV',
    plugin_charts_vchart: 'VChart',
    plugin_editor: '编辑器',
    plugin_editor_quill: '富文本编辑器',
    plugin_editor_markdown: 'MD编辑器',
    plugin_icon: '图标',
    plugin_map: '地图',
    plugin_print: '打印',
    plugin_swiper: 'Swiper',
    plugin_video: '视频',
    plugin_barcode: '条形码',
    plugin_pinyin: '拼音',
    plugin_excel: 'Excel',
    plugin_pdf: 'PDF预览',
    plugin_gantt: '甘特图',
    plugin_gantt_dhtmlx: 'dhtmlxGantt',
    plugin_gantt_vtable: 'VTableGantt',
    plugin_typeit: '打字机',
    plugin_tables: '表格',
    plugin_tables_vtable: 'VTable',
    profile: '个人中心',
    profile_info: '个人信息',
    profile_password: '修改密码',
    // 能源管理模块
    energy: '能源管理',
    energy_dashboard: '能耗看板',
    energy_flow: '能流图',
    energy_comparison: '能耗对比',
    energy_ranking: '能效排名',
    energy_report: '能耗报表',
    'energy_electric-analysis': '电力分析',
    'energy_history-data': '历史数据',
    'energy_branch-analysis': '分支分析',
    // 基础数据管理
    'base-data': '基础数据',
    'base-data_home': '基础数据概览',
    'base-data_medium': '介质设置',
    'base-data_unit': '单位设置',
    'base-data_coefficient': '转换系数',
    'base-data_meter': '计量点设置',
    'base-data_tou': '分时电价',
    'base-data_virtual-meter': '虚拟计量点',
    'base-data_power-distribution': '配电管理',
    // 报警管理
    alarm: '报警管理',
    alarm_history: '报警历史',
    alarm_item: '报警项',
    'alarm_limit-type': '限值类型',
    // 能源分析
    'energy-analysis': '能源分析',
    'energy-analysis_comprehensive': '综合分析',
    'energy-analysis_comprehensive_daily': '日报表',
    'energy-analysis_comprehensive_monthly': '月报表',
    'energy-analysis_comprehensive_statistics': '统计分析',
    'energy-analysis_comprehensive_year': '年报表',
    'energy-indicators': '能耗指标',
    analysis: '分析',
    analysis_consumption: '能耗分析',
    // 成本管理
    cost: '成本管理',
    cost_electricity: '电费管理',
    cost_tactics: '策略管理',
    cost_trend: '趋势分析',
    costmanagement: '成本管理',
    costmanagement_electricity: '电费管理',
    costmanagement_tactics: '策略管理',
    costmanagement_trend: '趋势分析',
    // 节能管理
    saving: '节能管理',
    saving_program: '节能方案',
    saving_policy: '节能策略',
    // 排班管理
    scheduling: '排班管理',
    scheduling_team: '班组管理',
    scheduling_shift: '班次管理',
    'scheduling_shift-pattern': '排班模式',
    scheduling_calendar: '排班日历',
    'scheduling_factory-calendar': '工厂日历',
    'scheduling_rule-config': '规则配置',
    'scheduling_rule-version': '版本管理',
    'scheduling_rule-template': '规则模板',
    // 知识库
    knowledge: '知识库',
    // 网关设置
    gatewaysetting: '网关设置',
    // 碳排放
    carbonemission: '碳排放',
    carbonemission_calculate: '碳排放计算',
    // 统计分析
    statistical: '统计分析',
    statistical_cost: '成本统计',
    statistical_flow: '能流统计',
    'statistical_yoy-mom': '同比环比',
    // 其他分析模块
    benchmark: '对标分析',
    branchanalysis: '分支分析',
    comprehensivestatistics: '综合统计',
    consumptionanalysis: '能耗分析',
    itemized: '分项能耗',
    itemizedenergyanalysis: '分项能耗分析',
    keyequipment: '重点设备',
    keyequipment_daily: '日数据',
    keyequipment_monthly: '月数据',
    keyequipment_year: '年数据',
    peakvalley: '峰谷分析',
    'peakvalley-analysis': '峰谷分析',
    processenergy: '工序能耗',
    productoutput: '产品产量',
    spikesandvalleys: '峰谷平',
    'process-energy': '工序能耗',
    'process-energy_statistics': '能耗统计',
    'process-energy_statistics_daily': '日统计',
    'process-energy_statistics_monthly': '月统计',
    'process-energy_statistics_year': '年统计'
  },
  page: {
    login: {
      common: {
        loginOrRegister: '登录 / 注册',
        userNamePlaceholder: '请输入用户名',
        phonePlaceholder: '请输入手机号',
        codePlaceholder: '请输入验证码',
        passwordPlaceholder: '请输入密码',
        confirmPasswordPlaceholder: '请再次输入密码',
        captchaPlaceholder: '请输入验证码',
        codeLogin: '验证码登录',
        confirm: '确定',
        back: '返回',
        validateSuccess: '验证成功',
        loginSuccess: '登录成功',
        welcomeBack: '欢迎回来，{userName} ！'
      },
      pwdLogin: {
        title: '密码登录',
        rememberMe: '记住我',
        forgetPassword: '忘记密码？',
        register: '注册账号',
        otherAccountLogin: '其他账号登录',
        otherLoginMode: '其他登录方式',
        superAdmin: '超级管理员',
        admin: '管理员',
        user: '普通用户'
      },
      codeLogin: {
        title: '验证码登录',
        getCode: '获取验证码',
        reGetCode: '{time}秒后重新获取',
        sendCodeSuccess: '验证码发送成功',
        imageCodePlaceholder: '请输入图片验证码'
      },
      register: {
        title: '注册账号',
        agreement: '我已经仔细阅读并接受',
        protocol: '《用户协议》',
        policy: '《隐私权政策》'
      },
      resetPwd: {
        title: '重置密码'
      },
      bindWeChat: {
        title: '绑定微信'
      }
    },
    about: {
      title: '关于',
      introduction: `SoybeanAdmin 是一个优雅且功能强大的后台管理模板，基于最新的前端技术栈，包括 Vue3, Vite5, TypeScript, Pinia 和 UnoCSS。它内置了丰富的主题配置和组件，代码规范严谨，实现了自动化的文件路由系统。此外，它还采用了基于 ApiFox 的在线Mock数据方案。SoybeanAdmin 为您提供了一站式的后台管理解决方案，无需额外配置，开箱即用。同样是一个快速学习前沿技术的最佳实践。`,
      projectInfo: {
        title: '项目信息',
        version: '版本',
        latestBuildTime: '最新构建时间',
        githubLink: 'Github 地址',
        previewLink: '预览地址'
      },
      prdDep: '生产依赖',
      devDep: '开发依赖'
    },
    home: {
      branchDesc:
        '为了方便大家开发和更新合并，我们对main分支的代码进行了精简，只保留了首页菜单，其余内容已移至example分支进行维护。预览地址显示的内容即为example分支的内容。',
      greeting: '早安，{userName}, 今天又是充满活力的一天!',
      weatherDesc: '今日多云转晴，20℃ - 25℃!',
      projectCount: '项目数',
      todo: '待办',
      message: '消息',
      downloadCount: '下载量',
      registerCount: '注册量',
      schedule: '作息安排',
      study: '学习',
      work: '工作',
      rest: '休息',
      entertainment: '娱乐',
      visitCount: '访问量',
      turnover: '成交额',
      dealCount: '成交量',
      projectNews: {
        title: '项目动态',
        moreNews: '更多动态',
        desc1: 'Soybean 在2021年5月28日创建了开源项目 soybean-admin!',
        desc2: 'Yanbowe 向 soybean-admin 提交了一个bug，多标签栏不会自适应。',
        desc3: 'Soybean 准备为 soybean-admin 的发布做充分的准备工作!',
        desc4: 'Soybean 正在忙于为soybean-admin写项目说明文档！',
        desc5: 'Soybean 刚才把工作台页面随便写了一些，凑合能看了！'
      },
      creativity: '创意'
    },
    function: {
      tab: {
        tabOperate: {
          title: '标签页操作',
          addTab: '添加标签页',
          addTabDesc: '跳转到关于页面',
          closeTab: '关闭标签页',
          closeCurrentTab: '关闭当前标签页',
          closeAboutTab: '关闭"关于"标签页',
          addMultiTab: '添加多标签页',
          addMultiTabDesc1: '跳转到多标签页页面',
          addMultiTabDesc2: '跳转到多标签页页面(带有查询参数)'
        },
        tabTitle: {
          title: '标签页标题',
          changeTitle: '修改标题',
          change: '修改',
          resetTitle: '重置标题',
          reset: '重置'
        }
      },
      multiTab: {
        routeParam: '路由参数',
        backTab: '返回 function_tab'
      },
      toggleAuth: {
        toggleAccount: '切换账号',
        authHook: '权限钩子函数 `hasAuth`',
        superAdminVisible: '超级管理员可见',
        adminVisible: '管理员可见',
        adminOrUserVisible: '管理员和用户可见'
      },
      request: {
        repeatedErrorOccurOnce: '重复请求错误只出现一次',
        repeatedError: '重复请求错误',
        repeatedErrorMsg1: '自定义请求错误 1',
        repeatedErrorMsg2: '自定义请求错误 2'
      }
    },
    manage: {
      common: {
        status: {
          enable: '启用',
          disable: '禁用'
        }
      },
      role: {
        title: '角色列表',
        roleName: '角色名称',
        roleCode: '角色编码',
        roleStatus: '角色状态',
        roleDesc: '角色描述',
        menuAuth: '菜单权限',
        buttonAuth: '按钮权限',
        form: {
          roleName: '请输入角色名称',
          roleCode: '请输入角色编码',
          roleStatus: '请选择角色状态',
          roleDesc: '请输入角色描述'
        },
        addRole: '新增角色',
        editRole: '编辑角色',
        moduleQuickSelect: '模块快捷选择',
        routePermission: '路由权限',
        selectHint: '勾选节点为角色分配路由访问权限'
      },
      route: {
        constant: '常量',
        disabled: '禁用',
        obsolete: '废弃',
        obsoleteTime: '废弃时间',
        obsoleteDays: '废弃天数',
        batchRestore: '批量恢复'
      },
      user: {
        title: '用户列表',
        userName: '用户名',
        userGender: '性别',
        nickName: '昵称',
        userPhone: '手机号',
        userEmail: '邮箱',
        userStatus: '用户状态',
        userRole: '用户角色',
        form: {
          userName: '请输入用户名',
          userGender: '请选择性别',
          nickName: '请输入昵称',
          userPhone: '请输入手机号',
          userEmail: '请输入邮箱',
          userStatus: '请选择用户状态',
          userRole: '请选择用户角色'
        },
        addUser: '新增用户',
        editUser: '编辑用户',
        gender: {
          male: '男',
          female: '女'
        }
      },
      menu: {
        home: '首页',
        title: '菜单列表',
        id: 'ID',
        parentId: '父级菜单ID',
        menuType: '菜单类型',
        menuName: '菜单名称',
        routeName: '路由名称',
        routePath: '路由路径',
        pathParam: '路径参数',
        layout: '布局',
        page: '页面组件',
        i18nKey: '国际化key',
        icon: '图标',
        localIcon: '本地图标',
        iconTypeTitle: '图标类型',
        order: '排序',
        constant: '常量路由',
        keepAlive: '缓存路由',
        href: '外链',
        hideInMenu: '隐藏菜单',
        activeMenu: '高亮的菜单',
        multiTab: '支持多页签',
        fixedIndexInTab: '固定在页签中的序号',
        query: '路由参数',
        button: '按钮',
        buttonCode: '按钮编码',
        buttonDesc: '按钮描述',
        menuStatus: '菜单状态',
        statusFilter: '状态筛选',
        componentPath: '组件路径',
        confirmEnable: '确定要启用该路由吗？',
        confirmDisable: '确定要禁用该路由吗？',
        form: {
          home: '请选择首页',
          menuType: '请选择菜单类型',
          menuName: '请输入菜单名称',
          routeName: '请输入路由名称',
          routePath: '请输入路由路径',
          pathParam: '请输入路径参数',
          page: '请选择页面组件',
          layout: '请选择布局组件',
          i18nKey: '请输入国际化key',
          icon: '请输入图标',
          localIcon: '请选择本地图标',
          order: '请输入排序',
          keepAlive: '请选择是否缓存路由',
          href: '请输入外链',
          hideInMenu: '请选择是否隐藏菜单',
          activeMenu: '请选择高亮的菜单的路由名称',
          multiTab: '请选择是否支持多标签',
          fixedInTab: '请选择是否固定在页签中',
          fixedIndexInTab: '请输入固定在页签中的序号',
          queryKey: '请输入路由参数Key',
          queryValue: '请输入路由参数Value',
          button: '请选择是否按钮',
          buttonCode: '请输入按钮编码',
          buttonDesc: '请输入按钮描述',
          menuStatus: '请选择菜单状态'
        },
        addMenu: '新增菜单',
        editMenu: '编辑菜单',
        addChildMenu: '新增子菜单',
        readOnly: '（只读）',
        editableConfig: '自定义配置（可编辑）',
        menuTitle: '菜单标题',
        menuIcon: '菜单图标',
        pleaseSelectIcon: '请选择图标',
        pleaseInputOrder: '请输入排序',
        type: {
          directory: '目录',
          menu: '菜单',
          button: '按钮'
        },
        iconType: {
          iconify: 'iconify图标',
          local: '本地图标'
        }
      }
    },
    profile: {
      info: {
        title: '个人信息',
        basicInfo: '基本信息',
        changeAvatar: '修改头像',
        userId: '用户ID',
        username: '用户名',
        department: '所属部门',
        noDepartment: '未分配',
        roles: '角色',
        noRole: '无',
        editableInfo: '可编辑信息',
        nickName: '昵称',
        nickNamePlaceholder: '请输入昵称',
        phone: '手机号',
        phonePlaceholder: '请输入手机号',
        email: '邮箱',
        emailPlaceholder: '请输入邮箱'
      },
      password: {
        title: '修改密码',
        change: '修改密码',
        securityTip: '安全提示',
        securityDesc: '修改密码后需要重新登录',
        oldPassword: '原密码',
        oldPasswordPlaceholder: '请输入原密码',
        newPassword: '新密码',
        newPasswordPlaceholder: '请输入新密码（至少6位）',
        confirmPassword: '确认密码',
        confirmPasswordPlaceholder: '请再次输入新密码',
        success: '密码修改成功，请重新登录',
        error: '密码修改失败'
      }
    }
  },
  form: {
    required: '不能为空',
    userName: {
      required: '请输入用户名',
      invalid: '用户名格式不正确'
    },
    phone: {
      required: '请输入手机号',
      invalid: '手机号格式不正确'
    },
    pwd: {
      required: '请输入密码',
      invalid: '密码格式不正确，6-18位字符，包含字母、数字、下划线'
    },
    confirmPwd: {
      required: '请输入确认密码',
      invalid: '两次输入密码不一致'
    },
    code: {
      required: '请输入验证码',
      invalid: '验证码格式不正确'
    },
    email: {
      required: '请输入邮箱',
      invalid: '邮箱格式不正确'
    }
  },
  dropdown: {
    closeCurrent: '关闭',
    closeOther: '关闭其它',
    closeLeft: '关闭左侧',
    closeRight: '关闭右侧',
    closeAll: '关闭所有'
  },
  icon: {
    themeConfig: '主题配置',
    themeSchema: '主题模式',
    lang: '切换语言',
    fullscreen: '全屏',
    fullscreenExit: '退出全屏',
    reload: '刷新页面',
    collapse: '折叠菜单',
    expand: '展开菜单',
    pin: '固定',
    unpin: '取消固定'
  },
  datatable: {
    itemCount: '共 {total} 条'
  },
  devtools: {
    server: {
      title: '服务器状态',
      cpu: 'CPU',
      cpuCores: '核心数',
      cpuUser: '用户态',
      cpuSystem: '系统态',
      cpuIdle: '空闲',
      memory: '内存',
      memoryTotal: '总量',
      memoryUsed: '已用',
      memoryAvailable: '可用',
      memoryUsage: '使用率',
      os: '操作系统',
      osType: '系统类型',
      osPlatform: '平台',
      osVersion: '版本',
      osArch: '架构',
      uptime: '运行时长',
      uptimeBootTime: '启动时间',
      ports: '服务端口',
      portListening: '监听中',
      portClosed: '未监听',
      version: '版本信息',
      systemVersion: '系统版本',
      backendVersion: '后端依赖',
      frontendVersion: '前端依赖',
      autoRefresh: '自动刷新',
      refresh: '刷新'
    },
    aiChat: {
      title: 'AI 助手',
      config: {
        title: '配置',
        baseUrl: '基础URL',
        baseUrlPlaceholder: '请输入 API 基础 URL',
        apiKey: 'API密钥',
        apiKeyPlaceholder: '请输入 API Key',
        defaultModel: '默认模型',
        defaultModelPlaceholder: '请输入默认模型名称',
        saveConfig: '保存配置',
        clearConfig: '清除配置',
        getModels: '获取模型列表',
        configGuide: '配置指南'
      },
      session: {
        newChat: '新对话',
        createSession: '创建会话',
        sessionLimit: '会话数量已达上限',
        clearAll: '清空全部',
        deleteConfirm: '确定删除该会话？',
        clearAllConfirm: '确定清空所有会话？',
        selectModel: '选择模型'
      },
      chat: {
        inputPlaceholder: '输入消息...',
        send: '发送',
        thinking: '思考中...',
        startChat: '开始对话',
        inputHint: '按 Enter 发送，Shift+Enter 换行',
        messageLimit: '消息数量已达上限',
        messageCount: '消息数',
        regenerate: '重新生成',
        stop: '停止',
        copy: '复制',
        copied: '已复制'
      }
    }
  }
};

export default local;
