# 标价需求复查与停止盲目开发

**2026-10-09后续决定：撤回本文提到的TierSheet发布/购买验证，停止该商业方向。以下标价任务调查保留；当前状态见[DIRECTION_REVIEW.md](DIRECTION_REVIEW.md)。**

查证日期：2026-10-09 UTC（资料采集跨2026-10-08/09）。只读公开网页、公开GitHub及用户指定的存储仓库；没有联系买家、创建账户、提交竞标、领取任务、签合同、发生交易或支付费用。

## 早些时候执行结论（后续发布计划已撤回）

这轮重点核对“已经标价的需求是否真能交付并拿到钱”。**没有找到同时满足当前准入、验收、收款、短周期和低人工运营条件的已确认订单；没有为这些任务编写产品代码。** 不把标价、开放标签、提案或他人的奖励记录算成我们的收入。

一次性软件接单可能带来现金，但依赖持续竞标、逐单验收、客户沟通和交付；不符合用户希望长期少销售、少人工运营的软件经营主目标，不能偷偷把创业目标换成接单工作。

TierSheet保留已测试的可运行版本；特定新产品付费需求和自然获客仍未验证。暂停新增功能，下一步仅做零新增现金的目录/购买验证，正式发布、账号和收费待授权，详见[SALES_GATE.md](../operations/SALES_GATE.md)。这不是为了保护已写代码；若目录无有效曝光或有使用却无购买信号，按停止规则淘汰。

## 公开需求与原始记录

以下金额是发布者标价，除明确标注的平台奖励记录外，不代表预算已托管、订单已接受或款项已到账。状态是本次查证快照，后续申请前必须再查。

