import { FJQObject } from './main';
// import Data from './data';

export const rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]+))$/;
export const rsingleTag = ( /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i );
export const rscriptType = ( /^$|^module$|\/(?:java|ecma)script/i );
export const rtagName = ( /<([a-z][^\/\0>\x20\t\r\n\f]+)/i );
export const rhtml = /<|&#?\w+;/;
export const rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([a-z][^\/\0>\x20\t\r\n\f]*)[^>]*)\/>/gi;


// We have to close these tags to support XHTML (#13200)
var wrapMap: any = {

  // Support: IE <=9 only
  option: [ 1, "<select multiple='multiple'>", "</select>" ],

  // XHTML parsers do not magically insert elements in the
  // same way that tag soup parsers do. So we cannot shorten
  // this by omitting <tbody> or other required elements.
  thead: [ 1, "<table>", "</table>" ],
  col: [ 2, "<table><colgroup>", "</colgroup></table>" ],
  tr: [ 2, "<table><tbody>", "</tbody></table>" ],
  td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],

  _default: [ 0, "", "" ]
};

// Support: IE <=9 only
wrapMap.optgroup = wrapMap.option;

wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
wrapMap.th = wrapMap.td;

// const dataPriv = new Data();

function find() {
}

function toType(obj: any) {
  if ( obj == null ) {
    return 'null';
  }
  // Wont support Android dinosaurs
  return typeof obj;
}

function nodeName(elem: Node | Document, name: string) {
  return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
};

function getAll(context: Node, tag?: string ) {
  var ret: Element[];

  if (context instanceof Document || context instanceof Element) {

    if (typeof context.getElementsByTagName !== "undefined" ) {
      ret = Array.from<Element>(context.getElementsByTagName( tag || "*" ));

    } else if ( typeof context.querySelectorAll !== "undefined" ) {
      ret = Array.from<Element>(context.querySelectorAll( tag || "*" ));
    }

  } else {
    ret = [];
  }

  if ( tag === undefined || tag && nodeName(context, tag ) ) {
    return [context, ...ret];
  }

  return ret;
}

function buildFragment(
  elems: (FJQObject | Element | string | number)[],
  context: Document,
  scripts: any[],
  selection: any[] = null,
  ignored: Node[] = null
) {
  let elem: FJQObject | Element | string | number;
  let tmp: Node, tag: string, wrap, contains, j,
  fragment = context.createDocumentFragment(),
  nodes: Node[] = [],
  i = 0,
  l = elems.length;

  for ( ; i < l; i++ ) {
    elem = elems[i];

    if ( elem || elem === 0) {

      // Add nodes directly
      if (elem instanceof Element) {
        Object.assign(nodes, elem.nodeType ? [ elem ] : elem);

      // Convert non-html into a text node
      } else if (typeof elem === 'string') {
        if (!rhtml.test(elem)) {
          nodes.push( context.createTextNode( elem ) );
        // Convert html into DOM nodes
        } else {
          tmp = tmp || fragment.appendChild( context.createElement( "div" ) );

          // Deserialize a standard representation
          tag = (rtagName.exec(elem) || [ "", "" ] )[ 1 ].toLowerCase();
          wrap = wrapMap[ tag ] || wrapMap._default;
          (tmp as Element).innerHTML = wrap[ 1 ] + htmlPrefilter( elem ) + wrap[ 2 ];

          // Descend through wrappers to the right content
          j = wrap[ 0 ];
          while ( j-- ) {
            tmp = tmp.lastChild;
          }

          nodes = [...Array.from(tmp.childNodes)]

          // Remember the top-level container
          tmp = fragment.firstChild;

          // Ensure the created nodes are orphaned (#12392)
          tmp.textContent = "";
        }
      }
    }
  }

  // Remove wrapper from fragment
  fragment.textContent = "";

  i = 0;
  // These bastards reclycles variables in a way it looses completely its original use
  let tmp2: Node[];
  let elem2: Node;
  while ((elem2 = nodes[i++])) {

    // Skip elements already in the context collection (trac-4087)
    if (selection && selection.indexOf(elem2) > -1 ) {
      if (ignored) {
        ignored.push(elem2);
      }
      continue;
    }

    contains = Sizzle.contains(elem2.ownerDocument, elem2);

    // Append to fragment
    tmp2 = getAll(fragment.appendChild<Node>(elem2), "script") as Element[];

    // Preserve script evaluation history
    // if ( contains ) {
    //   setGlobalEval( tmp );
    // }

    // Capture executables
    if ( scripts ) {
      j = 0;
      while ((elem2 = tmp2[j++])) {
        if (rscriptType.test((elem2 instanceof HTMLScriptElement && elem2.type) || "")) {
          scripts.push(elem2);
        }
      }
    }
  }

  return fragment;
}

