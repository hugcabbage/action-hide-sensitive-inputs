import core from '@actions/core';
import fs from 'fs';
import colors from 'ansi-styles';

function getInputKeysToHide(allInputKeys, listOfInputsToExclude, listOfInputsToInclude) {
    let inputKeysToHide;
    if (listOfInputsToInclude.length > 0) {
        inputKeysToHide = listOfInputsToInclude.filter(inputKey => allInputKeys.includes(inputKey));
    } else {
        const excludeSet = new Set(listOfInputsToExclude);
        inputKeysToHide = allInputKeys.filter(inputKey => !excludeSet.has(inputKey));
    }
    return inputKeysToHide;
}

try {
    // Get a list of inputs that we should hide the values of. 
    const listOfInputsToInclude = core.getInput('include_inputs').split(',').map(item => item.trim());
    const listOfInputsToExclude = core.getInput('exclude_inputs').split(',').map(item => item.trim());
    let inputsObject = JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8')).inputs;
    let allInputKeys = Object.keys(inputsObject);

    core.info(`${colors.blue.open}All inputs for this workflow: ${allInputKeys}`)
    core.info(`${colors.blue.open}List of inputs to include: ${listOfInputsToInclude}`)
    core.info(`${colors.blue.open}List of inputs to exclude: ${listOfInputsToExclude}`)

    let inputKeysToHide = getInputKeysToHide(allInputKeys, listOfInputsToExclude, listOfInputsToInclude);

    core.info(`${colors.yellow.open}These are all of the inputs that will be hidden: ${inputKeysToHide}`)

    // Time to hide the values 

    core.info('')

    for (const inputKey of inputKeysToHide) {    
        core.info(`${colors.white.open}Hiding value for input: ${inputKey}`)
        core.setSecret(inputsObject[inputKey])
    }

    core.info('')

    // Done! 

    core.info(`${colors.green.open}Done!`)
} catch (error) {
    if (error instanceof TypeError) {
        core.info('No input value was found');
    } else {
        core.info('Unknown error');
    }
}
