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

function setGlobalEval( elems, refElements ) {
  var i = 0,
    l = elems.length;

  for ( ; i < l; i++ ) {
    dataPriv.set(
      elems[ i ],
      "globalEval",
      !refElements || dataPriv.get( refElements[ i ], "globalEval" )
    );
  }
}

function toType(obj: any) {
  if ( obj == null ) {
    return 'null';
  }
  // Wont support Android dinosaurs
  return typeof obj;
}

function nodeName(elem: Document, name: string) {
  return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
};

function getAll(context: Document, tag: string ) {

  // Support: IE <=9 - 11 only
  // Use typeof to avoid zero-argument method invocation on host objects (#15151)
  var ret: Element[];

  if ( typeof context.getElementsByTagName !== "undefined" ) {
    ret = Array.from<Element>(context.getElementsByTagName( tag || "*" ));

  } else if ( typeof context.querySelectorAll !== "undefined" ) {
    ret = Array.from<Element>(context.querySelectorAll( tag || "*" ));

  } else {
    ret = [];
  }

  if ( tag === undefined || tag && nodeName(context, tag ) ) {
    return [context, ...ret];
  }

  return ret;
}

function buildFragment(elems: any[], context: Document, scripts: any[], selection, ignored) {
  let elem, tmp: Node, tag: string, wrap, contains, j,
  fragment = context.createDocumentFragment(),
  nodes = [],
  i = 0,
  l = elems.length;
  
  for ( ; i < l; i++ ) {
    elem = elems[ i ];
    
    if ( elem || elem === 0 ) {
      
      // Add nodes directly
      if ( toType( elem ) === "object" ) {
        nodes = [...(elem.nodeType ? [ elem ] : elem)]
        
        // Convert non-html into a text node
      } else if ( !rhtml.test( elem ) ) {
        nodes.push( context.createTextNode( elem ) );
        
        // Convert html into DOM nodes
      } else {
        tmp = tmp || fragment.appendChild( context.createElement( "div" ) );
        
        // Deserialize a standard representation
        tag = ( rtagName.exec( elem ) || [ "", "" ] )[ 1 ].toLowerCase();
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
  
  // Remove wrapper from fragment
  fragment.textContent = "";
  
  i = 0;
  // These bastards used to reclycle variables in a bad way
  let tmp2: Element[];
  while ( ( elem = nodes[ i++ ] ) ) {
    
    // Skip elements already in the context collection (trac-4087)
    if ( selection && elem.indexOf(selection) > -1 ) {
      if ( ignored ) {
        ignored.push( elem );
      }
      continue;
    }

    // TODO: contains = FJQ.contains(elem.ownerDocument, elem)
    // this funcion is the prototype of using Sizzle.contains
    // contains = jQuery.contains( elem.ownerDocument, elem );

    // Append to fragment
    tmp2 = getAll(fragment.appendChild( elem ), "script") as Element[];
    
    // Preserve script evaluation history
    if ( contains ) {
      setGlobalEval( tmp );
    }
    
    // Capture executables
    if ( scripts ) {
      j = 0;
      while ( ( elem = tmp[ j++ ] ) ) {
        if ( rscriptType.test( elem.type || "" ) ) {
          scripts.push( elem );
        }
      }
    }
  }
  
  return fragment;
}

export function htmlPrefilter( html: string ) {
  return html.replace( rxhtmlTag, "<$1></$2>" );
}

export function parseHTML(data: string, context: (Document | Element | boolean) = document, keepScripts: boolean = false) {
  if (typeof data !== 'string') return[];
  if (typeof context === 'boolean') {
    keepScripts = context;
    context = false;
  }
  
  let base: HTMLBaseElement, parsed: RegExpExecArray, scripts: (boolean | any[]);
  
  if (!context) {
    // createHTMLDocument MUST exist nowadays, I won't be supporting IE < 10
    context = document.implementation.createHTMLDocument('');
    base = (context as Document).createElement('base');
    base.href = document.location.href;
    (context as Document).head.appendChild(base);
  }
  
  parsed = rsingleTag.exec(data);
  scripts = !keepScripts && [];
  
  if (parsed) {
    return [(context as Document).createElement(parsed[1])];
  }
  
  parsed = buildFragment([data], context, scripts);

  if (scripts && scripts.length) {
    // TODO: FJQ(scripts).remove();
  }

  return [...parsed.childNodes];
}