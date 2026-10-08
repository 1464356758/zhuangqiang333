# GitHub专项调查与许可边界

查证：2026-10-08。检查12个项目的公开README、根许可证和当前仓库元数据；4个项目进一步检查近期Issues/PR。未用Star数证明付费需求。下列开源安装痛点是产品切口候选，不是收入证据。

|项目/原始链接|根许可证/源文件|本轮最新push快照|商业价值切口|限制、依赖与商用判断|
|---|---|---|---|---|
|[Hopding/pdf-lib](https://github.com/Hopding/pdf-lib)|[MIT](https://github.com/Hopding/pdf-lib/blob/master/LICENSE.md)|2024-07-17|PDF编辑/生成；付费文件工具的组件，不等于独立买家|最近push2024；旧维护周期；字体/图片和fontkit等额外依赖须核实；不提供安全真删文本|
|[mholt/PapaParse](https://github.com/mholt/PapaParse)|[MIT](https://github.com/mholt/PapaParse/blob/master/LICENSE)|2026-10-08|浏览器CSV输入；解析引擎可用于商用并保留版权许可|step/preview与空表输出还有PR修复；依赖审计要按实际版本，不只看README|
|[exceljs/exceljs](https://github.com/exceljs/exceljs)|[MIT](https://github.com/exceljs/exceljs/blob/master/LICENSE)|2025-01-21|Excel工作流可包装为行业工具|2026-10近期Issue涉及crafted dataValidation导致CPU/内存DoS；本版不接XLSX，避免新增输入攻击面|
|[SheetJS/sheetjs](https://github.com/SheetJS/sheetjs)|[Apache-2.0](https://github.com/SheetJS/sheetjs/blob/github/LICENSE)|2024-04-18|成熟工作簿输入，用户不愿安装解析工具|开发已迁出GitHub；不能把npm旧xlsx等同最新安全版本；付费Pro不是CE开源许可|
|[docling-project/docling](https://github.com/docling-project/docling)|[MIT（代码）](https://github.com/docling-project/docling/blob/main/LICENSE)|2026-10-08|文档解析强、部署复杂；可做行业集成|模型独立许可；近期EasyOCR内存Issue；CPU/GPU、OCR错误和格式支持仍要成本验证|
|[ocrmypdf/OCRmyPDF](https://github.com/ocrmypdf/OCRmyPDF)|[MPL-2.0](https://github.com/ocrmypdf/OCRmyPDF/blob/main/LICENSE)|2026-10-07|扫描文档转可检索PDF；适合流程包装|MPL文件级义务；Ghostscript等依赖可能AGPL/商业双许可；未完成打包依赖审计，不能直接商用全栈|
|[imgproxy/imgproxy](https://github.com/imgproxy/imgproxy)|[Apache-2.0](https://github.com/imgproxy/imgproxy/blob/master/LICENSE)|2026-10-06|图片托管变换，支持性能价值|Pro另许可；服务器带宽与安全签名配置；不能把改名托管当差异|
|[dgtlmoon/changedetection.io](https://github.com/dgtlmoon/changedetection.io)|[Apache-2.0](https://github.com/dgtlmoon/changedetection.io/blob/master/LICENSE)|2026-10-08|监控复杂业务变化；可集成通知|官方已有低价托管；浏览器驱动、站点反爬、数据获取条款与通知维护负担|
|[OpenRefine/OpenRefine](https://github.com/OpenRefine/OpenRefine)|[BSD-3-Clause](https://github.com/OpenRefine/OpenRefine/blob/master/LICENSE.txt)|2026-10-02|数据清洗强但GUI学习、Java安装较重|扩展和依赖另查；近期极端数字导致处理问题Issue；应把行业清洗规则作为价值而非换名|
|[SubtitleEdit/subtitleedit](https://github.com/SubtitleEdit/subtitleedit)|[MIT（当前仓库）](https://github.com/SubtitleEdit/subtitleedit/blob/main/LICENSE)|2026-10-08|字幕工作流成熟|不要按旧版印象写GPL；ffmpeg、mpv、模型另许可；免费编辑器使纯格式转换收费弱|
|[sissbruecker/linkding](https://github.com/sissbruecker/linkding)|[MIT](https://github.com/sissbruecker/linkding/blob/master/LICENSE.txt)|2026-10-01|自托管书签安装复杂，可托管|没有证实新增买家和自然获客；Django等依赖、备份、账号安全需打包审计|
|[Stirling-Tools/Stirling-PDF](https://github.com/Stirling-Tools/Stirling-PDF)|[混合：指定开源部分MIT，排除目录另许可](https://github.com/Stirling-Tools/Stirling-PDF/blob/main/LICENSE)|2026-10-08|丰富PDF能力但功能/安装复杂|根LICENSE排除app/proprietary、app/saas、engine以及多处frontend editor目录；**整仓不是MIT商用授权**|

## 近期代码问题核验

- PapaParse [PR1148](https://github.com/mholt/PapaParse/pull/1148) 空数据导出保留列；[PR1150](https://github.com/mholt/PapaParse/pull/1150) step预览完成；还在更新，不能因为成熟就不测试边界。
- ExcelJS [Issue3093](https://github.com/exceljs/exceljs/issues/3093) 恶意sqref的CPU/内存问题（2026-10-05更新）；[2916](https://github.com/exceljs/exceljs/issues/2916) 流写入内存。Issue是报告，不是我独立复现的漏洞结论。
- Docling [Issue1343](https://github.com/docling-project/docling/issues/1343) EasyOCR内存问题（2026-10-08更新）。强OCR不等于≤100元/月长期服务成本。
- OpenRefine [Issue8001](https://github.com/OpenRefine/OpenRefine/issues/8001) 极端指数值；[7186](https://github.com/OpenRefine/OpenRefine/issues/7186) reconciliation协议扩展。版本/格式适配也有维护工作。
- WooCommerce [59243](https://github.com/woocommerce/woocommerce/issues/59243) 是2025历史CSV反馈，**已关闭**，不当现时漏洞。

以上所有链接查证2026-10-08。push是提交活动，不是最新稳定发布；未据此承诺全部依赖安全。SheetJS在GitHub的旧活动与代码迁站有关，不把它断言为废弃。

## 许可核验层次

根许可证允许商用仍有保留声明/NOTICE、修改文件和再分发等义务；不授权商标、字体、模型或素材。12项目只是候选：**未对未采用项目做全量传递依赖审计**，明确不签发“整套都安全可商用”的结论。OCRmyPDF与Stirling全仓不能按一个宽松许可处理。

实际TierSheet验证版采用原创CSV/十进制/ZIP/PDF代码，无第三方运行时包、无AI模型、无外部字体或素材。避免在最小版本引入不必要依赖；采用项目若变化，必须先复查对应版本及所有分发依赖。未复制竞品代码、Logo或受保护界面。免费WordPress基础版按GPL-2.0-or-later提供；独立版的原创代码可由权利人单独授权（许可见各目录），同一作者原创共用部分使用明确双许可，而不是宣称GPL衍生作品可以任意闭源。
