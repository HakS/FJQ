import { rquickExpr, parseHTML, rsingleTag, isPlainObject, winnow } from "./utilities";

export class FJQObject {
  [index: number]: Element;
  public length: number = 0;
  // private arr: any[] = [];

  // public push = this.arr.push;
  // public sort = this.arr.sort;
  // public splice = this.arr.splice;

  constructor(
    selector: (FJQObject | Node | string) = null,
    context: (FJQObject | Element) = null
  ) {

    let match: string[], elem: HTMLElement;
    if (!selector) {
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

          const parsedHTML = parseHTML(
            match[1],
            context && context.nodeType ? context.ownerDocument || context: document,
            true
          );
          for (let htmlItem of parsedHTML) {
            this[length] = htmlItem;
            length++;
          }

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
    } else if (selector instanceof Node && selector.nodeType) {
      this[0] = selector as Element;
      this.length = 1;
      return this;
    }

    // This port wont handle onReady calls, I'll let the user or the library
    // he uses to determine when the DOM is ready

    // HANDLE: $(FJQObject)
    // just return a clone
    else if (selector instanceof FJQObject) {
      for (let i in selector) {
        this[i] = selector[i];
      }
      return this;
    }

  }

  private pushStack(elems: any) {
    // Build a new jQuery matched element set
    // var ret = jQuery.merge( this.constructor(), elems );
    const ret = {...new FJQObject(), ...elems};

    // Add the old object onto the stack (as a reference)
    ret.prevObject = this;

    // Return the newly-formed element set
    return ret;
  }

  public find(selector: FJQObject | Element | String) {
    var i, ret,
      len = this.length,
      self = this;

    if ( typeof selector !== "string" ) {
      return this.pushStack( FJQ(selector as FJQObject | Element).filter( function() {
        for ( i = 0; i < len; i++ ) {
          if ( jQuery.contains( self[ i ], this ) ) {
            return true;
          }
        }
      } ) );
    }

    ret = this.pushStack( [] );

    for ( i = 0; i < len; i++ ) {
      // TODO: Sizzle
      // jQuery.find( selector, self[ i ], ret );
    }

    return len > 1 ? jQuery.uniqueSort( ret ) : ret;
  }

  public filter(selector: any = []) {
    return this.pushStack(winnow(this, selector, false));
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

export function FJQ(
  selector: (FJQObject | Node | string) = null,
  context: (FJQObject | Element) = null
): FJQObject {
  return new FJQObject(selector, context);
}
