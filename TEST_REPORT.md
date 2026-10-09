# 实际测试报告

2026-10-09最新检查点：invoice2data原始源码子集62文件内容核对通过；4项本地PDF集成测试通过，包含中英文文本、金额和两个失败路径。具体版本、实际命令、输出及未测试范围见[本轮测试报告](experiments/github-code-audit/TEST_REPORT.md)。这不代表商业验证、手机可用、任意PDF正确或实际收入。

以下2026-10-08历史TierSheet技术测试记录保留，本轮未复测；该商业方向已停止。

2026-10-08。所有CSV、价目表与财务场景均为合成数据，不代表真实用户或收入。

|检查|实际结果|状态|
|---|---|---|
|npm test / Node24.19|25通过、0失败：CSV/来源行、金额、舍入、覆盖价、SKU、公式/HTML安全、ZIP、5000行、退款/到账分类、去重转化、服务器边界|已测试|
|Chromium153.0.8010.0|11组真实流程：各类下载、旧结果失效、坏输入阻断、Unicode CSV、安全输出、PDF失败/CSV回退、390px布局、免费101行、销售关闭、介绍页免费入口；默认无外部HTTP请求|已测试|
|独立Python/pypdf/ZIP检查|9文件ZIP CRC正常；三档位15价格正确/覆盖审计准确；3个单页A4与101行5页PDF有效、JPEG1240×1754|已测试|
|Poppler与截图检查|实际渲染样例与分页，检查价格/行/页码；桌面和手机无横向溢出|已测试|
|WordPress7.1.3/PHP8.3及7.4|一次性本地WASM/SQLite，About/Server Info确认版本；工具/沙箱/PDF下载、退出后管理页转登录通过|已测试|
|WordPress ZIP安装|全新本地站点，上传生成ZIP→安装→启用→工具PDF下载，通过|已测试|
|四个最终分发ZIP|CRC/SHA-256、GPL/源码分离、公开页关闭付款、无private/tooling泄漏，通过|已测试|
|空实际账本|访问/使用/意向/转化null，付款0、付款人0、退款0，币种账目空，没有测试数据|已测试|
|公开发布、生产支付、下载邮件、Alipay到账|未执行，销售关闭|待授权 / 未验证|
|生产主机/MySQL、Safari/Firefox/iOS、20,000行×20档位压力|未做这些覆盖，不宣称全面兼容|未验证|

结构化原始通过记录在docs/verification，真实截图在docs/screenshots。

```sh
npm test
npm run build
node scripts/browser-qa.cjs
python3 scripts/verify-exports.py
node scripts/wordpress-qa.cjs
TIERSHEET_PHP_VERSION=7.4 node scripts/wordpress-qa.cjs
TIERSHEET_WP_INSTALL_ZIP=1 TIERSHEET_WP_PORT=9425 node scripts/wordpress-qa.cjs
node operations/ledger.cjs operations/actual-events.jsonl
```

## 失败与修复记录

- 标准浏览器下载返回不完整ZIP，失败；npm开发用Chromium替代后完整流程通过，软件本身不需要此依赖。
- 远程测试浏览器不能访问本机端口，失败；改真实本地离线测试，没有为测试擅自部署。
- 早期独立ZIP断言用了错误表头；核对实际Source/Override后修正，所有15价格/来源通过。
- CLI自动登录不能证明退出权限；改实际登录/清cookie；一次并发启动超时，独立端口顺序复测通过。
- PDF长档位名/巨大价格潜在溢出增加显式检查；长商品名实际失败后CSV完整回退。
- 生产支付/渠道未知不列通过；没有模拟交易代替付款。
