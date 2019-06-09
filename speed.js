'use strict';

const aeObj = require('./AsyncEmitters/objects');
const aeArr = require('./AsyncEmitters/arrays&objects');

const COUNT = [10,100,1000,10000,100000];

async function speedChecker(ae, n) {
    const cb = new Array(n)
        .fill(0)
        .map((() => async () => {}));
    const ee = new ae();
    cb.forEach((fn, index) => ee.on(index,fn));

    console.time('Check');
    Promise.all(cb.map(async (fn, index) => {
      await ee.emit(index);
    }))
    console.timeEnd('Check');
};


// Test

console.log('-----aeObj-----');
COUNT.map(c => {
    console.log(c);
    speedChecker(aeObj,c);
});
console.log('-----aeObj-----');

console.log('-----aeArr-----');
COUNT.map(c => {
    console.log(c);
    speedChecker(aeArr,c);
});
console.log('-----aeArr-----');
