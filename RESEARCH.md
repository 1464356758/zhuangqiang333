# 第一轮公开市场调查

**2026-10-09当前决定：TierSheet方向停止，先前发布/开户计划撤回；最新合法信息差调查在[research/INFORMATION_GAP_REVIEW.md](research/INFORMATION_GAP_REVIEW.md)。跨境商家费用漏损是研究优先类别，尚未选定新产品或通过开发门槛。下文及DIRECTION_REVIEW均为历史研究。**

2026-10-09补充：[公开标价任务与付款规则复查](research/CASH_FIRST_REVIEW.md)已完成，未确认可领取且符合约束的订单。原软件停止商业开发；[历史发布/购买验证草稿](operations/SALES_GATE.md)已撤回，不能照旧执行。未获得收入。下文保留2026-10-08首轮证据快照。

查证日期：2026-10-08。只使用本轮公开网页和公开仓库，不读取用户历史、私有资料或旧项目。适用条件：**中国大陆个人**、启动现金≤500元、目标固定月成本≤100元、不持续内容引流。工程交付天数和成本是规划估计，均不代表已执行。

## 决策

选择一个**零现金成本的有限功能实验**：TierSheet（暂用名）——从商品CSV和价格等级规则生成批发价目表批量包。不是已验证能盈利的结论。先解决“一个商品表对应多份价格版”的重复工作；通用目录、通用CSV检查、通用条码不开发。新产品的实际付款、插件自然分发能力、审核通过与到账均未验证。

调查28个不同机会、20个商业/AI案例（其中12个有公开交易计数）、12个GitHub项目和9类分发入口。公开交易证据集中于WP与Blender市场，代表本轮样本偏差，不能外推为全市场最优。没有获取可靠关键词月搜索量，也没有真实店铺转化率，禁止编造。

## 28个机会

