# 部署与恢复
查证日期：2026-10-09

## 当前部署
Site project_id：appgprj_6ac8c2c6f2f88191a6a69ec762bbe0b5
已完成：部署工具确认succeeded。
网址：https://rednote-studio-fpq.qq1464356758.chatgpt.site
部署ID：appgdep_6ac8d43cb5f08191b2440d8c8b3fd2e7
版本ID：appgprj_6ac8c2c6f2f88191a6a69ec762bbe0b5~appgver_494917efea1881918beb14eb62ba28aa
源码提交：fe46bb242545a5dd8a8f95f448ca8a76dd1f6031
保持创建者私有访问。

## Sites环境重新发布
1. 进入本项目checkout，读取.openai/hosting.json，保持同一project_id。
2. 安装依赖、运行测试和类型检查。使用Sites插件的build-site.mjs构建，保留现有Vite/Sites Worker插件。
3. 使用同一Site的短期源代码凭据；令牌只经stdin传给site-workflow.mjs，不写入文件、Git远程配置或命令行。
4. 用site-workflow.mjs推送精确源码并打包实际dist输出。使用返回的commit_sha和archive，保存版本并私有部署。
5. 等部署状态为succeeded后交付工具返回的生产网址。不改变共享权限。

## 独立本地运行
Node>=22.13.0；运行npm run install:ci、npm run dev。
生产构建运行npm run build、npm run start。
本地运行只给当前设备/网络访问；不能将本机地址当作手机随时可访问的公网部署。
迁移到其他托管平台需要处理Worker运行时与访问控制，尚未验证。不应直接公开包含个人草稿的运行环境。

## 故障恢复
- 草稿丢失：草稿菜单→导入之前导出的“可编辑备份.json”。不同域名与浏览器不共享localStorage。
- 本机存储不足/被禁用：导出备份或发布包，避免只依赖自动保存。
- 自动复制不被允许：工具打开只读文字窗口，长按全选复制。
- 手机找不到下载：打开浏览器下载列表/文件管理。单张PNG与TXT可分别下载；ZIP需要解压。
- 图卡过密：缩短当前页标题/正文，或加页。导出会提示容量错误，不导出截断正文。
- AI401：本人到DeepSeek官方密钥管理核对；密钥仅填在软件中。
- AI402：余额不足，由本人决定是否充值；无需充值也可用本地成稿/提示词导入。
- AI429/超时：稍后手动重试；应用不自动重试，已发出的模型请求可能计费。
- AI生成期间修改原稿：原稿保留，生成结果放在导入窗口，由本人决定采用。
- 版本损坏：恢复GitHub中上一个已测试版本，重新构建发布。不要恢复或上传旧会话令牌。

## 数据
文案与素材保存在当前浏览器，本站无草稿数据库。可选AI调用向DeepSeek发送本次素材。应用代码不记录密钥和请求正文，输出与备份只使用字段白名单。清空动作需在软件弹窗中确认。