function filter(expr: string, elems: ArrayLike<Node>, not: boolean = false): ArrayLike<Node> {
  const elem = elems[0];

  if (not) {
    expr = ":not(" + expr + ")";
  }

  if (elems.length === 1 && elem instanceof Element) {
    return Sizzle.matchSelector(elem, expr) ? [ elem ] : [];
  }

  return Sizzle.matches(
    expr,
    grep<Node>(elems, elem => elem instanceof Element) as Element[]
  );
}

function acceptData(owner: Node | ArrayLike<any>): boolean {
  return owner instanceof Element || owner instanceof Document || !('nodeType' in owner)
}

export function isArrayLike(item: any): boolean {
  if (Array.isArray(item)) return true;
  if (typeof item === 'object') {
    if (!('length' in item)) return false;
    if (isNaN(item.length)) return false;
    if (+item.length < 0) return false;
    for (let i = 0; i < item.length; i++) {
      if (!(i in item)) return false;
    }
    return true;
  }
  return false;
}

export function grep<T>(
  elems: ArrayLike<T>,
  callback: (item: T, i: number) => boolean,
  invert: boolean = false
) {
  var callbackInverse,
    matches: T[] = [],
    i = 0,
    length = elems.length,
    callbackExpect = !invert;

  // Go through the array, only saving the items
  // that pass the validator function
  for ( ; i < length; i++ ) {
    callbackInverse = !callback(elems[i], i);
    if ( callbackInverse !== callbackExpect ) {
      matches.push(elems[i]);
    }
  }

  return matches;
}

// Implement the identical functionality for filter and not
export function winnow(elements: ArrayLike<any>, qualifier: (Element | Function | string), not: boolean) {
  if (qualifier instanceof Function) {
    return grep(elements, (elem, i) => {
      return !!qualifier.call( elem, i, elem ) !== not;
    } );
  }

  // Single element
  if (qualifier instanceof Element) {
    return grep(elements, (elem) => {
      return (elem === qualifier) !== not;
    } );
  }

  // Arraylike of elements (jQuery, arguments, Array)
  if ( typeof qualifier !== "string" ) {
    return grep(elements, (elem) => {
      return (elem.indexOf(qualifier) > -1 ) !== not;
    } );
  }

  // Filtered directly for both simple and complex selectors
  return filter(qualifier, elements, not);
}

/**
 * From https://github.com/nefe/You-Dont-Need-jQuery#utilities
 * @param obj any object or primitive
 */
export function isPlainObject(obj: any): boolean {
  if (
    typeof (obj) !== 'object' ||
    obj.nodeType ||
    obj !== null && obj !== undefined && obj === obj.window
  ) {
    return false;
  }

  if (obj.constructor &&
      !Object.prototype.hasOwnProperty.call(obj.constructor.prototype, 'isPrototypeOf')) {
    return false;
  }

  return true;
}

export function htmlPrefilter( html: string ) {
  return html.replace( rxhtmlTag, "<$1></$2>" );
}

export function parseHTML(
  data: string,
  context: (Node | boolean) = document,
  keepScripts: boolean = false
): Node[] {
  let contextEval: Document;
  if (typeof data !== 'string') return[];
  if (typeof context === 'boolean') {
    keepScripts = context;
    context = false;
  }

  let base: HTMLBaseElement, parsed: RegExpExecArray, scripts: (boolean | any[]);

  if (!context) {
    // createHTMLDocument MUST exist nowadays, I won't be supporting IE < 10
    contextEval = document.implementation.createHTMLDocument('');
    base = contextEval.createElement('base');
    base.href = document.location.href;
    contextEval.head.appendChild(base);
  } else {
    contextEval = context as Document;
  }

  parsed = rsingleTag.exec(data);
  scripts = !keepScripts && [];

  if (parsed) {
    return [contextEval.createElement(parsed[1])];
  }

  const parsed2 = buildFragment([data], contextEval, scripts);

  if (scripts && scripts.length) {
    // TODO: FJQ(scripts).remove();
  }

  return [...Array.from(parsed2.childNodes)];
}

export function remove(elem: FJQObject, selector?: string, keepData: boolean = false) {
  var node: Element,
    nodes = selector ? filter(selector, elem) : elem,
    i = 0;

  for ( ; ( node = nodes[i]) != null; i++ ) {
    if ( !keepData && node instanceof Element) {
      // Here jQuery removes the data of the picked element
      // This library won't be handling custom data yet, and if it does, I want
      // to make it an extension of this rather than something attached with it
      // If you want to use Angular or React but want to select elements in a
      // jQuery-ish way without all the extra events, ajax, animations, then you can
    }

    if (node.parentNode) {
      // if ( keepData && Sizzle.contains(node.ownerDocument, node)) {
      // Again, this seems to be keeping the script elements it deletes
      // a local cache is not a bad idea, but this jQuery data is storing
      // the value at each DOM element, maybe for this project I should create
      // something like a singleton and do the caching there
      // }
      node.parentNode.removeChild(node);
    }
  }

  return elem;
}
