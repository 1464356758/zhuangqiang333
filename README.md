# zhuangqiang333

## AI自主创业实验室 · 当前核验自用收入

2026-10-09，Asia/Shanghai。**TierSheet商业选择已停止；可运行软件及测试作为历史技术成果保留。真实收入/到账0，新增现金支出0。**

用户最新要求是自己挂着或使用软件，由现成平台支付收入，不寻找软件买家。本人已确认居住中国大陆、只有手机，若收入成立可考虑买电脑；尚未授权采购。当前最接近目标的验证对象是ClawHunt：官方允许AI竞标交付，钱包公开写明支持支付宝/微信/银行卡；具体资格、费用、获单和本人到账未验证。已准备[小额试单关口](operations/AGENT_TASK_PILOT.md)，没有注册、竞标、收费或新软件。原始来源在[research/SELF_USE_INCOME_REVIEW.md](research/SELF_USE_INCOME_REVIEW.md)，恢复状态在[PROJECT_STATUS.md](PROJECT_STATUS.md)。商家费用研究与TierSheet商业选择仍停止，旧开户/发布请求仍撤回；不建议先购机。

### 历史原型：TierSheet

商品CSV＋档位折扣CSV＋可选SKU覆盖价→各档位PDF/CSV、价格审计、HTML和批量ZIP。整数金额计算，不上传、不修改店铺、不用AI API或服务器。完整免费单价目表版可作为WordPress插件。

![真实运行截图，合成样例，不是客户数据](docs/screenshots/tiersheet-desktop.png)

### 立即使用

[下载离线批量软件ZIP](deliverables/tiersheet-standalone-0.1.0.zip)，解压后双击 `index.html`。桌面Chrome/Edge可直接运行。也可下载/克隆项目后打开 `dist/index.html`。
Try sample files → Build price lists → 勾选核对框 → Download all tiers · ZIP。
免费版打开 `dist/free.html`。中文教程：[TUTORIAL.md](TUTORIAL.md)。

Node20+也可运行：

```sh
npm run build
npm test
npm start
```

无第三方npm运行依赖。PDF是150 DPI图片页，文本不可选择；CSV/HTML为文字格式。

|成果|状态|
|---|---|
|28机会、20商业/AI案例（12公开交易计数）、12OSS、9渠道；10候选评分与1最优/2备用|已完成|
|离线批量/完整免费版，真实PDF/ZIP，WordPress7.1.3/PHP8.3和7.4/实际ZIP安装|已完成 / 已测试|
|25自动测试、11浏览器组、独立输出校验|已测试|
|原CSV预检因免费覆盖而停止|失败|
|生产主机/MySQL、其他浏览器、付费意向、自然曝光|未验证|
|原方案发布/收款|未验证：方案已撤回|
|生产支付、邮件交付、真实收入重复性|未验证|

### 完整记录

- [research/SELF_USE_INCOME_REVIEW.md](research/SELF_USE_INCOME_REVIEW.md)：当前自用收入与手机/购机核验；任务、辅助与现金条件仍未验证。
- [research/INFORMATION_GAP_REVIEW.md](research/INFORMATION_GAP_REVIEW.md)：历史信息差、费用漏损证据、竞争及准入/收款反证。
- [research/DIRECTION_REVIEW.md](research/DIRECTION_REVIEW.md)：上一轮持续业务问题与竞争反证。
- [operations/SALES_GATE.md](operations/SALES_GATE.md)：已撤回的历史发布/收款草稿。
- [research/CASH_FIRST_REVIEW.md](research/CASH_FIRST_REVIEW.md)：最新标价需求、原始任务和付款规则反证。
- [RESEARCH.md](RESEARCH.md) / [research/GITHUB.md](research/GITHUB.md)：首轮原始链接、日期、证据等级、许可证和反证。
- [BUSINESS.md](BUSINESS.md)：评分、定价/成本/结算、停止规则。
- [PROJECT_STATUS.md](PROJECT_STATUS.md) / [TODO.md](TODO.md)：恢复检查点。
- [TEST_REPORT.md](TEST_REPORT.md) / [SECURITY.md](SECURITY.md)：实际测试与边界。
- [DEPLOY.md](DEPLOY.md) / [RELEASE.md](RELEASE.md)：部署、收款、商店材料与恢复。
- [operations/MEASUREMENT.md](operations/MEASUREMENT.md)：访问/使用/意向/付款/到账分别记录。
- [DELIVERY.md](DELIVERY.md)：按十项标准的实际交付总表。

历史拟入口为WordPress目录搜索→完整免费插件→批量版；当前方案已停止，不继续申请发布或拉用户。
历史拟$19买断/12个月更新未实施，Creem本人KYC/发布步骤已撤回。
当前未联系真人、付广告费或拿测试交易冒充收入；会话结束后没有持续后台执行。
免费包GPL-2.0-or-later，完整COPYING已包含；独立批量码另见 [LICENSES.md](LICENSES.md)。公共源码增加复制风险，不保证盈利或源代码保密。

已保存的分发包在本仓库 `deliverables/`；完整源码包可直接下载，校验码见 `deliverables/checksums.json`。维护者也可用 `python3 scripts/package.py` 重新生成release文件。

软件代码本轮未更改，原ZIP保留2026-10-08版本；完整源码ZIP中的文档是当日快照。最新决策及检查点以main的PROJECT_STATUS和research/SELF_USE_INCOME_REVIEW为准。
