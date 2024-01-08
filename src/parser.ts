// @ts-expect-error
import regexpTreeParser from '../generated/parser';

const generatedParseFn = regexpTreeParser.parse.bind(regexpTreeParser);

regexpTreeParser.parse = function(regexp: unknown, options: Object) {
    return generatedParseFn(`${regexp}`, options);
};

regexpTreeParser.setOptions({ captureLocations: false });

export default regexpTreeParser;
