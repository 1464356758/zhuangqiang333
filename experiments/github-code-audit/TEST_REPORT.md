# 本轮真实测试结果

执行日期：2026-10-09；环境 Python 3.11；状态 **已测试**。

## 实际命令与结果

```sh
python experiments/github-code-audit/test_upstream.py
```

真实输出：

```text
test_chinese_text_pdf_with_explicit_template ... ok
test_missing_required_amount_is_reported ... ok
test_text_pdf_and_thousands_separator ... ok
test_unknown_vendor_is_reported ... ok

Ran 4 tests in 0.027s
OK
```

进程 exit code 0。输入是 reportlab 实际生成的 PDF，不是预先返回的模拟 JSON。提取调用未修改的上游 API；分别验证编号、日期、金额、币种和两种失败行为。测试不调用外部收费 API，AI fallback=False；Python socket.connect 连接在测试期间被拒绝，不模拟提取结果。

另外执行 Git blob SHA-1 与实际 UTF-8 文件核对，62/62 匹配，总计 288693 字节。SHA-256 与原始来源在 UPSTREAM_MANIFEST.json。

依赖实际使用：python-dateutil 2.9.0.post0、PyYAML 6.0.3、pypdfium2 5.13.0、reportlab 4.4.9。当前环境没有 click、regex、pytest。所以上游 CLI、第三方 regex 引擎、完整上游测试套件和干净环境安装均 **未验证**。

## 安全与许可检查

- 已完成：保留 MIT LICENSE.md 与上游源码，固定版本和内容完整性核对。
- 已完成：读取 SafeLoader 使用及可选网络/子进程路径；关闭本次 AI 路径，真实文档没有上传。
- 已测试：固定两种文本 PDF，缺少金额及未知格式均抛出预期异常。
- 未验证：所有依赖的完整许可证清单、第三方 PDFium notices、恶意 PDF 沙箱/资源上限、漏洞数据库扫描、真实客户端权限和服务器部署。
- 未验证：扫描件 OCR、任意账单版式、大批量性能、生产数据准确率、发票真伪和财税合规。

这是源码技术实验，非发布可销售产品。测试样本没有真实交易；收入、订单和到账不能从测试推算。
