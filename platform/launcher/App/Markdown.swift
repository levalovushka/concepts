import SwiftUI

// Блочный рендерер Markdown. Системный AttributedString умеет только инлайн —
// заголовки, списки, код, цитаты и таблицы он показывает сырыми символами.

enum MDBlock: Identifiable {
    case heading(level: Int, text: String)
    case paragraph(String)
    case bullet([String])
    case ordered([String])
    case code(lang: String, body: String)
    case quote(String)
    case table(header: [String], rows: [[String]])
    case rule

    var id: String {
        switch self {
        case .heading(let l, let t): return "h\(l)-\(t.hashValue)"
        case .paragraph(let t): return "p-\(t.hashValue)"
        case .bullet(let i): return "ul-\(i.joined().hashValue)"
        case .ordered(let i): return "ol-\(i.joined().hashValue)"
        case .code(_, let b): return "code-\(b.hashValue)"
        case .quote(let t): return "q-\(t.hashValue)"
        case .table(let h, let r): return "t-\(h.joined().hashValue)-\(r.count)"
        case .rule: return "hr-\(UUID().uuidString)"
        }
    }
}

enum MarkdownParser {
    static func parse(_ source: String) -> [MDBlock] {
        var blocks: [MDBlock] = []
        let lines = source.components(separatedBy: .newlines)
        var i = 0

        func flushParagraph(_ buf: inout [String]) {
            let text = buf.joined(separator: " ").trimmingCharacters(in: .whitespaces)
            if !text.isEmpty { blocks.append(.paragraph(text)) }
            buf.removeAll()
        }

        var para: [String] = []
        while i < lines.count {
            let raw = lines[i]
            let line = raw.trimmingCharacters(in: .whitespaces)

            // код
            if line.hasPrefix("```") {
                flushParagraph(&para)
                let lang = String(line.dropFirst(3)).trimmingCharacters(in: .whitespaces)
                var body: [String] = []
                i += 1
                while i < lines.count, !lines[i].trimmingCharacters(in: .whitespaces).hasPrefix("```") {
                    body.append(lines[i]); i += 1
                }
                blocks.append(.code(lang: lang, body: body.joined(separator: "\n")))
                i += 1
                continue
            }
            // заголовок
            if line.hasPrefix("#") {
                flushParagraph(&para)
                let level = line.prefix(while: { $0 == "#" }).count
                let text = line.dropFirst(level).trimmingCharacters(in: .whitespaces)
                blocks.append(.heading(level: min(level, 4), text: text))
                i += 1; continue
            }
            // горизонтальная линия
            if line == "---" || line == "***" || line == "___" {
                flushParagraph(&para); blocks.append(.rule); i += 1; continue
            }
            // таблица
            if line.hasPrefix("|"), i + 1 < lines.count,
               lines[i + 1].trimmingCharacters(in: .whitespaces).hasPrefix("|-")
                || lines[i + 1].contains("---") && lines[i + 1].hasPrefix("|") {
                flushParagraph(&para)
                func cells(_ s: String) -> [String] {
                    s.split(separator: "|", omittingEmptySubsequences: false)
                        .map { $0.trimmingCharacters(in: .whitespaces) }
                        .filter { !$0.isEmpty }
                }
                let header = cells(line)
                var rows: [[String]] = []
                i += 2
                while i < lines.count, lines[i].trimmingCharacters(in: .whitespaces).hasPrefix("|") {
                    rows.append(cells(lines[i].trimmingCharacters(in: .whitespaces))); i += 1
                }
                blocks.append(.table(header: header, rows: rows))
                continue
            }
            // цитата
            if line.hasPrefix("> ") {
                flushParagraph(&para)
                var body: [String] = []
                while i < lines.count, lines[i].trimmingCharacters(in: .whitespaces).hasPrefix(">") {
                    body.append(lines[i].trimmingCharacters(in: .whitespaces)
                        .dropFirst().trimmingCharacters(in: .whitespaces))
                    i += 1
                }
                blocks.append(.quote(body.joined(separator: " ")))
                continue
            }
            // маркированный список
            if line.hasPrefix("- ") || line.hasPrefix("* ") {
                flushParagraph(&para)
                var items: [String] = []
                while i < lines.count {
                    let l = lines[i].trimmingCharacters(in: .whitespaces)
                    guard l.hasPrefix("- ") || l.hasPrefix("* ") else { break }
                    items.append(String(l.dropFirst(2))); i += 1
                }
                blocks.append(.bullet(items)); continue
            }
            // нумерованный список
            if let m = line.range(of: #"^\d+\.\s"#, options: .regularExpression) {
                flushParagraph(&para)
                var items: [String] = []
                var first = line
                items.append(String(first[m.upperBound...])); i += 1
                while i < lines.count {
                    let l = lines[i].trimmingCharacters(in: .whitespaces)
                    guard let r = l.range(of: #"^\d+\.\s"#, options: .regularExpression) else { break }
                    items.append(String(l[r.upperBound...])); i += 1
                }
                _ = first
                blocks.append(.ordered(items)); continue
            }
            // пустая строка
            if line.isEmpty { flushParagraph(&para); i += 1; continue }

            para.append(line); i += 1
        }
        flushParagraph(&para)
        return blocks
    }
}

// MARK: - Отрисовка

struct MarkdownView: View {
    let source: String
    private var blocks: [MDBlock] { MarkdownParser.parse(source) }

