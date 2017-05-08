module.exports = {};

function _node(type, obj) {
  return Object.assign({
    type: type,
    "loc": null,
  }, obj);
}

function _file(program) {
  return _node("File", {
    program: program,
  });
}

function _program(body) {
  return _node("Program", {
    sourceType: "module",
    body: body,
  });
}

function _id(name) {
  return _node("Identifier", {
    name: name,
  });
}

function _expr(expr) {
  return _node("ExpressionStatement", {
    expression: expr,
  });
}

function _func(id, params, body) {
  return _node("FunctionExpression", {
    id: id,
    params: params,
    body: body,
    generator: false,
    async: false,
  });
}

function _block(statements) {
  return _node("BlockStatement", {
    body: statements,
  });
}

function _return(expr) {
  return _node("ReturnStatement", {
    argument: expr,
  });
}

function _string(str) {
  return _node("StringLiteral", {
    value: str,
  });
}

function _bool(bool) {
  return _node("BooleanLiteral", {
    value: bool,
  });
}

function _number(number) {
  return _node("NumericLiteral", {
    value: number,
  });
}

function _app(callee, args) {
  return _node("CallExpression", {
    callee: callee,
    arguments: args,
  });
}

function _assign(name, expr) {
  return _node("AssignmentExpression", {
    operator: "=",
    left: name,
    right: expr,
  });
}

function _binary(op, left, right) {
  return _node("BinaryExpression", {
    left: left,
    right: right,
    operator: op,
  });
}

function _object(props) {
  return _node("ObjectExpression", {
    properties: props,
  });
}

function _objectProp(key, value) {
  return _node("ObjectProperty", {
    key: key,
    value: value,
  });
}

function _array(elements) {
  return _node("ArrayExpression", {
    elements: elements,
  });
}

function _var(id, val) {
  return _node("VariableDeclaration", {
    kind: "var",
    declarations: [
      _node("VariableDeclarator", {
        id: id,
        init: val,
      })
    ]
  });
}

function _class(id, _extends, body) {
  return _node("ClassDeclaration", {
    id: id,
    superClass: _extends,
    decorators: [],
    body: _node("ClassBody", {
      body: body
    }),
  });
}

function _classMethod(id, parameters, body) {
  return _node("ClassMethod", {
    kind: "method",
    static: false,
    computed: false,
    key: id,
    body: body,
    params: parameters,
    decorators: [],
  });
}

module.exports = function transform(node) {
  switch (node.type) {
    case "Identifier":
      return _id(node.name);

    case "Module":
      return _file(_program(
        node.body.map(transform)
      ));

    case "Function":
      var stmts = node.body.map(transform);
      var returns = stmts.pop();

      stmts.push(_return(returns));

      return _func(
        transform(node.id),
        node.parameters.map(transform),
        _block(stmts)
      );

    case "Class":
      return _class(
        transform(node.id),
        null,
        node.body.map(transform)
      );

    case "ClassMethod":
      var stmts = node.body.map(transform);
      var returns = stmts.pop();

      stmts.push(_return(returns));

      return _classMethod(
        transform(node.id),
        node.parameters.map(transform),
        _block(stmts)
      );

    case "Application":
      return _app(
        transform(node.callable),
        node.arguments.map(transform)
      );

    case "Assignment":
      return _var(transform(node.id), transform(node.expression));

    case "BinaryExpression":
      return _binary(
        node.operator,
        transform(node.left),
        transform(node.right)
      );

    case "ObjectExpression":
      return _object(node.properties.map(transform));

    case "ObjectProperty":
      return _objectProp(transform(node.key), transform(node.value));

    case "ArrayExpression":
      return _array(node.elements.map(transform));

    case "LiteralBool":
      return _bool(node.value);

    case "LiteralNumber":
      return _number(node.value);

    case "LiteralString":
      return _string(node.value);

    default:
      console.log(node);
      return _string("NOT IMPLEMENTED: " + node.type);
  }
}
