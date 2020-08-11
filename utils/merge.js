export default function merge(state, newState) {
  Object.keys(newState).forEach((key) => {
    if (Object.prototype.toString.call(newState[key]) === '[object Object]') {
      if (value === null || value === void 0) {
        state[key] = Array.isArray(newState[key]) ? [] : {};
      }
      merge(state[key], newState[key]);
    } else {
      state[key] = newState[key];
    }
  })
  return state;
}

// const state = { history: [{ a: [1, 2, 3] }] }
// const newState = { history: [{ a: [1, 2, 3, 4] }, { a: [5, 6, 7, 8] }] }
// const rlt = merge(state, newState)

// console.log(rlt);