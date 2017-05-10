var Lexer = require('lex');
var indent = [0];

module.exports = (new Lexer)
  // Indentation
  .addRule(/\n\s+/g, function(lexeme) {
    var indentation = lexeme.replace(/\n/g, '').length;

    if (indentation > indent[0]) {
      indent.unshift(indentation);
      return 'INDENT';
    }

    var tokens = [];

    while (indentation < indent[0]) {
      tokens.push('DEDENT');
      indent.shift();
    }

    if (tokens.length) {
      return tokens;
    }
  })

  // Spaces
  .addRule(/\s+/, () => {})

  // Keywords
  .addRule(/fun/, () => "FUN")
  .addRule(/cls/, () => "CLASS")
  .addRule(/or/, () => "OR")
  .addRule(/and/, () => "AND")
  .addRule(/is/, () => "IS")
  .addRule(/not/, () => "NOT")
  .addRule(/import/, () => "IMPORT")
  .addRule(/export/, () => "EXPORT")
  .addRule(/default/, () => "DEFAULT")
  .addRule(/new/, () => "NEW")

  // Symbols
  .addRule(/:/, () => "COLON")
  .addRule(/,/, () => "COMMA")
  .addRule(/\=/, () => "=")
  .addRule(/\+/, () => "+")
  .addRule(/\-/, () => "-")
  .addRule(/\*/, () => "*")
  .addRule(/\//, () => "/")
  .addRule(/\^/, () => "^")
  .addRule(/\|>/, () => "|>")
  .addRule(/<\|/, () => "<|")
  .addRule(/\(/, () => "LPARENS")
  .addRule(/\)/, () => "RPARENS")
  .addRule(/\{/, () => "LBRACE")
  .addRule(/\}/, () => "RBRACE")
  .addRule(/\[/, () => "LBRACKET")
  .addRule(/\]/, () => "RBRACKET")
  .addRule(/#.*?\n/, () => {})

  // Atoms
  .addRule(/(true|false)/, function(lexeme) {
    this.yytext = lexeme === 'true' ? true : false;
    return 'BOOL';
  })
  .addRule(/[a-zA-Z][a-zA-Z0-9]*/, function(lexeme) {
    this.yytext = lexeme;
    return "ID";
  })
  .addRule(/[a-zA-Z][a-zA-Z0-9]*\./, function(lexeme) {
    this.yytext = lexeme;
    return "MEMBER";
  })
  .addRule(/[a-zA-Z][a-zA-Z0-9]*\?\./, function(lexeme) {
    this.yytext = lexeme;
    return "NULL_MEMBER";
  })
  .addRule(/[0-9]+(?:\.[0-9]+)?\b/, function (lexeme) {
    this.yytext = lexeme;
    return "NUMBER";
  })
  .addRule(/\"[\w\s]+\"/, function(lexeme) {
    this.yytext = lexeme.substr(1, lexeme.length - 2);
    return 'STRING';
  })

  .addRule(/$/, function () {
    var tokens = [];

    while (0 < indent[0]) {
      tokens.unshift("DEDENT");
      indent.shift();
    }

    tokens.push("EOF");

    return tokens;
  });
