import { rquickExpr, isArrayLike } from "./utilities";

export class FJQObject implements ArrayLike<Node> {
  [index: number]: Node;
  public length: number = 0;
  // private arr: any[] = [];

  // public push = this.arr.push;
  // public sort = this.arr.sort;
  // public splice = this.arr.splice;

  constructor(
    selector: (FJQObject | ArrayLike<Node> | Node | string) = null,
    context: (FJQObject | ArrayLike<Node> | Node) = null
  ) {
    if (!selector) {
      return this;
    }

    let match: string[], elem: HTMLElement;
    // Handle HTML strings
    if (typeof selector === 'string') {
      if (
        selector[0] === '<' &&
        selector[selector.length - 1] === '>' &&
        selector.length >= 3
      ) {
        match = [null, selector, null];
      } else {
        match = rquickExpr.exec(selector);
      }

      // Match html or make sure no context is specified for #id
      if (match && (match[1] || !context)) {
        // HANDLE: $(html) -> $(array)
        if (match[1]) {
          // context = isArrayLike(context) ? (context as ArrayLike<Node>)[0] : context;

          // const parsedHTML = parseHTML(
          //   match[1],
          //   context && context instanceof Node ? context.ownerDocument || context: document,
          //   true
          // );
          // for (let htmlItem of parsedHTML) {
          //   this[length] = htmlItem;
          //   length++;
          // }

          // // HANDLE: $(html, props)
          // if (rsingleTag.test(match[1]) && isPlainObject(context)) {
          //   for (let i in context) {
          //     // This seems to assign methods and attributes taken from the element itself
          //     // jQuery you're weird dude
          //     // if (isFunction(this[i])) {
          //     //   this[i](context[i]);
          //     // } else {
          //     //   this.
          //     // }
          //   }
          // }

          // TODO: as JQuery, this would have to support HTML parsing, nowadays there is DOMParser

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
        return ((context || new FJQObject(document)) as FJQObject).find(selector);
      // HANDLE: $(expr, context)
      // (which is just equivalent to: $(context).find(expr)
      } else {
        return new FJQObject(context).find(selector);
      }
    // HANDLE: $(DOMElement)
    } else if (selector instanceof Node && selector.nodeType) {
      this[0] = selector as Element;
      this.length = 1;
      return this;
    }

    // HANDLE: $(function)
    // It won't handle onReady calls, I'll let the user or the library/framework
    // he uses to determine when the DOM is ready

    // HANDLE: $(ArrayLike)
    // just return a clone or wrap an array of Nodes
    else if (isArrayLike(selector)) {
      const selectorArr = selector as ArrayLike<Node>;
      this.length = selectorArr.length;
      for (let i in selectorArr) {
        this[i] = selectorArr[i];
      }
      return this;
    }

  }

  // private pushStack(elems: any) {
  //   // Build a new jQuery matched element set
  //   // var ret = jQuery.merge( this.constructor(), elems );
  //   const ret = {...new FJQObject(), ...elems};

  //   // Add the old object onto the stack (as a reference)
  //   ret.prevObject = this;

  //   // Return the newly-formed element set
  //   return ret;
  // }

  public find(selector: FJQObject | Element | String): FJQObject {
    let found: Element[] = [];
    for (const elem of this) {
      if (elem instanceof Document || elem instanceof Element) {
        // TODO: figure out how to use DOM elements to do the search
        // note it seems to find for elements that already exists, therefore
        // you should check if an element belongs to the DOM
        if (selector instanceof FJQObject) {
        } else if (selector instanceof Element) {
        } else if (typeof selector === 'string') {
          found = [...Array.from(elem.querySelectorAll(selector))];
        }
      }
    }
    return new FJQObject(found);
  }

  // public filter(selector: any = []) {
  //   return this.pushStack(winnow(this, selector, false));
  // }

  // public remove(selector: string) {
  //   return remove(this, selector);
  // }

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

export function FJQ(
  selector: (FJQObject | ArrayLike<Node> | Node | string) = null,
  context: (FJQObject | ArrayLike<Node> | Node) = null
): FJQObject {
  return new FJQObject(selector, context);
}
