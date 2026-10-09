# 公开 GitHub 源码运行验证

查证与执行日期：2026-10-09。状态：**已完成 / 已测试**。这是一项源码复用实验；商业选择、付费客户、手机运行与收款均为**未验证**。

已实际下载 `invoice-x/invoice2data` 的 62 个原始文本文件，固定版本 `09378126e3ae86ddef5435ba166b4fc026e386a4`。保留原作者 MIT 许可证与版权声明。所有文件的 Git blob SHA-1 均与上游树匹配；每个文件的 SHA-256、大小、范围记录在 `UPSTREAM_MANIFEST.json`。没有修改上游源码。

这是源码子集，**不是完整 clone**：包含 Python 源码、LICENSE、README、项目配置及一个上游测试文件；不包含供应商 YAML 模板库、二进制 PDF 样本及其他未列入清单的文件。我们新增的集成测试在上级目录 `test_upstream.py`，与原源码分开。

## 已运行的功能

使用原项目的 `extract_data` API、明确指定 `pdfium` 后端、自定义固定格式模板，实际读取测试生成的 PDF 文件。没有模拟解析输出，没有开启 AI fallback，没有调用付费 API。

四项本地集成测试已通过：英文账单、中文账单、带千位分隔符的金额；缺少必填金额和未知供应商均返回预期的明确异常。英文正向测试还检查日期、币种和编号。

所有输入 PDF 均显著标注 `SYNTHETIC TEST ONLY`，仅在临时目录生成并删除。它们不是买家资料、真实发票、订单或商业验证。

## 复现

在本项目根目录执行：

```sh
python experiments/github-code-audit/test_upstream.py
```

当前环境为 Python 3.11。已使用的 Python 依赖版本在 `requirements-test.txt`。如在新的电脑或服务器上复现，可先建立独立虚拟环境：

```sh
python -m venv .venv-invoice-audit
.venv-invoice-audit/bin/python -m pip install -r experiments/github-code-audit/requirements-test.txt
.venv-invoice-audit/bin/python experiments/github-code-audit/test_upstream.py
```

第二组命令是安装说明，**未在干净环境验证**。当前环境没有 click、regex 和 pytest，因此没有运行上游 CLI，也没有运行完整上游测试套件。API 本地测试使用标准库 regex 路径和 unittest；测试通过不代表全部可选后端都可用。

## 范围与必要限制

- 当前只证明两种明确模板的文本 PDF 提取成功；扫描件、任意票据版式、行项目表格、金额审计、税务真伪核验都未测试。
- 手机浏览器访问、后台部署、支付、真实买家和无人值守盈利未验证；不要据此购买电脑或服务器。
- 基础 MIT 许可允许在保留声明等条件下复用，但依赖及可选模型/云服务有自己的条款。PDFium 的第三方依赖许可仍需在真实发布前逐项核查。
- 测试中禁止 Python socket 连接；这不是操作系统级网络或 PDF 解析沙箱。生产应用仍需文件大小、页数、处理时限及进程隔离。
- 上游 debug 日志可能包含文档原文；生产处理真实文件时应关闭该日志并设置留存与删除政策。
- 必须维护格式模板。若客户频繁提交新格式，需要大量人工适配，则不符合本项目的低维护条件，应停止商业化尝试。

故障恢复：先运行四项测试。若失败，核验 Python 依赖版本及 `UPSTREAM_MANIFEST.json`，不要静默吞掉金额缺失错误。商业状态与下一关口见根目录 `PROJECT_STATUS.md`。

当前新增现金支出、真实订单、收款、到账均为 0；没有产品发布、外部联系或账号操作。

原项目：[GitHub](https://github.com/invoice-x/invoice2data)；许可证：[固定版本 LICENSE.md](https://github.com/invoice-x/invoice2data/blob/09378126e3ae86ddef5435ba166b4fc026e386a4/LICENSE.md)。
