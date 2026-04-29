/**
 * Безопасный парсер математических выражений.
 * Поддерживает: +, -, *, /, %, скобки, десятичные числа.
 * Заменяет небезопасный new Function() / eval().
 */

class MathParser {
  constructor(expression) {
    this.expression = expression.replace(/\s+/g, "");
    this.pos = 0;
  }

  parse() {
    const result = this.parseExpression();
    if (this.pos < this.expression.length) {
      throw new Error(`Неожиданный символ: "${this.expression[this.pos]}"`);
    }
    return result;
  }

  parseExpression() {
    let result = this.parseTerm();
    while (this.pos < this.expression.length) {
      const ch = this.expression[this.pos];
      if (ch === "+") {
        this.pos++;
        result += this.parseTerm();
      } else if (ch === "-") {
        this.pos++;
        result -= this.parseTerm();
      } else {
        break;
      }
    }
    return result;
  }

  parseTerm() {
    let result = this.parseFactor();
    while (this.pos < this.expression.length) {
      const ch = this.expression[this.pos];
      if (ch === "*") {
        this.pos++;
        result *= this.parseFactor();
      } else if (ch === "/") {
        this.pos++;
        const divisor = this.parseFactor();
        if (divisor === 0) throw new Error("Деление на ноль");
        result /= divisor;
      } else if (ch === "%") {
        this.pos++;
        const mod = this.parseFactor();
        if (mod === 0) throw new Error("Деление на ноль");
        result %= mod;
      } else {
        break;
      }
    }
    return result;
  }

  parseFactor() {
    // Unary minus/plus
    if (this.expression[this.pos] === "-") {
      this.pos++;
      return -this.parseFactor();
    }
    if (this.expression[this.pos] === "+") {
      this.pos++;
      return this.parseFactor();
    }

    // Parentheses
    if (this.expression[this.pos] === "(") {
      this.pos++;
      const result = this.parseExpression();
      if (this.expression[this.pos] !== ")") {
        throw new Error("Не закрыта скобка");
      }
      this.pos++;
      return result;
    }

    // Number
    return this.parseNumber();
  }

  parseNumber() {
    const start = this.pos;
    while (
      this.pos < this.expression.length &&
      (/[0-9]/.test(this.expression[this.pos]) || this.expression[this.pos] === ".")
    ) {
      this.pos++;
    }
    if (start === this.pos) {
      throw new Error(`Ожидалось число на позиции ${this.pos}`);
    }
    const numStr = this.expression.slice(start, this.pos);
    const num = parseFloat(numStr);
    if (isNaN(num)) {
      throw new Error(`Некорректное число: "${numStr}"`);
    }
    return num;
  }
}

/**
 * Безопасно вычисляет математическое выражение.
 * @param {string} expr — выражение, например "2+3*4" или "(10-2)/4"
 * @returns {number} результат вычисления
 * @throws {Error} если выражение некорректно
 */
export function safeEval(expr) {
  if (!expr || typeof expr !== "string") {
    return 0;
  }
  // Проверяем что строка содержит только допустимые символы
  if (!/^[0-9+\-*/%.() ]+$/.test(expr)) {
    throw new Error("Выражение содержит недопустимые символы");
  }
  const parser = new MathParser(expr);
  return parser.parse();
}