|编号|机会|谁付钱及理由|现有证据/竞争|发现渠道及可达性|技术/交付与成本估计|判断|
|---|---|---|---|---|---|---|
|01|批发多价格等级价目表批量打包|小型批发商、Woo店主；减少重复排版与错发价格|S06/S68/S69；同类付款与业务流程，特定新产品付费未验证|WordPress免费基础插件→独立批量版|原生JS；2–4天验证；固定0|最优实验；批量不同价格版是待验证切口，免费目录不等于无竞争|
|02|Woo商品CSV更新前检查|批量改价店主；减少覆盖、格式错误|S01/S23–28；问题真实|WordPress目录|PapaParse/自研；1–3天；0|失败：免费CatalogDock覆盖核心，停止|
|03|Shopify CSV修复/导入预检|商品管理商家；减少导入出错|S13/S29/S30；Matrixify付费，两个新检查器无评论|Shopify商店|CSV组件；3–7天；API/托管需额外验证|降权：付费不是导入预检单独付费的证明|
|04|Woo通用商品/订单CSV导出|商家、财务；批量导出|S01/S02/S03有交易|WordPress→外部支付|原生CSV；3–5天；0–50元/月估计|降权：内置免费、WebToffee及大量竞品|
|05|Woo PDF发票/装箱单|电商仓储；减少手填|S04/S05有交易|WordPress目录|PDF组件；5–10天；0–50元/月估计|降权：强免费产品及税务格式责任|
|06|单一PDF商品目录|零售/批发商；展示商品|S06有交易，S71/S72有免费替代|WordPress目录|HTML/PDF；2–5天；0|通用版失败；不单独开发|
|07|热敏条码标签/窄标签适配|POS小店；减少重印和扫描失败|S32/S34/S35；免费工具S33/S36/S38|Shopify商店|条码组件；3–7天；硬件支持额外|备用2，只验证特定打印工作流；不能做又一个生成器|
|08|4x6运单PDF批量裁剪|小型发货商；打印方便|付费竞品存在；S37等免费覆盖|Chrome商店/搜索|pdf-lib；1–3天；0|失败：通用裁剪被免费覆盖|
|09|Woo支付对账|商家财务；减少差错|S31平台已增加原生报表|WordPress目录|CSV/报表；5–10天；0|失败：通用需求原生功能侵蚀，不能收集银行私密数据验证|
|10|本地Excel/CSV对比/对账|财务/运营；省人工|uTools已有表格对比，特定付费客户未核实|uTools|ExcelJS/OpenRefine；3–7天；0|淘汰短期路径：1000下载内置付费门槛，用户群过宽|
|11|Blender资产交付批量导出|模型制作与资产卖家；减少逐个导出|S10/S11/S12公开交易、购买后评论|Superhive分类和搜索|Blender Python；3–7天；0|备用1，须找到免费扩展未解决的具体交付需求|
|12|Blender批量保存独立blend|3D资产库管理；节省分拆时间|S11有200+销售，部分请求历史5年|Superhive/Blender扩展|bpy；3–7天；0|通用版失败：S39/S41等免费已覆盖，历史请求不可当现时缺口|
|13|游戏精灵图集打包|小型游戏开发者；优化纹理|S82永久商业许可证，具体销量未见|itch.io工具类别|Canvas/打包算法；3–7天；0|降权：免费工具多；缺独立交易与新增分发证据|
|14|银行PDF账单转CSV|记账与财务；减少手录|S16历史收入自述，当前收入未验证|搜索|Docling/OCRmyPDF；5–14天；扫描件可能超预算|降权：隐私、OCR正确率、多银行格式、SEO慢|
|15|截图API|开发者企业；可靠网页渲染|S15创办人自述400客户，未独立审计|搜索/SDK/GitHub|浏览器；3–7天原型，运营成本高于静态工具|淘汰此次：可靠性和获客周期不匹配|
|16|网站变化监控托管|运营、采购；及时发现变化|S81既有托管套餐；新服务付款未知|GitHub/搜索|changedetection.io；1–3天；服务器浏览器成本|淘汰此次：无独特行业需求，泛托管难压成本|
|17|商品图片压缩与WebP|店主；提升加载速度|S07/S09公开交易|WordPress|imgproxy/浏览器；3–5天；资源费/售后|降权：免费压缩产品多、维护复杂|
|18|行业图片代理/格式适配|有图像管道的开发团队；减少资源消耗|S80官方商业产品，销量未见|SDK/GitHub/搜索|imgproxy；2–5天；带宽成本待测|淘汰：泛代理无明确新增买家渠道|
|19|Google邮件合并|销售/行政；批量个性化邮件|S74商业套餐存在；不可等同新工具付款|Workspace Marketplace|Sheets/Gmail API；5–14天；审核/发送限制|降权：OAuth与准入、反垃圾限制、强竞品|
|20|浏览器文字模板填表|客服与运营；省重复输入|S75商业套餐存在|Chrome商店|MV3；3–7天；0|降权：Text Blaze强势，网站适配长期维护|
|21|字幕转写与格式处理|视频从业者；节省整理时间|S77付费转写；免费SubtitleEdit|itch/搜索|SubtitleEdit；3–7天；转写模型费用|通用转换失败；转写价格不证明格式转换愿付费|
|22|报价/合同模板文档生成|小企业行政；减少填错|S78有商业套餐，销量未见|搜索/模板生态|PDF/HTML；3–7天；0–100元/月估计|降权：需行业模板与明确分发，避免法律承诺|
|23|网站失效链接检查|站点维护人员；减少错误链接|S79商业套餐存在|WordPress/搜索|HTTP抓取；3–7天；网络/兼容成本|降权：免费检查与爬取条款；单一细分需求不足|
|24|WordPress备份恢复|小企业站主；降低故障损失|S76商业套餐，直接新客户未验证|WordPress目录|原生备份；7–14天；存储恢复责任高|淘汰此次：恢复正确性、免费竞争、售后成本|
|25|预约预订插件|服务型商家；避免人工排班|S08公开149交易|WordPress目录|原生Web；7–14天；通知与时区维护|降权：完整系统太大，多竞品|
|26|托管书签/知识库|个人收藏用户；跨设备方便|linkding开源，没查到明确新增付费群|GitHub/搜索|linkding；1–3天；服务器|失败：开源安装痛点不等于会付费|
|27|数据导入地图/门店分布|机构/门店；减少手工定位|S21创作者称客户请求，无销量/评论证明|Product Hunt/搜索|地图组件；3–7天；地理编码可能收费|淘汰：缺可追溯付费证据，获客需推广|
|28|AI Agent调试观察工具|AI开发者；排查Agent|S22免费且无评论；无付款证据|Product Hunt/GitHub|日志UI；3–7天；0|失败：无特定付费客户群与有效需求分发|

