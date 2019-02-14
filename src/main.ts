import { rquickExpr, parseHTML, rsingleTag, isPlainObject } from "./utilities";

export class FJQObject {
  [index: number]: Element;
  public length: number = 0;
  // private arr: any[] = [];

  // public push = this.arr.push;
  // public sort = this.arr.sort;
  // public splice = this.arr.splice;

  constructor(selector: Node | string, context: (FJQObject | Element) = null) {

    let match: string[], elem: HTMLElement;
    if (!context) {
      return this;
    }

    // Handle HTML strings
    if (typeof selector === 'string') {
      if (
        selector[0] === '<' &&
        selector[selector.length - 1] === '>' &&
        selector.length >= 3
      ) {
        match = [null, selector, null];
      } else {
        match = Array.from(rquickExpr.exec(selector));
      }

      // HANDLE: $(html) -> $(array)
      if (match && (match[1] || !context)) {
        if (match[1]) {
          context = context instanceof FJQObject ? context[0] : context;

          // yep... this is downright weird and ts wont let me compile this one
          // const me: FJQObject = this;
          // me. = [...parseHTML(
          //   )]
          const parsedHTML = parseHTML(
            match[1],
            context && context.nodeType ? context.ownerDocument || context: document,
            true
          );

          // HANDLE: $(html, props)
          if (rsingleTag.test(match[1]) && isPlainObject(context)) {
            for (let i in context) {
              // This seems to assign methods and attributes taken from the element itself
              // jQuery you're weird dude
              // if (isFunction(this[i])) {
              //   this[i](context[i]);
              // } else {
              //   this.
              // }
            }
          }

          return this;
        // HANDLE: $(#id)
        } else {
          elem = document.getElementById(match[2]);

          if (elem) {
            this[0] = elem;
            this.length = 1;
          }
          return this;
        }
      // HANDLE: $(expr, $(...))
      } else if (!context || context instanceof FJQObject) {
        // TODO: method find
        // return (context || rootObj).find(selector);
      // HANDLE: $(expr, context)
      // (which is just equivalent to: $(context).find(expr)
      } else {
        // TODO: method find
        // return new FJQObject(context).find(selector);
      }
    // HANDLE: $(DOMElement)
    } else if (selector.nodeType) {
      this[0] = selector as Element;
      this.length = 1;
      return this;
    }

    // This port wont handle onReady calls, I'll let the user or the library
    // he uses to determine when the DOM is ready

    // jQuery seems to have a utility to transform iterables to arrays if none
    // of the previous options happen, however this library won't handle that

  }

  public [Symbol.iterator]() {
    let index = 0;
    return {
      next: () => ({
        done: index === this.length,
        value: this[index++]
      })
    }
  }
}

export const rootObj: FJQObject = new FJQObject(document);

export function FJQ(selector: string, context: (FJQObject | Element) = null): FJQObject {
  return new FJQObject(selector, context);
}
