var Parser = require("jison").Parser;
var lexer = require('./lexer');

var grammar =
  { operators:
    [ [ "left", "|>", "<|"]
    , [ "left", "+", "-" ]
    , [ "left", "*", "/" ]
    , [ "left", "^" ]
    ]

  , bnf:
    { program:
      [ [ "stmts EOF", "return { type: 'Module', body: $1 };" ]
      ]

    , block:
      [ [ "INDENT stmts DEDENT", "$$ = $2" ] ]

    , stmts:
      [ [ "stmt", "$$ = [$1]"]
      , [ "stmts stmt", "$stmts.push($stmt); $$ = $stmts" ]
      ]

    , stmt:
      // FUNCTION DEF
      [ [ "FUN id LPARENS patterns RPARENS COLON block"
        , "$$ = { type: 'Function', id: $2, parameters: $4 || [], body: $7 };"
        ]

      // CLASS DEF
      , [ "CLASS id LPARENS RPARENS COLON INDENT clsBody DEDENT"
        , "$$ = { type: 'Class', id: $2, extends: null, body: $7} "
        ]

      // ASSIGNMENTS
      , [ "id = expr", "$$ = { type: 'Assignment', id: $1, expression: $3 }" ]
      , [ "id = INDENT expr DEDENT", "$$ = { type: 'Assignment', id: $1, expression: $4 }" ]
      , [ "expr", "$$ = $1" ]
      ]

    , clsBody:
      [ [ "", "$$ = []" ]
      , [ "clsMethod clsBody", "$clsBody.unshift($clsMethod); $$ = $clsBody" ]
      ]
    , clsMethod:
      [ [ "id LPARENS patterns RPARENS COLON block"
        , "$$ = { type: 'ClassMethod', id: $1, parameters: $3 || [], body: $6 }"
        ]
      ]

    , expr:
      // PIPING
      [ [ "expr |> id LPARENS args RPARENS", "$$ = { type: 'Application', callable: $3, arguments: ($5 || []).concat([$1])  }"]
      , [ "id LPARENS args RPARENS <| expr", "$$ = { type: 'Application', callable: $1, arguments: ($3 || []).concat([$6])  }"]

      // OPERATORS
      , [ "expr + expr", "$$ = { type: 'BinaryExpression', operator: '+', left: $1, right: $3 }" ]
      , [ "expr - expr", "$$ = { type: 'BinaryExpression', operator: '-', left: $1, right: $3 }" ]
      , [ "expr * expr", "$$ = { type: 'BinaryExpression', operator: '*', left: $1, right: $3 }" ]
      , [ "expr / expr", "$$ = { type: 'BinaryExpression', operator: '/', left: $1, right: $3 }" ]
      , [ "expr ^ expr", "$$ = { type: 'Application', callable: { type: 'Identifier', name: 'Math.pow' }, arguments: [$1, $3] }" ]

      // APPLICATION
      , [ "id LPARENS args RPARENS"
        , "$$ = { type: 'Application', callable: $1, arguments: $3 || [] }"
        ]

      // OBJECTS
      , [ "LBRACE objProps RBRACE", "$$ = { type: 'ObjectExpression', properties: $2 || [] }" ]

      // ARRAYS
      , [ "LBRACKET args RBRACKET", "$$ = { type: 'ArrayExpression', elements: $2 }" ]

      // ATOMS
      , [ "atom", "$$ = $1" ]
      ]

    , args:
      [ [ "", "" ]
      , [ "expr", "$$ = [$1]" ]
      , [ "expr COMMA args", "$args.unshift($expr); $$ = $args" ] 
      ]

    , patterns:
      [ [ "", "" ]
      , [ "id", "$$ = [$1]" ]
      , [ "id COMMA patterns"
        , "$patterns.unshift($id); $$ = $patterns"
        ]
      ]

    , pattern:
      [ [ "id", "$$ = { type: 'Assignment', id: $1 }" ] ]

    , objProps:
      [ [ "", "" ]
      , [ "objProp", "$$ = [$1]" ]
      , [ "objProp COMMA objProps", "$objProps.unshift($objProp); $$ = $objProps" ]
      ]

    , objProp:
      [ [ "id COLON expr", "$$ = { type: 'ObjectProperty', key: $1, value: $3 }" ]
      ]

    , id:
      [ [ "ID", "$$ = { type: 'Identifier', name: yytext };" ]
      ]

    , atom:
      [ [ "NUMBER", "$$ = { type: 'LiteralNumber', value: Number(yytext) };" ]
      , [ "STRING", "$$ = { type: 'LiteralString', value: yytext };" ]
      , [ "BOOL", "$$ = { type: 'LiteralBool', value: yytext };" ]
      , [ "MEMBER", "$$ = { type: 'MemberExpression', accessors: yytext }" ]
      , [ "id", "$$ = $1" ]
      ]
    }
  };

var parser = new Parser(grammar);
parser.lexer = lexer;

var fs = require('fs');
var src = fs.readFileSync(process.argv[2], 'utf-8');

var babel = require('babel-core');

var result = babel.transform(`
x.top.c
`);



delete result.ast.tokens;

// console.log(JSON.stringify(newast, 2, 2))
// console.log('---')
console.log(JSON.stringify(result.ast, 2, 2));

// var ast = {
// };
// console.log(JSON.stringify(newast, 2, 2));
//
var transform = require('./transform');
var newast = transform(parser.parse(src));

var result = babel.transformFromAst(newast, "")
// console.log('\n---\n')
console.log(result.code);

//console.log(JSON.stringify(
//  parser.parse(src),
//  2,
//  2
//));
