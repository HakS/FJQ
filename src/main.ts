import { rquickExpr, parseHTML } from "./utilities";

// export class FJQObject implements Iterable<any> {
//   // public readonly length: number = 0;
//   // private counter = 0;

//   constructor(selector: string, context: (FJQObject | Element) = null) {
//     console.log('vrverv');
//   }

//   // public get length(): number {
//   //   return this._length;
//   // }

//   // public next(): IteratorResult<any> {
//   //   return {
//   //     done: false,
//   //     value: this.counter++
//   //   }
//   // }

//   public [Symbol.iterator]() {
//     // return this;
//     // return {
//     //   next: function() {
//     //     console.log('erverve');
//     //     return {
//     //       done: this.counter === 5,
//     //       value: this.counter++
//     //     }
//     //   }.bind(this)
//       // }
//     // }
//     let step = 0;
//     const iterator = {
//       [Symbol.iterator]() {
//         return this;
//       },
//       next() {
//         if (step <= 2) {
//           step++;
//         }
//         switch (step) {
//           case 1:
//             return { value: 'hello', done: false };
//           case 2:
//             return { value: 'world', done: false };
//           default:
//             return { value: undefined, done: true };
//         }
//       }
//     };
//     return iterator;
//   }

//   // get(index)
//   // push(element|elements)
//   // each() // make iterable
//   // map
//   // slice
//   // first
//   // last
//   // eq
//   // end

// }

// export class FJQObject extends Array {
export class FJQObject {
  [index: number]: Element;
  private readonly length: number;
  // private arr: any[] = [];

  // public push = this.arr.push;
  // public sort = this.arr.sort;
  // public splice = this.arr.splice;

  constructor(selector: Node | string, context: (FJQObject | Element) = null) {
    let match, elem;
    if (!context) {
      // return this; da fuk???
    }

    if (typeof selector === 'string') {
      if (
        selector[0] === '<' &&
        selector[selector.length - 1] === '>' &&
        selector.length >= 3
      ) {
        match = [null, selector, null];
      } else {
        match = rquickExpr .exec(selector);
      }

      if (match && (match[1] || !context)) {
        if (match[1]) {
          context = context instanceof FJQObject ? context[0] : context;

          // yep... this is downright weird and ts wont let me compile this one
          this = [...parseHTML(
            match[1],
            context && context.nodeType ? context.ownerDocument || context: document,
            true
          )]
        }
      }
    }


  }
}

export function FJQ(selector: string, context: (FJQObject | Element) = null): FJQObject {
  return new FJQObject(selector, context);
}