    var body: some View {
        VStack(alignment: .leading, spacing: 13) {
            ForEach(blocks) { block in
                switch block {
                case .heading(let level, let text):
                    Text(inline(text))
                        .font(.system(size: [0, 22, 18, 15, 14][level], weight: level <= 2 ? .semibold : .medium))
                        .padding(.top, level <= 2 ? 8 : 2)

                case .paragraph(let text):
                    Text(inline(text))
                        .font(.system(size: 13))
                        .lineSpacing(3.5)
                        .fixedSize(horizontal: false, vertical: true)

                case .bullet(let items):
                    VStack(alignment: .leading, spacing: 5) {
                        ForEach(items, id: \.self) { item in
                            HStack(alignment: .firstTextBaseline, spacing: 8) {
                                Circle().fill(.tertiary).frame(width: 4, height: 4).offset(y: -3)
                                Text(inline(item)).font(.system(size: 13)).lineSpacing(3)
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                        }
                    }

                case .ordered(let items):
                    VStack(alignment: .leading, spacing: 5) {
                        ForEach(Array(items.enumerated()), id: \.offset) { n, item in
                            HStack(alignment: .firstTextBaseline, spacing: 8) {
                                Text("\(n + 1).").font(.system(size: 13, weight: .medium))
                                    .foregroundStyle(.secondary).frame(width: 18, alignment: .trailing)
                                Text(inline(item)).font(.system(size: 13)).lineSpacing(3)
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                        }
                    }

                case .code(let lang, let body):
                    VStack(alignment: .leading, spacing: 0) {
                        if !lang.isEmpty {
                            Text(lang).font(.system(size: 10, weight: .medium))
                                .foregroundStyle(.tertiary)
                                .padding(.horizontal, 10).padding(.top, 7)
                        }
                        Text(body)
                            .font(.system(size: 12, design: .monospaced))
                            .textSelection(.enabled)
                            .padding(10)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .background(.quaternary.opacity(0.45), in: RoundedRectangle(cornerRadius: 8))

                case .quote(let text):
                    HStack(alignment: .top, spacing: 10) {
                        Capsule().fill(.tint).frame(width: 3)
                        Text(inline(text)).font(.system(size: 13)).italic()
                            .foregroundStyle(.secondary).lineSpacing(3)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .fixedSize(horizontal: false, vertical: true)

                case .table(let header, let rows):
                    MDTable(header: header, rows: rows)

                case .rule:
                    Divider().padding(.vertical, 2)
                }
            }
        }
    }

    private func inline(_ s: String) -> AttributedString {
        (try? AttributedString(markdown: s,
            options: .init(interpretedSyntax: .inlineOnlyPreservingWhitespace)))
            ?? AttributedString(s)
    }
}

private struct MDTable: View {
    let header: [String]
    let rows: [[String]]
    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 0) {
                ForEach(Array(header.enumerated()), id: \.offset) { _, h in
                    Text(h).font(.system(size: 12, weight: .semibold))
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(.horizontal, 10).padding(.vertical, 7)
                }
            }
            .background(.quaternary.opacity(0.5))
            ForEach(Array(rows.enumerated()), id: \.offset) { idx, row in
                Divider()
                HStack(spacing: 0) {
                    ForEach(Array(row.enumerated()), id: \.offset) { _, cell in
                        Text((try? AttributedString(markdown: cell)) ?? AttributedString(cell))
                            .font(.system(size: 12))
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.horizontal, 10).padding(.vertical, 7)
                    }
                }
                .background(idx % 2 == 1 ? AnyShapeStyle(.quaternary.opacity(0.18)) : AnyShapeStyle(.clear))
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 8))
        .overlay(RoundedRectangle(cornerRadius: 8).stroke(.quaternary))
    }
}
