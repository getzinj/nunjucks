import { BinOp } from './binOp';



export class FloorDiv extends BinOp {
  get typename(): string { return 'FloorDiv'; }


  constructor(lineno: number, colno: number, left, right) {
    super(lineno, colno, left, right);
  }
}
