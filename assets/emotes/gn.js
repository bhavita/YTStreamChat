'use strict'

const fs = require('fs');

let fileContent = fs.readFileSync('./assets/dictionary.json', 'utf-8');

console.log(fileContent);

const dictionary = JSON.parse(fileContent).emotes;


console.log('dic' + dictionary);



// const fs = require('fs');

let MD = `\
# Rae-Emotes Dictionary
These are the custom emotes included in emotesly extension for Valkyrae youtube channel (), 
If you would like a new emote added, please make an issue about it and gain support, altnativly if you are in her discord you can reach out to me to add more :)
`;

const tableRow = (code, file) =>  { console.log(code +"--------"+file);
  return '| ![](rae/'+file+')|'+code+'|\n';
}

const tableTemplate = () => `
| Emote | Text |
| --- | --- |
` 



// ---

// const emoteToObj = code => ({dictionary[code], file: dictionary.code.id + "." + dictionary.code.ext });

// ---

 const emoteKeys = Object.keys(dictionary);

 console.log('k '+emoteKeys)

 MD+= tableTemplate();

 dictionary.forEach(obj => {
  const file =  obj.id + "." + obj.ext
  MD += tableRow(obj.code, file);

  console.log(obj.code+ ' - '+ file)
 });

fs.writeFile('RaeEmotes.md', MD, () => {
  console.log('RaeEmotes.md generated');
});