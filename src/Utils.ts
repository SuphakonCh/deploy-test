function hello(): string {
    return "Hello World";
}

function add(a: number, b: number): number {
    return a + b;
}

function multiply(a: number, b: number): number {
    return a * b;
}

function divide(a: number, b: number): number {
    return a / b;
}

export const utils = {
    hello,
    add,
    multiply,
    divide,
};
     
