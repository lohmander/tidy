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

module.exports = function transform(node) {
  switch (node.type) {
    case "Module":
      return _file(_program(
        node.body.map(transform)
      ));

    case "Function":
      return _func(
        transform(node.id),
        node.parameters.map(transform),
        node.body.map(transform)
      );

    case "LiteralBool":
      return _string("bool");

    case "LiteralNumber":
      return _string(String(node.value));

    case "Application":
      return _string("application");
  }
}
