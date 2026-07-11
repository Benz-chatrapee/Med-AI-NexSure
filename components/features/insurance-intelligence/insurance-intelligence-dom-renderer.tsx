import { createElement, type CSSProperties, type ReactNode } from "react";

const skippedAttributes = new Set(["xmlns"]);

function toCamelCase(name: string) {
  return name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function parseStyle(value: string): CSSProperties {
  return value.split(";").reduce<CSSProperties>((style, declaration) => {
    const [property, ...rawValue] = declaration.split(":");
    const cssValue = rawValue.join(":").trim();

    if (!property.trim() || !cssValue) return style;

    return {
      ...style,
      [toCamelCase(property.trim())]: cssValue,
    };
  }, {});
}

function mapAttributes(element: Element) {
  return Array.from(element.attributes).reduce<Record<string, unknown>>((props, attribute) => {
    if (skippedAttributes.has(attribute.name)) return props;

    if (attribute.name === "class") {
      props.className = attribute.value;
      return props;
    }

    if (attribute.name === "for") {
      props.htmlFor = attribute.value;
      return props;
    }

    if (attribute.name === "style") {
      props.style = parseStyle(attribute.value);
      return props;
    }

    props[attribute.name] = attribute.value;
    return props;
  }, {});
}

export function renderDomNode(node: Node, key: string): ReactNode {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const element = node as Element;
  const children = Array.from(element.childNodes).map((child, index) =>
    renderDomNode(child, `${key}-${index}`),
  );

  return createElement(element.tagName.toLowerCase(), { ...mapAttributes(element), key }, ...children);
}

type OriginalElementProps = {
  element: Element | null;
};

export function OriginalElement({ element }: OriginalElementProps) {
  if (!element) return null;

  return <>{renderDomNode(element, "original")}</>;
}
