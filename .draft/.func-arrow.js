// 创建一个普通的 function
function regularFunction() {
  return;
}

// 创建一个箭头函数
const arrowFunction = () => {
  return;
};

// 测试调用 function 和箭头函数的耗时
const testFunctionCallSpeed = () => {
  // 测试调用 regular function 的速度
  console.time('regularFunctionCall');
  for (let i = 0; i < 1000000; i++) {
    regularFunction(); // 仅仅调用函数
  }
  console.timeEnd('regularFunctionCall');

  // 测试调用箭头函数的速度
  console.time('arrowFunctionCall');
  for (let i = 0; i < 1000000; i++) {
    arrowFunction(); // 仅仅调用箭头函数
  }
  console.timeEnd('arrowFunctionCall');
};

// 测试内存占用：创建多个 function 和箭头函数
const testMemoryUsage = () => {
  // 获取内存使用情况
  const beforeMemory = process.memoryUsage().heapUsed;

  // 创建大量的 function
  const functionArray = [];
  for (let i = 0; i < 1000000; i++) {
    functionArray.push(function () {}); // 创建并存储 function
  }
  const afterMemoryFunction = process.memoryUsage().heapUsed;

  // 创建大量的箭头函数
  const arrowFunctionArray = [];
  for (let i = 0; i < 1000000; i++) {
    arrowFunctionArray.push(() => {}); // 创建并存储箭头函数
  }
  const afterMemoryArrow = process.memoryUsage().heapUsed;

  console.log(`Memory used by 1 million regular functions: ${afterMemoryFunction - beforeMemory} bytes`);
  console.log(`Memory used by 1 million arrow functions: ${afterMemoryArrow - afterMemoryFunction} bytes`);
};

// 执行速度测试和内存测试
testFunctionCallSpeed();
testMemoryUsage();
