const utils = require("./Utils.js").utils;

const unit_test = async () => {
  const firstActual = utils.add(2, 3);

  if (firstActual === 5) {
    console.log("Test Case 1 passed: utils.add(2, 3) === 5");
  } else {
    console.error(
      `Test Case 1 failed: utils.add(2, 3) expected 5, received ${firstActual}`,
    );
    process.exit(1);
  }

  const secondActual = utils.add(3, 3);

  if (secondActual === 6) {
    console.log("Test Case 2 passed: utils.add(3, 3) === 6");
  } else {
    console.error(
      `Test Case 2 failed: utils.add(3, 3) expected 6, received ${secondActual}`,
    );
    process.exit(1);
  }
};

unit_test();
