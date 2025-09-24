const { default: generate } = require('@babel/generator');

module.exports = function buildllBabelPlugin({ types: t }) {
  let contentCounter = 0;
  let fileContentMap = new Map();

  function generateContentId(filePath, elementType, textContent) {
    // Extract filename without extension
    const fileName = filePath.split('/').pop().replace(/\.(tsx?|jsx?)$/, '');

    // Create semantic ID based on content and position
    const sanitizedText = textContent
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 20);

    const baseId = `${fileName}.${elementType}_${sanitizedText}`;

    // Ensure uniqueness within file
    if (!fileContentMap.has(filePath)) {
      fileContentMap.set(filePath, new Set());
    }

    const fileIds = fileContentMap.get(filePath);
    let uniqueId = baseId;
    let counter = 1;

    while (fileIds.has(uniqueId)) {
      uniqueId = `${baseId}_${counter}`;
      counter++;
    }

    fileIds.add(uniqueId);
    return uniqueId;
  }

  function isTextNode(node) {
    return t.isStringLiteral(node) ||
           (t.isJSXText(node) && node.value.trim().length > 0);
  }

  function getTextContent(node) {
    if (t.isStringLiteral(node)) {
      return node.value;
    }
    if (t.isJSXText(node)) {
      return node.value.trim();
    }
    return '';
  }

  function shouldTransformElement(elementName) {
    // Transform common text elements
    const textElements = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div', 'button', 'a'];
    return textElements.includes(elementName);
  }

  return {
    name: 'buildll-transform',
    visitor: {
      Program: {
        enter(path, state) {
          // Reset counter for each file
          contentCounter = 0;
          const filePath = state.filename || 'unknown';
          if (!fileContentMap.has(filePath)) {
            fileContentMap.set(filePath, new Set());
          }
        }
      },

      JSXElement(path, state) {
        const { node } = path;
        const elementName = node.openingElement.name.name;

        if (!shouldTransformElement(elementName)) {
          return;
        }

        // Find text content in children
        const textChild = node.children.find(child =>
          isTextNode(child) && getTextContent(child).length > 0
        );

        if (!textChild) {
          return;
        }

        const textContent = getTextContent(textChild);
        const contentId = generateContentId(
          state.filename || 'unknown',
          elementName,
          textContent
        );

        // Add data attributes to opening element
        node.openingElement.attributes.push(
          t.jSXAttribute(
            t.jSXIdentifier('data-buildll-id'),
            t.stringLiteral(contentId)
          )
        );

        node.openingElement.attributes.push(
          t.jSXAttribute(
            t.jSXIdentifier('data-buildll-text'),
            t.stringLiteral(textContent)
          )
        );

        // Replace text content with Text component
        const textElement = t.jSXElement(
          t.jSXOpeningElement(
            t.jSXIdentifier('Text'),
            [
              t.jSXAttribute(
                t.jSXIdentifier('contentId'),
                t.stringLiteral(contentId)
              ),
              t.jSXAttribute(
                t.jSXIdentifier('fallback'),
                t.stringLiteral(textContent)
              )
            ]
          ),
          t.jSXClosingElement(t.jSXIdentifier('Text')),
          [],
          true
        );

        // Replace the text child with Text component
        const textChildIndex = node.children.indexOf(textChild);
        node.children[textChildIndex] = textElement;
      },

      Program: {
        exit(path, state) {
          // Add Text import if any transformations were made
          const hasTransformations = path.traverse({
            JSXElement(innerPath) {
              const { node } = innerPath;
              if (node.openingElement.name.name === 'Text') {
                return true;
              }
            }
          });

          if (hasTransformations) {
            // Add import for Text
            const importDeclaration = t.importDeclaration(
              [t.importSpecifier(t.identifier('Text'), t.identifier('Text'))],
              t.stringLiteral('@buildll/sdk')
            );

            path.unshiftContainer('body', importDeclaration);
          }
        }
      }
    }
  };
};