## 交易、收入与AI开发案例

A是市场公开计数，不是银行审计；B是可追溯客户自述或平台API核验声明；C是创办人/访谈自述；D未验证。A计数能说明有人购买该现有产品，不说明个人可复制其销量。不用当前售价乘以累计sales估算收入，未知退款、历史折扣、佣金、税费与获客成本。案例中没有看到可独立验证的净利润或银行到账。

|编号|案例|当前标价/产品|可追溯事实|证据等级与限制|来源|
|---|---|---|---|---|---|
|01|CSV Import Export for Woo|$25|667 sales|A：平台公开累计交易计数|S01|
|02|Woo Orders and Products Export|$18|895 sales|A|S02|
|03|Woo Orders & Customers Exporter|$25|326 sales|A|S03|
|04|Woo PDF Invoice/Credit Note|$69|806 sales|A|S04|
|05|Woo PDF Invoice/Packing Slips|$29|189 sales|A|S05|
|06|Woo PDF Catalog Pro|$69|401 sales（页面快照）|A|S06|
|07|Solvium Image Optimizer|$11|68 sales|A|S07|
|08|AppointFox PRO|$69|149 sales|A|S08|
|09|Automatic WebP Compression|$29|365 sales|A|S09|
|10|Batch Export|$5.87页面价|30+ sales；4条购买后评论|A：平台要求购买才可评|S10|
|11|Save Selected|$5|200+ sales；7条购买后评论|A；部分评论4–5年前，非当前缺口|S11|
|12|Batch Export Pro|$1体验/$8完整价|60+ sales；3条购买后评论|A；不能把所有销售按$8计算|S12|
|13|Matrixify|Basic $20/月|2026-09商家评论明确称付$20，发生退款争议|B：客户付款自述；不是收款审计|S13|
|14|BuiltWithAI（Claude Code构建自述）|单次链接收费产品|平台快照总收入$134、MRR$17、2订阅|B：TrustMRR声称Stripe接口核验；我未接触后台或银行|S14|
|15|ScreenshotOne|截图API|2025-04创办人自述$200k ARR、400客户|C：有公开原文，未独立核验，不计作A|S15|
|16|BankStatementConverter|PDF转换|2022-10创办人自述$5000 MRR|C：历史稳定案例参考，不能当2026收入|S16|
|17|Cursor制作移动应用组合|多个移动App|IH2026采访自述$185k/月|C：UGC与付费推广为主要增长，违背本实验约束|S17|
|18|Tabu.hr（Claude Code构建部分产品）|企业薪资基准|HN2026-10创办人称约€100k ARR、50+付费企业|C：原发帖，自述，非审计；先积累多年数据|S19|
|19|四个AI开发收入案例|不同AI软件|IH正文访问受限|D：未验证，不引用收入数字、不计付款证据|S18|
|20|Price List Pro（Shopify）|$9.99/月，7日试用|2026-07商家称已用6个月，实际价目表反馈；16评论|B：可追溯实际使用，但不能把评论全算付款。功能更丰富，竞争压力|S85|

