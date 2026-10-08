# 运行、发布、付款和恢复

查证/准备日期2026-10-08。产品可离线运行；**正式发布、账号注册/KYC、生产交易尚未执行**。
本文件只给出可复核的操作，不声称有公网访问链接或平台批准。

## 本地运行与维护

安装Node.js 20或更新版本，取得完整项目后执行：

```sh
npm test
npm run build
npm start
```

打开终端输出的 `http://127.0.0.1:8713`。服务器只绑定本机；无需npm安装依赖，免费和批量软件也不调用AI。
或直接打开 `dist/index.html`。端口冲突时使用任务专用变量，例如 `TIERSHEET_PORT=8714 node scripts/serve.cjs`。
`npm start`需在自己的电脑运行；当前会话本地测试地址不是向外发布的地址。

源代码在 `src/`，界面在 `web/`。`npm run build`会重新生成独立HTML、完整免费插件和公开介绍页草稿 `dist/site/`。
不要手工改dist后忘记同步源码。改价计算/CSV规则应运行自动测试，改浏览器脚本应再检查真实下载。
`python3 scripts/package.py`生成分发ZIP及SHA-256；ZIP包含可维护源码，不含开发浏览器、测试站点或私人收款凭据。

可选浏览器复测：安装Playwright和浏览器，设置 `TIERSHEET_PLAYWRIGHT`、`TIERSHEET_CHROMIUM` 后执行 `node scripts/browser-qa.cjs`。
本轮使用Node24.19、Chromium153与系统运行时Playwright。受限环境的可复现办法：

```sh
npm install --prefix tooling --no-save --package-lock=false --ignore-scripts @sparticuz/chromium@153.0.0
node scripts/prepare-test-browser.mjs
node scripts/browser-qa.cjs
```

该备用解压步骤需Python3.12+。导出检查需要开发用 `pypdf` 和Poppler：`python3 scripts/verify-exports.py`。
开发工具不进入售卖软件；不要把它们当成运行成本。

WordPress集成复测需官方 `@wp-playground/cli@3.1.57`，开发机Node≥24.18；包提示npm≥11.16，本轮npm11.9实际运行成功，但建议遵循其声明版本。
在独立 `wp-tooling` 安装，执行 `node scripts/wordpress-qa.cjs`；默认一次性本地WordPress7.1.3/PHP8.3，可用 `TIERSHEET_PHP_VERSION=7.4` 复核。
不会接触用户已有站点。Playground采用PHP WASM/SQLite，不能替代生产主机MySQL兼容验证。

## 最少的本人操作

1. 提供准备公开使用的卖家名称、有效客服邮箱，以及WordPress.org用户名。这些是公开资料；不要发送身份证、收款账号、密码、验证码或密钥。
2. 批准拟售价$19买断、12个月更新、7日不适用退款草稿，以及产品页面/免费插件的正式提交。确认后先补齐法律文本和账号资料，再最终发布；未批准前保持关闭。
3. 本人在Creem完成中国大陆个人身份验证及支付宝收款设置。下面是官方页面和路径；如果平台显示不同选项，以当前真实界面为准并保存实际报价，不能填虚假地区。

## 公共介绍页：不需要购买域名

