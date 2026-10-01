import { utils } from './Utils.js';

const unit_test = async () => {
    if (utils.add(2, 3) === 5) {
        console.log("Test passed!");
    } else {
        console.log("Test failed: utils.add(2, 3) === 5 ");
        process.exit(1);
    }

    if (utils.add(2, 2) === 5) {
        console.log("Test passed!");
    } else {
        console.log("Case 2 Failed: Expected 4 but got " + utils.add(2, 2));
        process.exit(1);
    }
};

unit_test();