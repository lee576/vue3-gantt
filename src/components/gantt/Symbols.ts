// 定义多个 Symbol
const SetBarColorSymbol = Symbol('SetBarColor');
const AddRootTaskSymbol = Symbol('AddRootTask');
const SharedStateSymbol = Symbol('SharedState');

// 以对象形式导出
export const Symbols = {
  SetBarColorSymbol,
  AddRootTaskSymbol,
  SharedStateSymbol
};