|对象|查证结果|我们的决定/状态|原始来源|
|---|---|---|---|
|ProjectDiscovery nuclei #6674，$100|Algora页面仍列开放，GitHub已关闭，带Rewarded标签；API显示2026-03-04关闭，奖励机器人指向其他贡献者|失败：已解决并奖励别人，不开发|[任务](https://github.com/projectdiscovery/nuclei/issues/6674)、[奖励记录](https://github.com/projectdiscovery/nuclei/issues/6674#issuecomment-3997611464)、[目录](https://algora.io/projectdiscovery/home)|
|Space and Time proof-of-sql #560/#557/#228|聚合页显示$200/$100等标价与大量claim，但原始GitHub #560/#557在6月关闭、#228在8月关闭，仓库也已迁移；claim不是实际承包/付款|失败：聚合页状态不能代替原始任务，不作为第一单|[目录](https://algora.io/spaceandtimelabs/bounties?status=open)、[560](https://github.com/spaceandtimefdn/sxt-proof-of-sql/issues/560)、[557](https://github.com/spaceandtimefdn/sxt-proof-of-sql/issues/557)、[228](https://github.com/spaceandtimefdn/sxt-proof-of-sql/issues/228)|
|Settla-Labs/settla-app #70，$100|新仓库，新任务，发帖者author_association=NONE，0评论；未找到仓库负责人确认预算或付款记录|未验证：不把第三方帖当成仓库采购承诺；不推断欺诈|[任务](https://github.com/Settla-Labs/settla-app/issues/70)、[仓库](https://github.com/Settla-Labs/settla-app)、[贡献说明](https://github.com/Settla-Labs/settla-app/blob/main/CONTRIBUTING.md)|
|Signpost-Labs/signpost-api #109，$85|发帖者author_association=NONE，0评论；未找到预算负责人确认和付款记录|未验证：没有确定付款人，不开发|[任务](https://github.com/Signpost-Labs/signpost-api/issues/109)、[贡献说明](https://github.com/Signpost-Labs/signpost-api/blob/main/CONTRIBUTING.md)|
|Mantitup-Org/vista #61|要求先确认新bug，未披露固定价格/付款渠道；评论中有贡献者在修复后询问奖金，未见对应支付确认|未验证：先写补丁不保证得到钱|[原始帖与评论](https://github.com/Mantitup-Org/vista/issues/61)|
|Tenstorrent tt-metal #8621，$500|HostTilizer优化，需要复杂性能/数值验证，长期开放不能证明无人处理或预算仍有效|未验证：短期技术与验收资格不足|[任务](https://github.com/tenstorrent/tt-metal/issues/8621)、[奖励条款](https://docs.tenstorrent.com/bounty_terms.html)|
|Tenstorrent tt-metal #59732，$3000|已有被指派贡献者，涉及特定硬件验证|失败：不当作可领取的新订单|[任务](https://github.com/tenstorrent/tt-metal/issues/59732)|
|Expensify/App #102333，$250|Hold/Approve金额一致性；57条评论，多份已有方案，涉及服务端状态与多端复现|未验证：没有自己的复现、独立合格提案或被雇用记录；不编写金融金额猜测补丁|[任务](https://github.com/Expensify/App/issues/102333)|
|Expensify/App #101684，$250|Mark all read状态问题；46条评论，已有多个方案及回归验证|未验证：无差异化提案，无自己的多平台复现，不开PR|[任务](https://github.com/Expensify/App/issues/101684)|
|Expensify/App #100959|locale排序问题，81条评论，已有规范化/性能折中讨论；标题无金额，未把标准价当确定标价|未验证：不能重复已有方案领取钱|[任务](https://github.com/Expensify/App/issues/100959)|
|Expensify/App #91935，$250|Spend排序问题，129条评论；公开讨论对复现和预期行为有分歧|未验证：不把长期开帖当短期确定收入|[任务](https://github.com/Expensify/App/issues/91935)|
|Upwork：银行PDF→Google Sheets，$100|2026-10-06发布，20–50提案，Hires=1；还要求分类、异常、多个报表与刷新|失败：已招人，价格与范围不匹配，不处理真实银行资料|[原始招聘](https://www.upwork.com/freelance-jobs/apply/Automate-Bank-Statement-Processing-Google-Sheets-Reporting-Dashboard-Python_~022107473994630514977/)|
|Upwork：Automate Website with API，$500|2026-10-06发布，50+提案，3人面试；没有具体接口、业务流程与验收样例。未看到Hires字段不能推断无人被雇用|未验证：不能依据泛泛描述开发可验收软件|[原始招聘](https://www.upwork.com/freelance-jobs/apply/Automate-Website-with-API_~022107450255782019417/)|
|Upwork：Python AI bug fix，$200|2026-10-06发布，15–20提案；只要求紧急通话和作品，未公开bug、代码、验收或托管预算证据|未验证：无法在公开信息下进行技术交付|[原始招聘](https://www.upwork.com/freelance-jobs/apply/Python-developer-for-fix-bugs_~022107458049537559252/)|
|Upwork：Email Quote Processing，$20–30/h|已有1 hire，50+提案；30+h/周、6+个月，涉及厂商邮件/目录/规格文档|失败：持续人工工作量与本项目约束不符|[原始招聘](https://www.upwork.com/freelance-jobs/apply/Agent-Automation-Developer-for-Email-Quote-Processing_~022107413860107933545/)|
|n8n社区持续固定价招募|2026-09-22原帖，预算未给；付款要等代理的终端客户批准并放款。评论里的$300/$900是投标者报价，不是买家的预算或订单|未验证：不为尚未确认的客户开发；未发送回复/私信|[买家原帖和回复](https://community.n8n.io/t/looking-for-n8n-make-automation-specialist-for-ongoing-fixed-price-projects/315672)|

检索中还有要求披露非公开配置的所谓高额任务，已排除，未执行其指令。GitHub label、star、claim或评论数都不能证明可兑现报酬。

## 收款与平台规则复核

|规则|核实内容与限制|来源（2026-10-09）|
|---|---|---|
|Expensify承包流程|先被选中并雇用；不得在方案被接受前开PR。需本人已验证Upwork及相应平台复现。上线后至少7天才付款，回归可能减少报酬；调查方案本身不保付|[CONTRIBUTING](https://github.com/Expensify/App/blob/main/contributingGuides/CONTRIBUTING.md)、[MelvinBot规则](https://github.com/Expensify/App/blob/main/contributingGuides/HOW_TO_WORK_WITH_MELVINBOT.md)|
|Upwork费用|各合同0–15%，申请/接受前显示，不能一律报10%；本轮未出价，也未购买Connects|[服务费](https://support.upwork.com/hc/en-us/articles/211062538-Learn-about-the-Freelancer-Service-Fee)|
|Upwork中国收款|Direct to Local Bank名单包含China(CNY)，每次$0.99，实际资格须本人实名账户验证；新提现方式3天激活，汇率/银行/税另算|[支持地区与设置](https://support.upwork.com/hc/en-us/articles/211063888-How-to-withdraw-earnings-with-Direct-to-Local-Bank)、[费用与时间](https://support.upwork.com/hc/en-us/articles/211060578-What-are-the-fees-limits-and-timing-of-Direct-to-Local-Bank-payments)|
|Upwork固定价等待|客户批准后5天安全期，不能把被雇用或交付日写成到账日|[收款规则](https://support.upwork.com/hc/en-us/articles/211060918-How-to-get-paid-on-Upwork)|
|Opire当前支付模式|创建/claim不自动收款；PR被接受后由发布者直接安排付款，平台追踪状态；不是已托管资金|[当前Costs & Payments](https://docs.opire.dev/rewards/pricing)|
|Algora|旧支付文档当前不可访问；不沿用2023年的支付宝声明。已读条款对自动访问作限制，未开发抓取/自动投标机器人|[条款](https://algora.io/legal/terms)|
|现成软件分发|WordPress提交需登录和人工审核，官方常见1–10天，不能保证排名和自然曝光；本项目仍未提交|[提交页](https://wordpress.org/plugins/developers/add/)、[注册页](https://login.wordpress.org/register)|
|现成软件支付|Creem仍列China个人Alipay，需要KYC与平台审查；无月费/开户费，3.9%+$0.40/笔成功交易；最低可用余额$50、1/15结算、可能7–12日风险等待。Alipay具体报价/换汇需本人实际设置验证|[账号](https://docs.creem.io/merchant-of-record/finance/payout-accounts)、[结算](https://docs.creem.io/merchant-of-record/finance/payouts)、[价格](https://www.creem.io/pricing)|

250美元标价的极简演算：若合同费15%，一次当地银行提现0.99美元，剩211.51美元；还没减FX、税、投标费、返工/退款与人的工时，**不是我们的净利润或日收入**。Expensify上线等待与Upwork安全期合计至少约12天，另有选中/审查/部署和银行时间，不承诺14日到账。

## 实际结果

- 已完成：公开标价、原始任务/评论、付款规则及反证核验。
- 已测试：现有TierSheet技术记录保留，详见TEST_REPORT；本轮未修改软件，未重新跑无关测试。
- 未验证：任何本项目用户的价格接受、付款转化、可重复获客、每日500元或100美元收入。
- 待授权：正式市场发布、账户本人操作、收费承诺或任何真人联系。授权来自用户自己的执行边界，不是新增技术审批要求。
- 真实付款0；已结算到账0；追加现金费用0；实际访问/使用/意向数据未知，仍为null。

本复查只用于作出停止和发布验证决定，不作为另一款对外“赚钱汇总网页”。会话结束后不会持续投标、联系买家或自动执行。