准备好身份、客服与政策文本后，可在[Cloudflare控制台](https://dash.cloudflare.com/)使用免费Pages方案。
**Workers & Pages → Create application → Get started → Drag and drop your files**，输入项目名如 `tiersheet-pricelist`，上传 `tiersheet-public-site-0.1.0.zip` 或 `dist/site/`，最终 **Deploy site** 属于待授权发布。
官方会给实际 `*.pages.dev` 链接；名称可用性未查，不预先捏造URL。账号条款由本人接受，不添加付费方案或买域名。
只上传site文件夹，不上传整个项目或私人账本。静态免费配额内目标固定费用0；账号地区访问与未来条款变化需在本人操作时确认。
更新时 **Create a new deployment** 上传新构建；有故障则重新上传前一版本，销售出错先关闭付款链接。

来源：[Pages](https://www.cloudflare.com/products/pages/)、[Direct Upload](https://developers.cloudflare.com/pages/get-started/direct-upload/)、[限制](https://developers.cloudflare.com/pages/platform/limits/)，2026-10-08。
GitHub目前只作为用户授权的文件保存空间；没有为销售网站自动开启GitHub Pages。

## Creem开户和产品

打开[Creem](https://www.creem.io/)并使用本人的邮箱注册。按本人真实身份选择China/个人资料，税务居住地与收款人一致。
在 **Balance → Payout Account** 完成平台要求的 **KYC/KYB** 和收款资料；大陆个人官方提供Alipay路径。
在官方页面直接提交身份证明与支付宝资料；不经过本项目或聊天。记录最终是否获准、实际支付宝收费与换汇报价。
准备提交的页面需真实可访问、产品功能说明、$19定价、隐私/条款/退款页和可联系的客服邮箱；月收入填真实0，不冒充已有客户。
审批未完成前不使用Live收款。

在 **Test mode** 中 **Products → Create product**：

- 名称 `TierSheet Batch Price Lists`，USD19，one-time，不创建订阅。
- 描述见 `RELEASE.md`；上传真实截图，清楚标注sample。
- 如果后台提供 **File Downloads**，上传standalone ZIP并查看下载/邮件设置。这个特性在官方例子中存在，但本轮没有验证你的后台、邮件自动发送或访问有效期。
- 从产品 **Share payment link** 取得测试链接，按官方测试模式说明验证付款失败/成功、下载及邮件。不使用自己的真实卡“造首单”。

Test交易只证明流程。以production成功金额>0且独立真实买家为首单；平台可能进行的零元审查单也不算收入。
审批、交付测试与本人售卖授权后，在Live建立相同一次性产品，再取得正式支付链接。确认公开价、税、邮件、ZIP版本一致。

将**仅公开资料**写入 `src/config.js`：`paymentMode:'live'`、正式`checkoutUrl`、`sellerName`、`supportEmail`。
把正式介绍页HTTPS地址及同一卖家/邮箱写入 `src/free-config.js`。执行build/package后复查。
免费插件的外部介绍链接才会出现；它已有的功能永远不依赖付款。免费包不含批量代码或解锁许可证。
不要在任何前端配置、GitHub提交或站点加入API密钥。静态介绍页只跳转Creem，不处理银行卡，不凭回跳页面确认收款。

来源：[国家](https://docs.creem.io/merchant-of-record/supported-countries)、[收款账号](https://docs.creem.io/merchant-of-record/finance/payout-accounts)、[审查](https://docs.creem.io/merchant-of-record/account-reviews/account-reviews)、[无代码支付链接](https://docs.creem.io/getting-started/quickstart)、[文件下载示例](https://docs.creem.io/skills/creem-api/WORKFLOWS)、[测试模式](https://docs.creem.io/getting-started/test-mode)，2026-10-08。

## 第一笔付款与第一笔到账

官方费率3.9%+$0.40，税/退款/结算规则见BUSINESS.md。最低余额$50，风险等待可能7–12天，之后1/15窗口，不承诺第一单立即到账。
以$19税外价估算每单交易后约$17.71–17.86，未扣批次结算、FX和个人税费；无退款情况下约3单越过$50。这是演算，不是本项目收益。
在后台看production订单状态、金额、税和费用，保存实际订单证据；再单独核对Balance的可用余额和支付宝真正到账。
退款通过平台订单处理，原交易费用通常不退；拒付可能$25。消费者法定权利及平台退款权限优先，7日草稿需批准。
来源：[价格](https://www.creem.io/pricing)、[结算](https://docs.creem.io/merchant-of-record/finance/payouts)、[退款](https://docs.creem.io/merchant-of-record/finance/refunds-and-chargebacks)，2026-10-08。
平台MoR不自动解决个人在中国的经营登记/所得税安排；具体资格未核实，不能据本文认定无需办理。

## WordPress正式提交

在[WordPress.org账户注册页](https://login.wordpress.org/register)自行注册并确认邮箱，或使用已授权的本人账号。
把 `wordpress/tiersheet-price-list/readme.txt` 的Contributors替换为真实用户名，补齐作者支持资料、截图与正式介绍页链接。
再次构建、测试插件ZIP；在[提交页](https://wordpress.org/plugins/developers/add/)上传免费插件ZIP，检查名称和说明，最终提交待授权。
目录规则允许外部独立付费工具，但目录中已有的功能必须完整免费；不能加入行数收费锁、到期停止或许可证激活器。源码及GPL文本已包含。
审核常见1–10天，排名和曝光不保证。收到审核问题后修正代码/文档，不买下载量或刷评价。
若获批会提供SVN信息，将源码部署trunk、0.1.0标签、`docs/screenshots/wordpress-admin-sample.png`作为assets/screenshot-1.png。需要账号写入权限才能操作，不提前提交凭据。

## 统计和收入恢复

实际统计、人工工时及证据口径见 `operations/MEASUREMENT.md`。`operations/actual-events.jsonl`为空；没有测试数据混入实际账本。
运行 `node operations/ledger.cjs operations/actual-events.jsonl`，未知的访客/使用/意向输出null，成功付款0。生产订单、退款、手续费和结算证据仅在本人私有文件夹记录；每周核对，不公开客户邮箱或账号。

## 停止/回滚

付款链接错误、交付失败或退款争议：先将paymentMode改回off并重新构建公开页；在Creem后台停止该产品销售；已付款客户仍应获得交付/退款处理，不能通过关闭页面逃避。
浏览器版本回退：用前一已验证ZIP替换，保留版本与SHA-256；重新用样例核对价格。
WordPress停用：Plugins中Deactivate，不写商品、不建表，无数据迁移；必要时回退插件ZIP。不要清空商家数据库。
开发中断：读PROJECT_STATUS、TEST_REPORT、BUSINESS、TODO，核对仓库最新提交和实际测试，再从未完成项继续。会话结束后没有自动研究、推广或收款的后台工作承诺。
