export const importJsonToDatabase = (jsonDataArray) => {

  jsonDataArray.forEach(json => {
    let model = json.model;
    let fileContent = require(json.filePath);

    model.insertMany(fileContent, (err) => err ? console.log(err) : null)

    if(json.createIndex) model.createIndexes();
  });

}