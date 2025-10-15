export const logger = (store) => (next) => (action) => {
  console.group(action.type);
  console.log("Prev State:", store.getState());
  console.log("Action:", action);
  const result = next(action);
  console.log("Next State:", store.getState());
  console.groupEnd();
  return result;
};
