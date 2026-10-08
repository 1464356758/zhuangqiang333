# 发布材料和首轮转化检查

日期2026-10-08。状态：文案/真实功能截图已完成；身份、名称、最终政策、正式发布与付款待授权。

## 产品定位

暂用名：TierSheet Price List / TierSheet Batch Price Lists。
客户：已经有商品CSV、经常给零售/经销/批发不同客户发送价目表的小商家。
付费理由待验证：减少逐份改价与排版、覆盖价重复录入、错发档位。没有证明具体节约小时数或提高收入，文案不写量化收益。
关键词候选：`price list`, `CSV price list`, `PDF price list`, `wholesale price list`, `customer price tiers`。
这些是业务词，不是已核实月搜索量；不购买SEO数据或广告。

## WordPress目录介绍（英文）

**Title:** TierSheet Price List

**Short description:** Create a complete PDF, CSV or HTML price list from a product CSV, locally in your browser.

**Description:**

Create a clear price list without copying prices into a document template. Choose a UTF-8 product CSV, map SKU, product name and unit-price columns, review the preview and input notices, then download PDF, CSV or HTML output.

All included features are free. No account, expiry, licence key or row-based payment lock is required. Files stay in the browser's memory; the tool does not fetch your store, change products or send documents to customers.

PDF output uses A4 image pages at approximately 150 DPI and the fonts installed on your device. For long product names or very large lists, CSV and HTML remain available. Currency is a label; the tool does not calculate tax or perform exchange conversion.

Use Tools → TierSheet Price List after installation. Any product CSV with a unique SKU, a complete name and a decimal price works; WooCommerce export columns can be mapped manually.

完整说明和安装FAQ在插件readme.txt。Contributors需本人真实WordPress用户名；拟正式作者名称/支持邮箱未填写，不能直接把草稿当已批准页面。

## 独立批量版商品介绍（英文）

**Product:** TierSheet Batch Price Lists

**Price proposal:** $19 one-time. Keep using the purchased version; 12 months of updates. No subscription is created.

Create a matching set of price lists for different customer tiers. Add one product CSV and a CSV of tier discounts. Use optional specific product prices where a discount does not apply. Preview each tier, then download all tier CSVs and PDFs in a single ZIP, together with a price-source audit and an HTML preview.

Runs locally in a modern desktop browser. No store connection or AI API is required. All input rows must pass validation before export. Prices are rounded half up using the decimal precision you select.

This version supports up to 20 price tiers, 25 MB inputs and 20,000 product rows. PDF batches have a 100-page memory bound; CSV/HTML can handle larger outputs within the input bound. PDF pages are images, so text is not selectable/searchable. No tax, currency conversion, images, store import or automatic customer delivery is included.

Before paying, use the complete free single-list edition to check that your CSV format works. Please contact the published support address if you need a workflow outside these features.

## 可审阅的真实材料

- `dist/site/index.html`：真实介绍页草稿；免费试用入口已可运行，批量价为拟售价，销售关闭。
- `docs/screenshots/tiersheet-desktop.png`：批量版样例真实运行截图。
- `docs/screenshots/tiersheet-mobile.png`：390px手机布局；不声称测试过所有手机浏览器。
- `docs/screenshots/tiersheet-free-desktop.png`：101条合成商品验证免费完整导出。
- `docs/screenshots/wordpress-admin-sample.png`：本地一次性WordPress中实际工具页面。

全部样例/截图是合成数据，不是客户、真实订单或使用量。没有虚构评价、收入卡片或倒计时稀缺营销。
WordPress获准后将其管理员截图放入目录SVN assets/screenshot-1.png，不能使用竞品的图片。

## 购买与反馈流程状态

|步骤|状态|限制|
|---|---|---|
|核心功能及免费检查输入|已完成 / 已测试|桌面Chromium验证，其他浏览器待覆盖|
|$19定位及价格展示草稿|已完成|本人尚未批准售价/售卖条款|
|真实支付方国家/手续费/结算研究|已完成|官方可行路径不等于本人账户获批|
|开户、身份、支持邮箱、最终政策|待授权|身份证/密钥不进入聊天或仓库|
|支付成功/失败、下载、邮件|未验证|需平台Test mode；测试卡也不是收入|
|真实第一笔付款与支付宝到账|未验证|当前为0，不能拿自购/零元审批单代替|
|真实访问/使用/反馈统计接入|待授权 / 未验证|现构建无遥测；统计定义在MEASUREMENT.md|

联系反馈入口只在真实客服邮箱配置后出现。此轮没有联系任何真人或群发推广。

## 首轮转化优化次序

1. 先确认目录审核、真实曝光、CSV成功率；无曝光不改价格来猜需求。
2. 用户误解功能时只改说明：离线CSV、多档位、覆盖价、图片PDF、无需店铺连接。需要自动Woo客户分组的用户与本产品不匹配。
3. 有价格兴趣却没有付款，查看身份/地区付款可用性、最终金额、文件交付和支持资料，再考虑一次定价试验。
4. 有足够有效使用仍无具体购买兴趣，则停止；不因源码完成而强行推销。

不发布到不允许自荐的Reddit求助帖，不购买评分或下载量。WordPress现成分发仍是待检验机制，不保证自然排名。
