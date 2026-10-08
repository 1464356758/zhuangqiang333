# TierSheet 使用教程

状态：核心软件已完成 / 已测试；收费与公开上架待授权。界面为英文，面向国际小型批发商。样例不是客户数据。

## 最快体验：无需安装开发环境

解压 `tiersheet-standalone-0.1.0.zip`，用桌面 Chrome/Edge 打开 `index.html`。
点击 **Try sample files → Build price lists → 勾选价格核对框 → Download all tiers · ZIP**。
这是三个核心阶段：添加输入、核对价格、下载。样例包含5种商品、3个档位和1条特定价格。
免费版打开项目的 `dist/free.html`；只需商品CSV，可导出一套完整价目表。

## 用自己的商品生成

1. 导出 **UTF-8 CSV**。商品列至少有 SKU、Name、Price，或在界面选择对应列。每行须有唯一SKU、完整商品名称与十进制单价。
2. 选择档位CSV；需要个别商品例外价格时，再选覆盖价CSV。设置商家抬头、币种代码和日期，然后点击 **Build price lists**，逐档位核对预览及输入提示。
3. 勾选“我已检查价格列、折扣和提示”，下载ZIP。打开文件核对后再发送。也可只下载当前档位CSV或所有档位HTML。

以下只是可替换的教学数据。点击 **CSV templates** 可下载相同格式的模板。

商品 `products.csv`：

```csv
SKU,Name,Price
MUG-01,Stoneware mug,12.50
TEA-02,Loose leaf tea,8.00
```

档位 `tiers.csv`：

```csv
Tier,DiscountPercent
Retail,0
Dealer,10
Wholesale,20
```

可选覆盖价 `overrides.csv`：

```csv
Tier,SKU,Price
Wholesale,TEA-02,6.00
```

Dealer茶叶价为7.20，Wholesale茶叶价为6.00，覆盖价优先于折扣。折扣不是加价率；10表示减价10%，不是乘10。最高支持20档位，这是内存保护范围。所有计算使用整数金额，按所选小数位四舍五入（half up），不使用浮点近似金额。

## 从 WooCommerce 导出

WordPress后台打开 **Products → All Products → Export**，取得商品CSV，然后在TierSheet选SKU、商品名称和价格列。
例如 `Regular price` 是常规价，`Sale price` 是促销价，应按自己的业务明确选用。
工具不连接店铺；变体必须在输入行中有正确的完整名称和独立SKU。空SKU、重复SKU会阻止导出，不能静默略过。
官方流程：[商品CSV导入/导出](https://woocommerce.com/document/product-csv-importer-exporter/)，查证2026-10-08。

## 输出内容

- 每个档位一份CSV和可选PDF；文件名使用序号避免重名。
- `price-source-audit.csv`：原始行、基础价、最终价、折扣或覆盖价来源。
- `price-lists.html`：全部档位，可在浏览器查看或打印。
- `manifest.json`：版本、生成时间、行数、档位、舍入规则及样例标记；不代表营销统计。

PDF为A4、约150 DPI图片页，文字不可选择/搜索，不适合无障碍文本提取。
字体来自使用者电脑；分享前检查非拉丁字符。单页24行，单文件/整个批次最多100PDF页。
长名称、极大价格、过长档位名会明确提示不适合PDF；取消 **Include PDF files** 后仍可完整导出CSV/HTML。
预览只展示60行，导出包含全部通过校验的行，免费版也如此。CSV文本如以公式字符开头，会加安全前缀；它们是共享报告，不能作为店铺批量更新文件导回。

## 数据与收费

CSV只保存在当前标签页内存，不上传、不改店铺、不追踪使用者；刷新会清空输入，下载文件仍保存在电脑。
币种是标签，不自动换汇；工具不判断税率、库存、阶梯数量价或实时客户分组。
当前销售关闭，拟定批量版$19买断、所购版本永久使用及12个月更新。真实支付和交付流程未验证，不能通过这个构建付款。
免费版永久提供它已有的所有功能，不需要许可证或账号。

## WordPress 安装与恢复

在自己的测试网站打开 **Plugins → Add New → Upload Plugin**，选择 `tiersheet-free-wordpress-0.1.0.zip`，点击安装、启用。
然后打开 **Tools → TierSheet Price List**。此操作应由站点管理员执行；不要上传到未经授权的客户网站。
已在一次性本地WordPress 7.1.3上验证，实际生产主机、MySQL及主题组合尚未全面测试。
移除插件只删除工具文件；工具不创建数据库表或写入商品。浏览器功能异常时可先打开独立的 `free.html`。

## 常见故障

|现象|处理|
|---|---|
|无效UTF-8|在表格软件另存为CSV UTF-8；不自动猜测GBK或修复乱码|
|缺列/列名不明确|手动选择SKU、名称、单价列；三个来源列不能重复|
|金额无效|不用货币符号、千位逗号、科学计数、负数；小数精度不能超过所选位数|
|重复SKU/未知覆盖商品或档位|按错误行修正原CSV，再重新选择文件和生成|
|按钮禁用|先生成成功并勾选核对框；修改任一价格设置后须重新生成|
|PDF名称放不下/页数过多|缩短名称、拆文件或取消PDF；CSV/HTML仍可用|
|手机下载文件后找不到|查看浏览器下载列表/手机Files；移动Chrome布局已验证，iOS Safari未验证，建议桌面使用|
|页面无响应或价格有疑问|刷新并重选原CSV；只从自己保存的原文件重做，不发送未经核对的输出|

开发维护、部署、退款与收款恢复见 `DEPLOY.md`。
