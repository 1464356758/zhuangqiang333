/* Original shared code. Dual-licensed: GPL-2.0-or-later for the free
 * WordPress edition; separately licensed as part of the owner's standalone
 * edition. See LICENSES.md. No third-party runtime dependencies. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.TierSheetCommon = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  class InputError extends Error {
    constructor(code, message, row) {
      super(message); this.name = 'InputError'; this.code = code; this.row = row || null;
    }
  }
  function detectDelimiter(text) {
    const counts = { ',': 0, ';': 0, '\t': 0 };
    let quoted = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (c === '"') {
        if (quoted && text[i + 1] === '"') i++;
        else quoted = !quoted;
      } else if (!quoted) {
        if (c === '\n' || c === '\r') break;
        if (Object.hasOwn(counts, c)) counts[c]++;
      }
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  }
  function parseCSV(input, options) {
    options = options || {};
    if (typeof input !== 'string') throw new InputError('CSV_TYPE', 'CSV input must be text.');
    let text = input.replace(/^\uFEFF/, '');
    if (!text.trim()) throw new InputError('CSV_EMPTY', 'The CSV is empty.');
    if (text.length > 25 * 1024 * 1024) throw new InputError('CSV_SIZE', 'Use a UTF-8 file below 25 MB.');
    if (text.includes('\0') || text.includes('\uFFFD')) throw new InputError('CSV_ENCODING', 'Invalid text encoding. Export a UTF-8 CSV.');
    const delimiter = !options.delimiter || options.delimiter === 'auto' ? detectDelimiter(text) : options.delimiter;
    if (![',', ';', '\t'].includes(delimiter)) throw new InputError('CSV_DELIMITER', 'Choose comma, semicolon or tab.');
    const maxRows = options.maxRows || 20000;
    const maxColumns = options.maxColumns || 100;
    let rows = [], fields = [], value = '', state = 'start', line = 1, startLine = 1;
    function cell() {
      fields.push(value); value = ''; state = 'start';
      if (fields.length > maxColumns) throw new InputError('CSV_COLUMNS', 'Too many columns (maximum 100).', line);
    }
    function record() {
      cell();
      if (!(fields.length === 1 && fields[0] === '')) rows.push({ fields, row: startLine });
      fields = [];
      if (rows.length > maxRows + 1) throw new InputError('CSV_ROWS', 'Too many records for this local tool (maximum ' + maxRows + ').', startLine);
    }
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (state === 'quoted') {
        if (c === '"') {
          if (text[i + 1] === '"') { value += '"'; i++; }
          else state = 'closed';
        } else if (c === '\r' || c === '\n') {
          if (c === '\r' && text[i + 1] === '\n') i++;
          value += '\n'; line++;
        } else value += c;
      } else if (c === delimiter) cell();
      else if (c === '\r' || c === '\n') {
        record();
        if (c === '\r' && text[i + 1] === '\n') i++;
        line++; startLine = line;
      } else if (state === 'closed') {
        throw new InputError('CSV_QUOTE', 'Unexpected text after a closing quote.', line);
      } else if (c === '"') {
        if (state !== 'start') throw new InputError('CSV_QUOTE', 'Quote inside an unquoted field.', line);
        state = 'quoted';
      } else { value += c; state = 'plain'; }
      if (value.length > 10000) throw new InputError('CSV_FIELD', 'A field exceeds 10,000 characters.', line);
    }
    if (state === 'quoted') throw new InputError('CSV_QUOTE', 'Unclosed quoted field.', startLine);
    if (value !== '' || fields.length || state !== 'start') record();
    if (!rows.length) throw new InputError('CSV_EMPTY', 'No header was found.');
    const header = rows.shift();
    const headers = header.fields.map(x => x.trim());
    if (headers.some(x => !x)) throw new InputError('CSV_HEADER', 'All column headers must be non-empty.', header.row);
    const normalized = headers.map(x => x.toLowerCase());
    if (new Set(normalized).size !== headers.length) throw new InputError('CSV_HEADER', 'Duplicate column headers.', header.row);
    const records = rows.map(r => {
      if (r.fields.length !== headers.length) throw new InputError('CSV_WIDTH', 'Expected ' + headers.length + ' columns, found ' + r.fields.length + '.', r.row);
      const values = Object.create(null);
      headers.forEach((h, i) => { values[h] = r.fields[i]; });
      return { values, row: r.row };
    });
    return { headers, records, delimiter };
  }
  function parseMoney(input, precision) {
    if (!Number.isInteger(precision) || precision < 0 || precision > 4) throw new InputError('PRECISION', 'Decimal places must be an integer from 0 to 4.');
    const text = String(input).trim();
    if (!/^\d{1,12}(?:\.\d{1,4})?$/.test(text)) throw new InputError('PRICE_FORMAT', 'Use a non-negative decimal price, a dot separator, no currency symbol or thousands separator.');
    const parts = text.split('.');
    const fraction = parts[1] || '';
    if (fraction.length > precision && /[1-9]/.test(fraction.slice(precision))) throw new InputError('PRICE_PRECISION', 'The price has more than ' + precision + ' decimal places.');
    return BigInt(parts[0]) * (10n ** BigInt(precision)) + BigInt((fraction.slice(0, precision).padEnd(precision, '0')) || '0');
  }
  function formatMoney(value, precision) {
    if (typeof value !== 'bigint' || value < 0n) throw new InputError('PRICE_FORMAT', 'Price must be a non-negative integer in minor units.');
    const scale = 10n ** BigInt(precision);
    return (value / scale).toString() + (precision ? '.' + (value % scale).toString().padStart(precision, '0') : '');
  }
  function findHeader(table, aliases, explicit, field) {
    if (explicit) {
      if (!table.headers.includes(explicit)) throw new InputError('MAPPING', 'Column not found: ' + explicit);
      return explicit;
    }
    const found = table.headers.filter(h => aliases.includes(h.toLowerCase()));
    if (found.length !== 1) throw new InputError('MAPPING', found.length ? 'Choose one column for ' + field + '; multiple candidates were found.' : 'Choose a column for ' + field + '.');
    return found[0];
  }
  function normalizeProducts(table, options) {
    options = options || {};
    const precision = options.precision === undefined ? 2 : options.precision;
    const mapping = options.mapping || {};
    const keys = {
      sku: findHeader(table, ['sku', 'variant sku', 'stock code', '货号'], mapping.sku, 'SKU'),
      name: findHeader(table, ['name', 'title', 'product name', '商品名称'], mapping.name, 'Name'),
      price: findHeader(table, ['price', 'regular price', 'variant price', '单价'], mapping.price, 'Price')
    };
    if (new Set(Object.values(keys)).size !== 3) throw new InputError('MAPPING', 'SKU, name and price must use different columns.');
    if (!table.records.length) throw new InputError('PRODUCTS_EMPTY', 'Add at least one product record.');
    const products = [], issues = [], exact = new Map(), relaxed = new Map();
    function issue(severity, code, row, field, message) { issues.push({severity, code, row, field, message}); }
    for (const record of table.records) {
      const originalSKU = record.values[keys.sku];
      const sku = originalSKU.trim();
      const name = record.values[keys.name].trim();
      if (!sku) { issue('error', 'SKU_EMPTY', record.row, keys.sku, 'SKU is empty.'); continue; }
      if (sku.length > 100 || /[\r\n\x00-\x1f]/.test(sku)) { issue('error', 'SKU_INVALID', record.row, keys.sku, 'Use an SKU under 101 characters without control characters.'); continue; }
      if (sku !== originalSKU) issue('warning', 'SKU_SPACE', record.row, keys.sku, 'Outer SKU whitespace was removed; check the original identifier.');
      if (!name) issue('error', 'NAME_EMPTY', record.row, keys.name, 'Product name is empty; map a complete name column.');
      if (name.length > 300) issue('error', 'NAME_LENGTH', record.row, keys.name, 'Product name exceeds 300 characters.');
      if (/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(name)) issue('error', 'NAME_CONTROL', record.row, keys.name, 'Product name contains control characters.');
      if (exact.has(sku)) issue('error', 'SKU_DUPLICATE', record.row, keys.sku, 'Duplicate SKU; first appears at row ' + exact.get(sku) + '.');
      else exact.set(sku, record.row);
      const fold = sku.toLowerCase();
      if (relaxed.has(fold) && relaxed.get(fold).sku !== sku) issue('warning', 'SKU_CASE', record.row, keys.sku, 'Another SKU differs only in letter case; verify both identifiers.');
      else relaxed.set(fold, {sku, row: record.row});
      let price;
      try { price = parseMoney(record.values[keys.price], precision); }
      catch (e) { issue('error', e.code, record.row, keys.price, e.message); continue; }
      if (price === 0n) issue('warning', 'PRICE_ZERO', record.row, keys.price, 'Zero unit price; confirm this is intended.');
      if (/^\s*[=+@-]/.test(sku) || /^\s*[=+@-]/.test(name)) issue('warning', 'CSV_FORMULA', record.row, keys.name, 'Spreadsheet-like text is escaped in CSV output.');
      products.push({sku, name, price, sourceRow:record.row});
    }
    return {products, issues, mapping: keys, precision};
  }
  function safeCell(value) {
    let text = String(value === null || value === undefined ? '' : value);
    if (/^[\s\uFEFF]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  }
  function toCSV(rows) { return '\uFEFF' + rows.map(row => row.map(safeCell).join(',')).join('\r\n') + '\r\n'; }
  function escapeHTML(value) {
    return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function normalizeCurrency(value) {
    const v = String(value || '').trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(v)) throw new InputError('CURRENCY', 'Use a three-letter currency code, such as USD, EUR or CNY.');
    return v;
  }
  function slug(name, index) {
    const simple = String(name).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,48);
    return String(index + 1).padStart(2,'0') + '-' + (simple || 'price-tier');
  }
  return {InputError,parseCSV,parseMoney,formatMoney,findHeader,normalizeProducts,safeCell,toCSV,escapeHTML,normalizeCurrency,slug};
});
