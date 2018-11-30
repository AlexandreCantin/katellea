import logger from '../../src/services/logger.service';

export const importJsonToDatabase = jsonDataArray => {

  jsonDataArray.forEach(json => {
    const model = json.model;
    const fileContent = require(json.filePath);

    model.insertMany(fileContent, err => err ? logger.error(err.message) : null);

    if(json.createIndex) model.createIndexes();
  });

}