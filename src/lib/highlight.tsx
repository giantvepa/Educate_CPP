import type { ReactNode } from "react";
import type { Lang } from "../data/types";

type Rule = [source: string, cls: string];

const cppRules: Rule[] = [
  ["\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/", "text-code-com italic"],
  ["#\\s*[a-zA-Z_]+", "text-code-pre"],
  [`"(?:\\\\.|[^"\\\\\\n])*"|'(?:\\\\.|[^'\\\\\\n])*'`, "text-code-str"],
  [
    "\\b(?:alignas|alignof|auto|break|case|catch|class|const|consteval|constexpr|constinit|const_cast|continue|co_await|co_return|co_yield|decltype|default|delete|do|dynamic_cast|else|enum|explicit|export|extern|final|for|friend|goto|if|inline|mutable|namespace|new|noexcept|operator|override|private|protected|public|register|reinterpret_cast|requires|return|sizeof|static|static_assert|static_cast|struct|switch|template|this|thread_local|throw|try|typedef|typeid|typename|union|using|virtual|void|volatile|while|Q_OBJECT|signals|slots|emit)\\b",
    "text-code-kw",
  ],
  [
    "\\b(?:bool|char|char8_t|char16_t|char32_t|double|float|int|long|short|signed|size_t|ssize_t|unsigned|uint8_t|uint16_t|uint32_t|uint64_t|wchar_t|std|QString|QStringList|QVariant|QVector|QList|QObject|QWidget|QMainWindow|QApplication|QPushButton|QLabel|QLineEdit|QComboBox|QSpinBox|QDateEdit|QTableWidget|QTableView|QTreeView|QTabWidget|QSplitter|QStandardItem|QStandardItemModel|QAbstractTableModel|QAbstractItemView|QModelIndex|QItemSelectionModel|QSqlDatabase|QSqlQuery|QSqlError|QSqlTableModel|QSqlRelationalTableModel|QSqlRelationalDelegate|QSqlRelation|QSortFilterProxyModel|QNetworkAccessManager|QNetworkRequest|QNetworkReply|QJsonDocument|QJsonObject|QJsonArray|QFileDialog|QMessageBox|QShortcut|QKeySequence|QTimer|QDate|QTime|QDateTime|QSettings|QFile|QTextStream|QDebug|QRegularExpression|QRegularExpressionValidator|QFormLayout|QVBoxLayout|QHBoxLayout|QGridLayout|QAction|QPainter|QPdfWriter|QUrl|QByteArray|httplib|json)\\b",
    "text-code-type",
  ],
  ["\\b\\d[\\d']*(?:\\.\\d+)?[fFuUlL]*\\b", "text-code-num"],
  ["\\b[A-Za-z_][A-Za-z0-9_]*(?=\\s*\\()", "text-code-fn"],
];

const sqlRules: Rule[] = [
  ["--[^\\n]*", "text-code-com italic"],
  [`'(?:[^'\\n]|'')*'`, "text-code-str"],
  [
    "\\b(?i:select|from|where|insert|into|values|update|set|delete|create|table|primary|key|references|foreign|unique|not|null|default|check|in|between|and|or|join|left|right|inner|outer|on|group|by|order|having|as|distinct|limit|offset|union|all|case|when|then|else|end|begin|commit|rollback|transaction|if|exists|drop|constraint|index|integer|text|real|blob|autoincrement|conflict|do|like)\\b",
    "text-code-kw",
  ],
  ["\\b(?:date|datetime|now|avg|sum|count|round|min|max|coalesce|substr|length|lower|upper|trim)\\s*(?=\\()", "text-code-fn"],
  ["\\b\\d+(?:\\.\\d+)?\\b", "text-code-num"],
];

const cmakeRules: Rule[] = [
  ["#[^\\n]*", "text-code-com italic"],
  [`"(?:\\\\.|[^"\\\\\\n])*"`, "text-code-str"],
  ["\\$\\{[^}]*\\}", "text-code-pre"],
  [
    "\\b(?i:cmake_minimum_required|project|set|find_package|add_executable|add_library|target_link_libraries|target_include_directories|add_subdirectory|option|message|install|include|foreach|endforeach|if|endif|else|elseif|return)\\b",
    "text-code-fn",
  ],
  ["\\b(?i:VERSION|REQUIRED|COMPONENTS|PRIVATE|PUBLIC|INTERFACE|STATIC|SHARED|ON|OFF|LANGUAGES|CXX)\\b", "text-code-kw"],
];

const bashRules: Rule[] = [
  ["#[^\\n]*", "text-code-com italic"],
  [`"(?:\\\\.|[^"\\\\\\n])*"|'[^'\\n]*'`, "text-code-str"],
  [
    "^(?:cmake|make|ninja|curl|git|sqlite3|vcpkg|cd|mkdir|ls|echo|export)(?=\\s)",
    "text-code-kw",
  ],
  ["(?<=^|\\s)--?[A-Za-z][\\w-]*", "text-code-pre"],
  ["\\bhttps?://[^\\s\"']+", "text-code-str"],
];

const jsonRules: Rule[] = [
  [`"(?:\\\\.|[^"\\\\])*"(?=\\s*:)`, "text-code-fn"],
  [`"(?:\\\\.|[^"\\\\])*"`, "text-code-str"],
  ["\\b(?:true|false|null)\\b", "text-code-kw"],
  ["-?\\b\\d+(?:\\.\\d+)?(?:[eE][+-]?\\d+)?\\b", "text-code-num"],
];

const htmlRules: Rule[] = [
  ["<!--[\\s\\S]*?-->", "text-code-com italic"],
  ["</?[A-Za-z][\\w-]*|/?>|<!DOCTYPE[^>]*>", "text-code-kw"],
  ["\\b[A-Za-z-]+(?==)", "text-code-pre"],
  [`"[^"]*"|'[^']*'`, "text-code-str"],
  ["\\$\\{[^}]*\\}", "text-code-num"],
];

const rulesByLang: Record<Lang, Rule[]> = {
  cpp: cppRules,
  sql: sqlRules,
  cmake: cmakeRules,
  bash: bashRules,
  json: jsonRules,
  html: htmlRules,
};

export function highlight(code: string, lang: Lang): ReactNode[] {
  const rules = rulesByLang[lang] ?? [];
  if (rules.length === 0) return [code];

  const source = rules.map((r) => `(${r[0]})`).join("|");
  const re = new RegExp(source, "gm");

  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(code)) !== null) {
    if (m[0].length === 0) {
      re.lastIndex++;
      continue;
    }
    if (m.index > last) out.push(code.slice(last, m.index));
    let cls = "text-code-plain";
    for (let g = 0; g < rules.length; g++) {
      if (m[g + 1] !== undefined) {
        cls = rules[g][1];
        break;
      }
    }
    out.push(
      <span key={key++} className={cls}>
        {m[0]}
      </span>
    );
    last = m.index + m[0].length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}
