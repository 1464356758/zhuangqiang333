# zhuangqiang333

## TierSheet · AI自主创业实验室的第一轮有限实验

2026-10-09 UTC。**可运行软件已完成并测试；没有真实买家，盈利未验证。销售关闭，实际付款/到账0，追加现金支出0。**

当前暂停新增功能，下一项是把现成软件带到实际目录并验证购买；账号、市场发布和收费待授权。公开悬赏/接单已复查，未找到通过条件的确认订单，不将接单工作冒充自动收入。具体步骤在[operations/SALES_GATE.md](operations/SALES_GATE.md)。

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
|账号实名、卖家资料、最终政策、正式发布/收款|待授权|
|生产支付、邮件交付、真实收入重复性|未验证|

### 完整记录

- [operations/SALES_GATE.md](operations/SALES_GATE.md)：具体商品、零现金发布、本人操作与真实收款验收。
- [research/CASH_FIRST_REVIEW.md](research/CASH_FIRST_REVIEW.md)：最新标价需求、原始任务和付款规则反证。
- [RESEARCH.md](RESEARCH.md) / [research/GITHUB.md](research/GITHUB.md)：首轮原始链接、日期、证据等级、许可证和反证。
- [BUSINESS.md](BUSINESS.md)：评分、定价/成本/结算、停止规则。
- [PROJECT_STATUS.md](PROJECT_STATUS.md) / [TODO.md](TODO.md)：恢复检查点。
- [TEST_REPORT.md](TEST_REPORT.md) / [SECURITY.md](SECURITY.md)：实际测试与边界。
- [DEPLOY.md](DEPLOY.md) / [RELEASE.md](RELEASE.md)：部署、收款、商店材料与恢复。
- [operations/MEASUREMENT.md](operations/MEASUREMENT.md)：访问/使用/意向/付款/到账分别记录。
- [DELIVERY.md](DELIVERY.md)：按十项标准的实际交付总表。

拟入口是WordPress目录搜索→完整免费插件→用户主动到独立批量版，不保证新插件排名或自然流量。
拟$19买断/12个月更新；Creem大陆个人Alipay需本人KYC/审查，$50余额门槛会使到账晚于首单。
当前未联系真人、付广告费或拿测试交易冒充收入；会话结束后没有持续后台执行。
免费包GPL-2.0-or-later，完整COPYING已包含；独立批量码另见 [LICENSES.md](LICENSES.md)。公共源码增加复制风险，不保证盈利或源代码保密。

已保存的分发包在本仓库 `deliverables/`；完整源码包可直接下载，校验码见 `deliverables/checksums.json`。维护者也可用 `python3 scripts/package.py` 重新生成release文件。

软件代码本轮未更改，原ZIP保留2026-10-08版本；完整源码ZIP中的文档是当日快照。最新决策及检查点以main的PROJECT_STATUS和SALES_GATE为准。
