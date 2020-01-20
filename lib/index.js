'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref) {
  var t = _ref.types;

  return {
    visitor: {
      TaggedTemplateExpression: _styledComponents2.default,
      FunctionDeclaration: function FunctionDeclaration(path, state) {
        if (!path.node.id || !path.node.id.name) return;

        var options = (0, _options2.default)(state);
        var componentName = path.node.id.name;

        functionBodyPushAttributes(t, path, options, componentName);
      },
      ArrowFunctionExpression: function ArrowFunctionExpression(path, state) {
        var options = (0, _options2.default)(state);
        if (!path.parent.id || !path.parent.id.name) return;
        var componentName = path.parent.id.name;

        functionBodyPushAttributes(t, path, options, componentName);
      },
      ClassDeclaration: function ClassDeclaration(path, state) {
        var name = path.get('id');
        var properties = path.get('body').get('body');

        var render = properties.find(function (prop) {
          return prop.isClassMethod() && prop.get('key').isIdentifier({ name: 'render' });
        });

        if (!render || !render.traverse) {
          return;
        }

        var options = (0, _options2.default)(state);

        render.traverse({
          ReturnStatement: function ReturnStatement(returnStatement) {
            var arg = returnStatement.get('argument');
            if (!arg.isJSXElement()) return;

            var openingElement = arg.get('openingElement');
            if (isReactFragment(openingElement)) return;

            openingElement.node.attributes.unshift(t.jSXAttribute(t.jSXIdentifier(options.attribute), t.stringLiteral(options.format(name.node && name.node.name))));
          }
        });
      }
    }
  };
};

var _options = require('./options');

var _options2 = _interopRequireDefault(_options);

var _styledComponents = require('./styled-components');

var _styledComponents2 = _interopRequireDefault(_styledComponents);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isReactFragment(openingElement) {
  return openingElement.node.name.name === 'Fragment' || openingElement.node.name.type === 'JSXMemberExpression' && openingElement.node.name.object.name === 'React' && openingElement.node.name.property.name === 'Fragment';
}

function functionBodyPushAttributes(t, path, options, componentName) {
  var openingElement = null;
  var functionBody = path.get('body').get('body');
  if (functionBody.parent && functionBody.parent.type === 'JSXElement') {
    var jsxElement = functionBody.find(function (c) {
      return c.type === 'JSXElement';
    });
    if (!jsxElement) return;
    openingElement = jsxElement.get('openingElement');
  } else {
    var returnStatement = functionBody.find(function (c) {
      return c.type === 'ReturnStatement';
    });
    if (!returnStatement) return;

    var arg = returnStatement.get('argument');
    if (!arg.isJSXElement()) return;

    openingElement = arg.get('openingElement');
  }

  if (!openingElement) return;
  if (isReactFragment(openingElement)) return;

  openingElement.node.attributes.unshift(t.jSXAttribute(t.jSXIdentifier(options.attribute), t.stringLiteral(options.format(componentName))));
}