import randomWords from "random-words";
import { ENGLISH_MODE } from "../constants/Constants";


const wordsGenerator = (
  wordsCount,
  
  languageMode,

) => {
  if (languageMode === ENGLISH_MODE) {
    const randomWordsGenerated = randomWords({
      exactly: wordsCount,
      maxLength: 7,
    });
    const words = [];
    for (let i = 0; i < wordsCount; i++) {
      let wordCandidate = randomWordsGenerated[i];
    
      words.push({ key: wordCandidate, val: wordCandidate });
    }
    return words;
  }
  return ["something", "went", "wrong"];
};

const wordsCardVocabGenerator = (vocabSource, chapter) => {
  const wordsList = [];


  
  return wordsList;
};

export { wordsGenerator, wordsCardVocabGenerator };
