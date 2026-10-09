# GitHub 可运行源码与商业价值复查

查证日期：2026-10-09。最新请求：查看别人公开 GitHub 内容，找能复用的实际代码，减少从零开发。公开访问、源码下载和本地测试已获授权；不使用用户个人历史或凭证。GPT 转售仍已取消。

## 实际执行结果

本轮读取 9 个仓库的 README 与根许可证，记录当时最新分支的固定 commit；没有把 stars、免费用户或厂商定价算成收入。固定版本清单在 `experiments/github-code-audit/REPOSITORY_PINS.json`。

选择许可清楚、资源要求较小的 invoice2data 做技术验证：下载 62 个未修改原始文件，逐一核对 Git blob SHA，实际生成中英文测试 PDF 并调用原始 API。4 项集成测试通过：两个正确提取样本、缺少必填金额和未知格式的异常处理。所有 PDF 是标注清楚的合成测试资料，不是商业证据。

**已测试的是技术复用，不是商业项目通过验证。** 没有公开发布、真实用户、订单或收款；不能因成功解析测试文件就宣布选定一个赚钱项目。

## 9 个仓库的审查

下表许可证结论仅限已经读取的文件。未完成全部依赖、子模块、商标和部署镜像的审计。组件可复用不等于该商业模式已获批准。