AI案例的结论：AI能缩短实现时间，但不替代分发。BuiltWithAI规模很小，不能包装成暴富案例；移动App组合依赖UGC/推广；Tabu.hr有多年数据积累。主动搜索覆盖ChatGPT、Claude、Cursor、Codex和AI Agent；没有找到能同时证明“这些工具开发、低现金、不主动获客、14日盈利”的充分审计案例。HN讨论与Product Hunt上架/排名本身不是付款。老案例与历史买家评论明确标注年份，不伪装为过去12个月的数据。

## 分发渠道核验

|渠道|用户发现机制|个人是否可准备同样入口|费用/准入/速度|决定及证据|
|---|---|---|---|---|
|WordPress.org插件目录|后台插件搜索、目录标签、搜索引擎；用户已有建站任务|可注册账号、提交GPL兼容免费插件；最终提交待授权|官方说常见审核1–10天，目标5工作日；不保证。目录不是内置收银台|主渠道实验；免费插件完整独立有用，独立付费批量工具外售；S42/S43|
|Shopify App Store|商家按业务功能搜索并在店内安装|需开发者注册、公有App审批、OAuth等；大陆个人结算资格仍要按账号确认|一次$19报名；原生账单处理与结算；最低$25，常见双月内结算窗口|备用渠道，不能把商家付款马上当开发者到账；S46/S47|
|Chrome Web Store|按具体工具搜索安装|注册页列中国可支持；付款卡实际可用性未知|官方资讯提$5注册，当前后台金额需本人确认；审核、外部收费入口|不为相同免费条码/裁剪器支付注册费；S44/S45|
|Google Workspace Marketplace|在Gmail/Sheets相关工作中发现插件|公共发布需项目、OAuth/审核与合适权限；不冒用企业|没有在本轮确认完整敏感权限审查费用与期限|降权，强付费竞品不等于新插件容易获客；S74|
|uTools插件中心|软件内插件搜索|个人申请有实名资料要求|**上架+1000有效下载**才可申请平台付费；最低100元，次月10日结算；原费30%，文档优惠15%|与短期回款冲突；S48|
|Superhive/Blender工具商店|已有付费买家的Addon分类、新品、站内搜索|个人创作者申请，可把公司字段填个人名；审批结果未知|免费创作者层分成70%，另扣5.5%和每单$0.49；最低$25；具体大陆提现路径待账号验证|备用1；不购买提高分成的付费套餐；S50/S51|
|itch.io工具市场|游戏开发工具分类、搜索、相关项目|可以准备数字工具页面；个人身份和税务问卷需本人|平台分成可设；默认10%+处理费用；收集后付款最少$5、交易7日后可用，申请审核通常另10–14日；问卷一次$3|非游戏批发软件与流量不匹配；S52|
|Envato/CodeCanyon|成熟软件付费分类与站内搜索|**新作者申请暂停，邀请制**|本轮不可假定能注册卖代码|仅作为交易需求证据，排除发布路径；S49|
|独立搜索/GitHub/PH/HN|长尾词、开源文档、社区发布|可以准备公开文档；发帖、联系真人需另外授权，且遵守反推广规则|没有承诺自然流量；GitHub stars不等于用户付款；没有持续SEO预算|只补充资料分发，不作为首单主渠道；S19–22/S70|

## 最优实验的三类独立需求证据

1. **发生过商品目录软件交易**：S06公开401次sales、$69标价，说明企业/店主对文档产品付费这一类别存在。
2. **具体业务已实际在用**：S68售卖客户专属价目表、当月标价€39.90/月、包含价格分组；2026-07-10买家描述版本升级后真实问题及修复。它证明客户价格版的工作流真实，不把3条评论或<100下载当100个付费客户。免费试用也可能产生评论。
3. **不同供应商的业务流程**：S69数据出版服务明确处理CSV/ERP和多客户/币种版本。是厂商对自身产品的说明，可信度低于购买后评论；未获取净收入。S70独立讨论还说明有人用Claude自行实现，作为免费替代压力，而非直接付费意向。

