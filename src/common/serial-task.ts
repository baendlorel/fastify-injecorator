/* eslint-disable @typescript-eslint/no-explicit-any */
import '@/common/promise.js';

interface SerialTaskOptions<TaskFunction extends (...args: any[]) => any> {
  /**
   * Name of the returned function
   */
  name?: string;

  /**
   * Functions to be executed in order
   * - **Strongly Recommended**: all task functions must have same input type and output type
   * - creator will use a copy of this array, so you can modify the original array
   * - will be executed from `0` to `length - 1`
   */
  tasks: TaskFunction[];

  /**
   * Returns an array of arguments that will be spread and passed to the next task
   * @param task
   * @param index index of current task
   * @param tasks All tasks
   * @param args input value of the serial task
   * @param lastReturn returned value of the last task function
   * @returns **must return an array of arguments!**
   * @example
   * ```typescript
   * // Internal implementation
   * // first loop, index = 0
   * // The calling order of each function is as follows:
   * const inputValue = [...arguments]; // arguments of the created task function
   * let returnValue = null
   * for(...){
   *   const currentInput = resultWrapper(index, ...inputValue, returnValue);
   *   const toBreak = breakCondition(index, ...currentInput);
   *   if (toBreak) break;
   *   const toSkip = skipCondition(index, ...currentInput);
   *   if (toSkip) continue;
   *   returnValue = tasks[index](...currentInput);
   * }
   * ```
   */
  resultWrapper: (
    task: TaskFunction,
    index: number,
    tasks: TaskFunction[],
    args: Parameters<TaskFunction>,
    lastReturn: ReturnType<TaskFunction>
  ) => Parameters<TaskFunction>;

  /**
   * Break the loop and return the last result immediately when this function returns `true`
   * @param task
   * @param index index of current task
   * @param tasks All tasks
   * @param args input value of the serial task
   * @param lastReturn returned value of the last task function
   */
  breakCondition: (
    task: TaskFunction,
    index: number,
    tasks: TaskFunction[],
    args: Parameters<TaskFunction>,
    lastReturn: ReturnType<TaskFunction>
  ) => boolean;

  /**
   * Give `true` to skip this task item
   * @param task
   * @param index index of current task
   * @param tasks All tasks
   * @param args input value of the serial task
   * @param lastReturn returned value of the last task function
   */
  skipCondition: (
    task: TaskFunction,
    index: number,
    tasks: TaskFunction[],
    args: Parameters<TaskFunction>,
    lastReturn: ReturnType<TaskFunction>
  ) => boolean;
}

type Fn = (...args: any[]) => any;

interface TaskReturn<R = any> {
  /**
   * The result of the last task function
   */
  value: R;

  /**
   * All results of the tasks
   * - same order as `tasks`
   */
  results: R[];

  /**
   * Means `opts.tasks.length` is 0 or not
   */
  trivial: boolean;
}

export type Taskify<F extends Fn> = (...args: Parameters<F>) => Promise<TaskReturn<ReturnType<F>>>;

/**
 * Creates a serial task that executes a series of functions in order.
 * - **Strongly Recommended**: all task functions must have same input type and output type
 *   - returned function.length will be the same as the first task function's length
 * @param opts Options for creating a serial task, details in `SerialTaskOptions`
 * @returns a funtcion that executes the tasks in order, returns `TaskReturn<OriginalReturn>`
 */
export function createSerialTask<F extends Fn>(opts: SerialTaskOptions<F>): Taskify<F> {
  type R = ReturnType<F>;

  const { name = '', tasks: tks, breakCondition, skipCondition, resultWrapper } = opts;
  if (tks.length === 0) {
    const fn = () => ({ value: null, results: [], trivial: true }) as TaskReturn<null>;
    Reflect.defineProperty(fn, 'name', { value: name, configurable: true });
    return fn as unknown as Taskify<F>;
  }

  const tasks = tks.slice();
  const fn = async function (...args: Parameters<F>): Promise<TaskReturn<R>> {
    let last = null as R;
    const results = new Array<R>(tasks.length);
    for (let i = 0; i < tasks.length; i++) {
      const input = await Promise.try(resultWrapper, null, tasks[i], i, tasks, args, last);

      const toBreak = await Promise.try(breakCondition, null, tasks[i], i, tasks, args, last);
      if (toBreak) {
        break; // end this task
      }

      const toSkip = await Promise.try(skipCondition, null, tasks[i], i, tasks, args, last);
      if (toSkip) {
        continue; // skip this task
      }

      last = await Promise.trapply(tasks[i], null, input);
      results[i] = last;
    }

    return { value: last, results, trivial: false };
  };

  Reflect.defineProperty(fn, 'name', { value: name, configurable: true });
  Reflect.defineProperty(fn, 'length', { value: tasks[0].length, configurable: true });
  return fn;
}
