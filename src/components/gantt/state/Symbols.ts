// 定义多个 Symbol
const SetBarColorSymbol = Symbol('SetBarColor')
const SetTaskContentTextColorSymbol = Symbol('SetTaskContentTextColor')
const SetTaskTypeSymbol = Symbol('SetTaskType')
const AddRootTaskSymbol = Symbol('AddRootTask')
const TaskMoveSymbol = Symbol('TaskMove')
const SharedStateSymbol = Symbol('SharedState')

// 以对象形式导出
export const Symbols = {
  SetBarColorSymbol,
  SetTaskContentTextColorSymbol,
  SetTaskTypeSymbol,
  AddRootTaskSymbol,
  TaskMoveSymbol,
  SharedStateSymbol,
}