三类来源足以支持做一个小型技术/价值实验，**尚不足以批准收费扩建或认定14天会出现买家**。尤其未证实“多价格等级批量ZIP”这个特定切口的付费，必须在真实价格页上实验。

## 关键反证与停止记录

- CSV预检最初拟优先验证。复查S28发现免费插件已有本地检查、店铺对比、价格/库存更新CSV、HTML/JSON报告和Excel支持。虽然其安装数很少，仍足以推翻“这些功能没人提供”的假设。**停止此方向，没有写它的产品代码。**
- 通用4x6裁剪、条码生成、PDF目录存在免费替代，不以“更好看”作为收费理由。价格等级批量工作流也不能声称没有竞品。
- S25的GitHub导入问题已在2025-09关闭；只作历史流程风险，不当作尚未修复Bug。
- 零评论的新付费App证明有人挂牌报价，不能证明有人付款（S29/S30）。
- Reddit部分推广回复被删除（S70）；不会把给求助者发广告作为获客计划。
- 14天是目标：WP审核+支付KYC+首批自然曝光可超过该期限；收款后Creem7–12天审核、每月1/15窗口及$50门槛会使到账更晚。

## 发布准备中的补充复查

S85的$9.99/月付费产品支持多列表、PDF/XLS、商品图片、QR和店铺集成，比本实验更完整；不声称需要批量目录的买家没有成熟选项。本实验只测试$19买断、离线CSV多档位/覆盖价ZIP这个窄切口，不因为售价低就推定用户付款。
S93的WordPress“price list”标签已有免费定价表、菜单、角色定价和新插件，体现真实目录入口与竞争；安装量不是我们的搜索流量。未拿到月搜索量、排名或新插件曝光概率。
S86检索到TierSphere使用“TierSheet”称其报告，另有历史UI组件名称；暂用测试名不等于商标可注册或最终批准。没有买域名。
S87/S88用于实际WordPress版本/本地CLI测试，S89–92用于部署/统计边界；不把Cloudflare Visits当去重真实人数。

## 来源索引

以下每个来源均于2026-10-08查证。页面数据可能是搜索快照；案例数字取本轮最近可读取快照，变化不构成净收入。S18正文未读到、S19创办人自述、S69厂商陈述，证据等级如上。只保存短笔记和链接，不保存整页版权正文。

