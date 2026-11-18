function escapeVCard(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}
export function makeVCard(rows: { name: string; phone: string }[]) {
  return rows.map((row) => [
    "BEGIN:VCARD", "VERSION:3.0",
    `FN:${escapeVCard(row.name)}`,
    `TEL;TYPE=CELL:${row.phone}`,
    "END:VCARD"
  ].join("\r\n")).join("\r\n") + (rows.length ? "\r\n" : "");
}