|仓库与原始来源（均于 2026-10-09 查证）|根许可证/商业条件|源码能解决什么|可能收费价值与购买入口|本轮实际状态与约束|
|---|---|---|---|---|
|[invoice2data](https://github.com/invoice-x/invoice2data)；[许可证](https://github.com/invoice-x/invoice2data/blob/09378126e3ae86ddef5435ba166b4fc026e386a4/LICENSE.md)|MIT，必须保留原版权和许可声明；依赖另查|按模板把账单 PDF 转成字段|为固定业务批量导入、校验、工作流集成收费；自动化工具市场是待验证入口|**已测试**：62 文件与4项本地测试。模板维护、买家、具体平台分发、收款和手机流程未验证|
|[Docling](https://github.com/docling-project/docling)；[许可证](https://github.com/docling-project/docling/blob/b2a59b9fa1a31ae6584d4dd18cd0c2bb3ca285b6/LICENSE)|MIT；README 明确模型另有许可证|复杂文档转结构化数据|企业导入和业务系统集成；收费集成市场仍需找具体需求|源码条件**已完成**；未运行；模型、资源成本和稳定处理复杂文件未验证|
|[Crawlee](https://github.com/apify/crawlee)；[许可证](https://github.com/apify/crawlee/blob/d893412583237086f20f071e4aac97714bca3151/LICENSE.md)|Apache-2.0；网站条款和数据权利另查|浏览器/HTTP 自动化、数据提取|允许的数据处理任务可通过 Apify Store 的付费 Actor 入口收费|根条件**已完成**；未运行；该源码没有自带买家，具体任务、资源成本、大陆结算未验证|
|[Gotenberg](https://github.com/gotenberg/gotenberg)；[许可证](https://github.com/gotenberg/gotenberg/blob/c83dbd7bafacb3734ebadf2e33a4049a17d45ec9/LICENSE)|MIT；Chromium、LibreOffice 与镜像依赖另查|把 HTML/Office 文件转换成 PDF 的 API|可靠转换、业务集成和托管；自然搜索需要时间，不是首单保障|根条件**已完成**；未运行；Docker 部署成本、获客和手机管理未验证|
|[Tiledesk](https://github.com/Tiledesk/tiledesk)；[许可证](https://github.com/Tiledesk/tiledesk/blob/7509f1f7f14429e44dcebd7c0293375975e41c14/LICENSE)|根 MIT；相关组件与企业镜像另有条件，不可视为全部免费|网站客服及自动化|企业客服部署、行业集成和托管服务；有厂商商业套餐|根条件**已完成**；未运行；多服务和人工集成较重，不适合先按低维护条件投入|
|[n8n](https://github.com/n8n-io/n8n)；[许可证](https://github.com/n8n-io/n8n/blob/13679fcb97fe26c775d711dd05e1db2f941e536a/LICENSE.md)|Sustainable Use / Enterprise；内部业务用途可用，公开托管收费不能默认获准|连接业务服务执行自动化|可作为本人业务内部执行器；不按免费源码改名售卖托管平台来计划|条款**已完成**；未运行；具体工作流仍需合法输入、订单和分发|
|[Dify](https://github.com/langgenius/dify)；[许可证](https://github.com/langgenius/dify/blob/c497e930a6bd10a114422fe68dd758d8d4087f6c/LICENSE)|附加条件的 Apache-2.0；多 workspace 托管须书面授权，前端标识有条件|AI 应用工作流|特定业务应用可以有收费价值，但泛多模型平台已被用户取消|条款**已完成**；未运行；不复活已取消产品，也不默认开多租户转售|
|[Formbricks](https://github.com/formbricks/formbricks)；[许可证](https://github.com/formbricks/formbricks/blob/c871aecdf37c254ab9d794ebb76e3f0ae3af459e/LICENSE)|AGPL 核心；部分 SDK MIT；`apps/web/modules/ee` 企业许可|反馈收集与调查|企业反馈工作流、合规部署、集成服务；厂商收费不代表新卖家有买家|条款**已完成**；未运行；公开核心与企业付费功能要区分，业务客服负担待验证|
|[Twenty](https://github.com/twentyhq/twenty)；[许可证](https://github.com/twentyhq/twenty/blob/520ee32a7717f34fed199321a8407c6dc8a732a9/LICENSE)|AGPL 核心、标记的商业文件和 MIT SDK 等；独立 API/SDK 应用的例外不等于修改核心可闭源；不授予商标|CRM 与应用集成|独立业务应用和集成有潜在收费价值，市场可发现性需实查|条款**已完成**；未运行；迁移、客户数据和业务集成较重，首轮降权|

Cal.com 的旧仓库请求发生迁移，未完成当前许可证核验，不计入上述 9 个。没有把读取失败当作已研究。

## 为什么下载源码之后还不能认定赚钱

可行的收费链是：**真实重复业务 → 原代码自动完成主要工作 → 客户在现有需求入口找到工具 → 支付 → 扣费及退款 → 实际结算**。源码主要解决其中的自动处理部分。

以本轮测试为例，潜在买家是反复把同一来源账单录入业务系统的操作人员。他们可能为减少复制、错漏和重复导入付费。Docparser 的[官方定价页](https://docparser.com/pricing/)存在付费解析套餐，说明该类别有商业报价；**这只证明有售卖，未证明新产品有付费客户**。页面同时包含月付、年付与动态价格文字，不能随意摘一项当统一月价。

原项目 README 还列出 Odoo/OCA 业务集成，证明存在实际集成用途；README 自述不是独立付款证明。不同版式需要模板，不应把通用转换器包装成零维护、无限需求。

当前缺少至少三项足以支持我们特定切口的独立需求证据，也缺少具体可发现的购买入口。故 invoice2data **仅为已跑通技术底座**，没有因此自动成为最优赚钱方向。不先投资、建收费平台或要求用户购机。

## 分发与收款关口

1. 自动化市场是本轮值得继续核验的入口之一。Apify 官方提供[付费 Actor 规则](https://docs.apify.com/platform/actors/publishing/monetize)和[付款规则](https://docs.apify.com/platform/actors/publishing/monetize/payments)。KYC、收款方式、最低付款额与周期存在；中国大陆个人实际可收款仍未验证。不能把运行次数当付款或立即到账。
2. 国内付费技能商店是上一轮规则线索，不等于 invoice2data 可以直接上传、自然获得曝光或以手机号自动收款。必须验证运行形态、资源限制、具体任务、关键词竞争和手机操作。
3. GitHub 自身作为源码存放和技术发现入口；没有验证它能给本项目持续输送付费买家。不能用上架或 stars 填补流量数据。

要优先找到公开求购、可追溯购买反馈或同类真实成交，再核验该入口允许个人供给和真实结算。若找不到适合少人工、手机管理和预算的闭环，应否决该商业切口，保留可复用源码。

## 成本、风险与停止条件

实际本轮新增现金支出 0 元；本地测试无 AI 和外部收费 API。线上 CPU、存储、支付费、退款、客服、模板更新与税费尚未实测，不给出虚假的单笔净利。现有 ChatGPT 订阅不记为本项目新增现金投入。

必须满足文件授权、隐私保护和合法数据来源；不做刷问卷、伪造账户、盗用会话、侵权抓取或仿冒产品。已进行源代码静态关键词检查：loader 使用 SafeLoader；存在可选 AI 网络路径、云 OCR 与 native subprocess 后端。此次明确选择 PDFium API 路径且 AI 关闭。该检查不是全面安全审计；网络 socket 测试护栏也不是系统沙箱。

若现成免费工具覆盖全部需求、格式适配持续耗费人工、平台无法分发或实际收款不适用大陆，应停止商业化。累计项目真实订单、收款、到账与退款为 0；没有声明赚到钱或持续后台执行。