- S01 [WooCommerce CSV 导入导出交易](https://codecanyon.net/item/woocommerce-csv-import-export-plugin/21204381) — 2026-10-08
- S02 [Woo 订单商品导出交易](https://codecanyon.net/item/woocommerce-orders-and-products-export/13046494) — 2026-10-08
- S03 [Woo 订单客户导出交易](https://codecanyon.net/item/woocommerce-orders-customers-exporter/12670334) — 2026-10-08
- S04 [PDF发票与贷项通知交易](https://codecanyon.net/item/woocommerce-pdf-invoice-packing-slip-generator/24179339) — 2026-10-08
- S05 [PDF发票装箱单交易](https://codecanyon.net/item/woocommerce-pdf-invoice-packing-slip-shipping-label/20631799) — 2026-10-08
- S06 [PDF Catalog Pro交易](https://codecanyon.net/item/woocommerce-pdf-catalog-with-flipbook/25388360) — 2026-10-08
- S07 [Solvium图片压缩交易](https://codecanyon.net/item/solvium-image-optimizer/4987599) — 2026-10-08
- S08 [AppointFox预约交易](https://codecanyon.net/item/appointfox-wordpress-appointment-booking-system/21706738) — 2026-10-08
- S09 [自动WebP图片压缩交易](https://codecanyon.net/item/automatic-image-compression-for-wordpress-woocommerce/28024607) — 2026-10-08
- S10 [Batch Export交易与购买后评论](https://superhivemarket.com/products/batchexport/ratings) — 2026-10-08
- S11 [Save Selected交易与购买后评论](https://superhivemarket.com/products/save-selected/ratings) — 2026-10-08
- S12 [Batch Export Pro交易与购买后评论](https://superhivemarket.com/products/batch-export-pro/ratings) — 2026-10-08
- S13 [Matrixify定价、商家评论](https://apps.shopify.com/excel-export-import) — 2026-10-08
- S14 [Claude Code产品：平台宣称Stripe接口验证](https://trustmrr.com/startup/builtwithai) — 2026-10-08
- S15 [ScreenshotOne收入自述（2025-04）](https://screenshotone.com/blog/200000-arr-and-400-paying-customers/) — 2026-10-08
- S16 [银行对账单转换收入自述（2022-10）](https://bankstatementconverter.com/blog/posts/2022-10-24-5000-monthly-recurring-revenue/) — 2026-10-08
- S17 [Cursor开发移动应用组合的收入自述](https://www.indiehackers.com/post/tech/growing-a-portfolio-of-mobile-apps-to-185k-mo-hZ4hqICtByIljkiJECQv) — 2026-10-08
- S18 [AI开发案例文章（正文访问受限）](https://www.indiehackers.com/post/tech/vibe-coding-examples-4-revenue-generating-apps-built-with-ai-2NUIOp80SUWuPmmfKoS9) — 2026-10-08
- S19 [HN：Claude Code、Tabu.hr企业客户及收入自述](https://news.ycombinator.com/item?id=49922568) — 2026-10-08
- S20 [HN：Woo数据导出软件已有客户，自述（2024）](https://news.ycombinator.com/item?id=41966114) — 2026-10-08
- S21 [Product Hunt：Create Mappins需求与无评论状态](https://www.producthunt.com/products/create-mappins) — 2026-10-08
- S22 [Product Hunt：AI agent观察工具，免费且无评论](https://www.producthunt.com/products/koan-agentic-observability-platform) — 2026-10-08
- S23 [Reddit：安全改价工作流需求](https://www.reddit.com/r/woocommerce/comments/1q6d2s5/how_do_you_safely_update_woocommerce_prices_when/) — 2026-10-08
- S24 [WordPress：CSV覆盖已有属性的反馈](https://wordpress.org/support/topic/i-need-some-clarification-regarding-creating-product-attributes/) — 2026-10-08
- S25 [Woo CSV历史问题，已关闭](https://github.com/woocommerce/woocommerce/issues/59243) — 2026-10-08
- S26 [Woo官方CSV格式、SKU/ID匹配和更新](https://woocommerce.com/document/product-csv-importer-exporter/) — 2026-10-08
- S27 [Woo价格分隔符排错说明](https://woocommerce.com/document/product-csv-import-suite/product-csv-import-suite-faq-troubleshooting/) — 2026-10-08
- S28 [CatalogDock免费功能覆盖，反证](https://wordpress.org/plugins/csvrepair-for-woocommerce/) — 2026-10-08
- S29 [Shopify CSV Import Guardian：定价但无评论](https://apps.shopify.com/csv-import-guardian) — 2026-10-08
- S30 [Shopify CSV Import Doctor：定价但无评论](https://apps.shopify.com/csv-import-doctor-1) — 2026-10-08
- S31 [WooPayments新增内置财务报告，替代风险](https://developer.woocommerce.com/2026/08/06/woopayments-reports/) — 2026-10-08
- S32 [打印条码付费插件及用户评论](https://en-gb.wordpress.org/plugins/a4-barcode-generator/) — 2026-10-08
- S33 [免费库存条码插件覆盖](https://en-gb.wordpress.org/plugins/sia-retail/) — 2026-10-08
- S34 [Reddit：19x51mm条码打印后无法扫描](https://www.reddit.com/r/shopify/comments/1u8xs8x/shopify_barcode_app_generates_labels_that_wont/) — 2026-10-08
- S35 [TOPSALE：热敏打印7.90美元/月，浏览器免费](https://apps.shopify.com/label-printing-topsale) — 2026-10-08
- S36 [免费CSV批量条码与尺寸检查工具，反证](https://webtoolarc.com/barcode-label-generator/) — 2026-10-08
- S37 [免费4x6裁剪](https://labelcrop.app/) — 2026-10-08
- S38 [免费ZPL设计与CSV合并，反证](https://makezpl.com/) — 2026-10-08
- S39 [免费Blender批量导出扩展](https://extensions.blender.org/add-ons/superduperbatchexporter/) — 2026-10-08
- S40 [付费导出竞品支持8格式和文件清单](https://superhivemarket.com/products/fast-export/) — 2026-10-08
- S41 [批量blend保存免费扩展，反证](https://extensions.blender.org/add-ons/batchforge-batch-export/) — 2026-10-08
- S42 [WordPress新插件提交与审核时间](https://wordpress.org/plugins/developers/add/) — 2026-10-08
- S43 [WordPress插件完整规则](https://developer.wordpress.org/plugins/wordpress-org/detailed-plugin-guidelines/) — 2026-10-08
- S44 [Chrome开发者注册和国家支持](https://developer.chrome.com/docs/webstore/register) — 2026-10-08
- S45 [Chrome官方资讯提及5美元注册费](https://developer.chrome.com/docs/extensions/whats-new) — 2026-10-08
- S46 [Shopify开发者注册费、术语](https://help.shopify.com/en/partners/partner-program/glossary) — 2026-10-08
- S47 [Shopify开发者结算](https://help.shopify.com/en/partners/partner-program/getting-paid) — 2026-10-08
- S48 [uTools付费准入、费率、结算](https://www.u-tools.cn/docs/developer/payment/faq.html) — 2026-10-08
- S49 [Envato暂停作者申请](https://help.author.envato.com/hc/en-us/articles/53981083605913-Author-applications-are-paused-new-authors-join-by-invitation-only) — 2026-10-08
- S50 [Superhive创作者申请](https://support.superhivemarket.com/article/182-how-to-apply-to-become-a-creator) — 2026-10-08
- S51 [Superhive收益文档目录](https://support.superhivemarket.com/category/140-revenue-and-earnings) — 2026-10-08
- S52 [itch.io支付、扣费、税务问卷、等待期](https://itch.io/docs/creators/payments) — 2026-10-08
- S53 [Gumroad到账、地区和门槛](https://gumroad.com/help/article/13-getting-paid) — 2026-10-08
- S54 [LemonSqueezy地区支持](https://docs.lemonsqueezy.com/help/getting-started/supported-countries) — 2026-10-08
- S55 [LemonSqueezy费率](https://docs.lemonsqueezy.com/help/getting-started/fees) — 2026-10-08
- S56 [LemonSqueezy结算](https://docs.lemonsqueezy.com/help/getting-started/getting-paid) — 2026-10-08
- S57 [PayPal中国大陆个人提现费用](https://www.paypal.com/c2/digital-wallet/paypal-consumer-fees?locale.x=en_C2) — 2026-10-08
- S58 [Creem官方价格](https://www.creem.io/pricing) — 2026-10-08
- S59 [Creem地区支持](https://docs.creem.io/merchant-of-record/supported-countries) — 2026-10-08
- S60 [Creem费用、支付宝个人结算、门槛、资金审核](https://docs.creem.io/merchant-of-record/finance/payouts) — 2026-10-08
- S61 [Creem身份验证与收款账号](https://docs.creem.io/merchant-of-record/finance/payout-accounts) — 2026-10-08
- S62 [Creem账户审批要求](https://docs.creem.io/merchant-of-record/account-reviews/account-reviews) — 2026-10-08
- S63 [Creem退款及拒付费用](https://docs.creem.io/merchant-of-record/finance/refunds-and-chargebacks) — 2026-10-08
- S64 [Creem无代码支付链接流程](https://docs.creem.io/getting-started/quickstart) — 2026-10-08
- S65 [Creem文件下载产品示例](https://docs.creem.io/skills/creem-api/WORKFLOWS) — 2026-10-08
- S66 [Creem测试环境与生产环境区分](https://docs.creem.io/getting-started/test-mode) — 2026-10-08
- S67 [Microsoft开发者账户资格](https://learn.microsoft.com/ga-ie/windows/apps/publish/faq/open-developer-account) — 2026-10-08
- S68 [Shopware客户专属价目表：价格与实际使用反馈](https://store.shopware.com/en/cogi184208855891m/b2b-b2c-price-list-for-customer-pdf-csv-catalogue.html) — 2026-10-08
- S69 [数据驱动价目表、多客户版本工作流](https://pagination.com/pagination-price-list-software/) — 2026-10-08
- S70 [Reddit：PDF价目表，含已用AI自行实现的反证](https://www.reddit.com/r/woocommerce/comments/1s48uve/how_do_you_generate_pdf_price_lists_from/) — 2026-10-08
- S71 [免费Woo PDF目录，反证](https://www.reddit.com/r/Wordpress/comments/1vswnac/promo_built_a_free_plugin_to_let_woocommerce/) — 2026-10-08
- S72 [免费通用目录生成，反证](https://www.freewww.com/apps/catalog/) — 2026-10-08
- S73 [产品规格单、商家使用反馈](https://apps.shopify.com/ps-product-datasheets) — 2026-10-08
- S74 [Mailmeteor定价](https://mailmeteor.com/pricing) — 2026-10-08
- S75 [Text Blaze定价](https://blaze.today/plans/) — 2026-10-08
- S76 [UpdraftPlus备份定价](https://teamupdraft.com/updraftplus/pricing/) — 2026-10-08
- S77 [HappyScribe字幕定价](https://www.happyscribe.com/pricing) — 2026-10-08
- S78 [Documint文档自动化定价](https://documint.me/pricing) — 2026-10-08
- S79 [Dr Link Check定价](https://www.drlinkcheck.com/pricing) — 2026-10-08
- S80 [imgproxy商业版定价](https://imgproxy.net/pricing/) — 2026-10-08
- S81 [changedetection托管产品](https://changedetection.io/) — 2026-10-08
- S82 [TexturePacker永久许可商店](https://www.codeandweb.com/store/texturepacker-single) — 2026-10-08
- S83 [WebToffee Woo导入导出套件](https://www.webtoffee.com/product/woocommerce-import-export-suite/) — 2026-10-08
- S84 [B2B客户定价CSV工作流](https://b2bkingplugin.com/docs/customer-price-lists/) — 2026-10-08

- S85 [Price List Pro定价与近期商家使用](https://apps.shopify.com/easy-price-list) — 2026-10-08
- S86 [TierSphere已有TierSheet称呼，名称核查限制](https://www.tiersphere.com/pricing) — 2026-10-08
- S87 [WordPress当前正式版本7.1.3](https://wordpress.org/download/) — 2026-10-08
- S88 [官方Playground CLI](https://developer.wordpress.org/playground/developers/local-development/wp-playground-cli/) — 2026-10-08
- S89 [Cloudflare Pages](https://www.cloudflare.com/products/pages/) — 2026-10-08
- S90 [Cloudflare Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/) — 2026-10-08
- S91 [Cloudflare Pages限制](https://developers.cloudflare.com/pages/platform/limits/) — 2026-10-08
- S92 [Cloudflare Visits定义，不等于去重人数](https://developers.cloudflare.com/web-analytics/data-metrics/high-level-metrics/) — 2026-10-08
- S93 [WordPress price list标签入口/竞争](https://wordpress.org/plugins/tags/price-list/) — 2026-10-08
