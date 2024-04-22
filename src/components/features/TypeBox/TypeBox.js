import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom"; // Import useParams to extract URL parameters
import { wordsGenerator } from "../../../scripts/wordsGenerator";
import IconButton from "../../utils/IconButton";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import useLocalPersistState from "../../../hooks/useLocalPersistState";
import CapsLockSnackbar from "../CapsLockSnackbar";
import Stats from "./Stats";
import { Dialog } from "@mui/material";
import {
  DEFAULT_COUNT_DOWN,
  DEFAULT_WORDS_COUNT,
  ENGLISH_MODE,
  PACING_CARET,
  PACING_PULSE,
  PACING_CARET_TOOLTIP,
  PACING_PULSE_TOOLTIP,
} from "../../../constants/Constants";
import axios from 'axios';

const TypeBox = ({
  textInputRef,
  isFocusedMode,
  handleInputFocus,
}) => {
  const [testId, setTestId] = useState(128); // State to store the test ID
  const { test_id } = useParams();
  useEffect(() => {
    if (test_id) {
      setTestId(test_id); // Set the test ID from URL params
    }
  }, [test_id]);
  const [isTestRunning, setIsTestRunning] = useState(false);
  
  const [paragraph, setParagraph] = useState([]);

  useEffect(() => {
    if (testId) {
      // Fetch data from the API using Axios
      axios.get(`https://guardianeb.com/api/typing-practice/${testId}`)
        .then(response => {
          const data = response.data;
          if (data.data.paragraph && data.data.time_limit) {
            setParagraph(data.data.paragraph.split(' '));
            setCountDownConstant(data.data.time_limit * 60);
          } else {
            console.error('Paragraph or time_limit not found in API response');
          }
        })
        .catch(error => {
          console.error('Error fetching data:', error);
        });
    }
  }, [testId]);
  const startTest = () => {
    if (!isTestRunning) {
      setIsTestRunning(true);
      start();
    } else {
      submitTest();
    }
  
    // Reset countdown state if test is finished
    if (status === "finished") {
      // Reset the countdown state here
      reset(countDownConstant, language, false);
    }
  };
  

  const submitTest = () => {
    setIsTestRunning(false);
    clearInterval(intervalId);
    setStatus("finished");
  };
  // local persist timer
  const [countDownConstant, setCountDownConstant] = useLocalPersistState(
    DEFAULT_COUNT_DOWN,
    "timer-constant"
  );

  // local persist pacing style
  const [pacingStyle, setPacingStyle] = useLocalPersistState(
    PACING_PULSE,
    "pacing-style"
  );


  // local persist difficulty
  const [language, setLanguage] = useLocalPersistState(
    ENGLISH_MODE,
    "language"
  );





  // Caps Lock
  const [capsLocked, setCapsLocked] = useState(false);

  // tab-enter restart dialog
  const [openRestart, setOpenRestart] = useState(false);

  const EnterkeyPressReset = (e) => {
    // press enter/or tab to reset;
    if (e.keyCode === 13 || e.keyCode === 9) {
      e.preventDefault();
      setOpenRestart(false);
      reset(countDownConstant,  language, false);
    } // press space to redo
    else if (e.keyCode === 32) {
      e.preventDefault();
      setOpenRestart(false);
      reset(countDownConstant, language, true);
    } else {
      e.preventDefault();
      setOpenRestart(false);
    }
  };
  const handleTabKeyOpen = () => {
    setOpenRestart(true);
  };

  // set up words state
  const [wordsDict, setWordsDict] = useState(() => {
    if (language === ENGLISH_MODE) {
      return wordsGenerator(DEFAULT_WORDS_COUNT, ENGLISH_MODE,);
    }
   
  });

  const words = useMemo(() => {
    return wordsDict.map((e) => e.val);
  }, [wordsDict]);

  const wordsKey = useMemo(() => {
    return wordsDict.map((e) => e.key);
  }, [wordsDict]);

  const wordSpanRefs = useMemo(
    () =>
      Array(words.length)
        .fill(0)
        .map((i) => React.createRef()),
    [words]
  );

  // set up timer state
  const [countDown, setCountDown] = useState(countDownConstant);
  const [intervalId, setIntervalId] = useState(null);

  // set up game loop status state
  const [status, setStatus] = useState("waiting");

  // enable menu
  const menuEnabled = !isFocusedMode || status === "finished";

  // set up hidden input input val state
  const [currInput, setCurrInput] = useState("");
  // set up world advancing index
  const [currWordIndex, setCurrWordIndex] = useState(0);
  // set up char advancing index
  const [currCharIndex, setCurrCharIndex] = useState(-1);
  const [prevInput, setPrevInput] = useState("");

  // set up words examine history
  const [wordsCorrect, setWordsCorrect] = useState(new Set());
  const [wordsInCorrect, setWordsInCorrect] = useState(new Set());
  const [inputWordsHistory, setInputWordsHistory] = useState({});

  // setup stats
  const [rawKeyStrokes, setRawKeyStrokes] = useState(0);
  const [wpmKeyStrokes, setWpmKeyStrokes] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [statsCharCount, setStatsCharCount] = useState([]);

  // set up char examine hisotry
  const [history, setHistory] = useState({});
  const keyString = currWordIndex + "." + currCharIndex;
  const [currChar, setCurrChar] = useState("");

  useEffect(() => {
    if (currWordIndex === DEFAULT_WORDS_COUNT - 1) {
      if (language === ENGLISH_MODE) {
        const generatedEng = wordsGenerator(
          DEFAULT_WORDS_COUNT,
       
          ENGLISH_MODE,
         
        );
        setWordsDict((currentArray) => [...currentArray, ...generatedEng]);
      }
     
    }
    if (
      currWordIndex !== 0 &&
      wordSpanRefs[currWordIndex].current.offsetLeft <
      wordSpanRefs[currWordIndex - 1].current.offsetLeft
    ) {
      wordSpanRefs[currWordIndex - 1].current.scrollIntoView();
    } else {
      return;
    }
  }, [currWordIndex, wordSpanRefs,  language]);
  useEffect(() => {
    // Calculate WPM only when the timer is running
    if (status === "started") {
      // Calculate WPM
      const currentWpm =
        (wpmKeyStrokes / 5 / (countDownConstant - countDown)) * 60.0;
      // Update the state with the calculated WPM
      setWpm(currentWpm);
    }
  }, [status, wpmKeyStrokes, countDown, countDownConstant]);
  const reset = (newCountDown,  language,  isRedo) => {
    setStatus("waiting");
    if (!isRedo) {
   
      if (language === ENGLISH_MODE) {
        setWordsDict(wordsGenerator(DEFAULT_WORDS_COUNT, language, ));
      }
    }
  
    setCountDownConstant(newCountDown);
    setCountDown(newCountDown);

    setLanguage(language);
    clearInterval(intervalId);
    setWpm(0);
    setRawKeyStrokes(0);
    setWpmKeyStrokes(0);
    setCurrInput("");
    setPrevInput("");
    setIntervalId(null);
    setCurrWordIndex(0);
    setCurrCharIndex(-1);
    setCurrChar("");
    setHistory({});
    setInputWordsHistory({});
    setWordsCorrect(new Set());
    setWordsInCorrect(new Set());
    textInputRef.current.focus();
    
    wordSpanRefs[0].current.scrollIntoView();
  };

  const start = () => {
    if (status === "finished") {
      setCurrInput("");
      setPrevInput("");
      setCurrWordIndex(0);
      setCurrCharIndex(-1);
      setCurrChar("");
      setHistory({});
      setInputWordsHistory({});
      setWordsCorrect(new Set());
      setWordsInCorrect(new Set());
      
      setStatus("waiting");
      textInputRef.current.focus();
    }

    if (status !== "started") {
      setStatus("started");
      let intervalId = setInterval(() => {
        setCountDown((prevCountdown) => {
          if (prevCountdown === 0) {
            clearInterval(intervalId);
            // current total extra inputs char count
            const currCharExtraCount = Object.values(history)
              .filter((e) => typeof e === "number")
              .reduce((a, b) => a + b, 0);

            // current correct inputs char count
            const currCharCorrectCount = Object.values(history).filter(
              (e) => e === true
            ).length;

            // current correct inputs char count
            const currCharIncorrectCount = Object.values(history).filter(
              (e) => e === false
            ).length;

            // current missing inputs char count
            const currCharMissingCount = Object.values(history).filter(
              (e) => e === undefined
            ).length;

            // current total advanced char counts
            const currCharAdvancedCount =
              currCharCorrectCount +
              currCharMissingCount +
              currCharIncorrectCount;

            
            const accuracy =
              currCharCorrectCount === 0
                ? 0
                : (currCharCorrectCount / currCharAdvancedCount) * 100;

            setStatsCharCount([
              accuracy,
              currCharCorrectCount,
              currCharIncorrectCount,
              currCharMissingCount,
              currCharAdvancedCount,
              currCharExtraCount,
            ]);

            checkPrev();
            setStatus("finished");

            return countDownConstant;
          } else {
            return prevCountdown - 1;
          }
        });
      }, 1000);
      setIntervalId(intervalId);
    }
  };

  const UpdateInput = (e) => {
    if (status === "finished") {
      return;
    }
    setCurrInput(e.target.value);
    inputWordsHistory[currWordIndex] = e.target.value.trim();
    setInputWordsHistory(inputWordsHistory);
  };

  const handleKeyUp = (e) => {
    setCapsLocked(e.getModifierState("CapsLock"));
  };

  const handleKeyDown = (e) => {
   
    const key = e.key;
    const keyCode = e.keyCode;
    setCapsLocked(e.getModifierState("CapsLock"));

    // keydown count for KPM calculations to all types of operations
    if (keyCode === 13) {
      e.preventDefault(); // Prevent the default action of the Enter key
      return; // Exit the function
    }
    if (status === "started") {
      setRawKeyStrokes(rawKeyStrokes + 1);
      if (keyCode >= 65 && keyCode <= 90) {
        setWpmKeyStrokes(wpmKeyStrokes + 1);
      }
    }

    // disable Caps Lock key
    if (keyCode === 20) {
      e.preventDefault();
      return;
    }

    // disable shift alt ctrl
    if (keyCode >= 16 && keyCode <= 18) {
      e.preventDefault();
      return;
    }

    // disable tab key
    if (keyCode === 9) {
      e.preventDefault();
      handleTabKeyOpen();
      return;
    }

    if (status === "finished") {
      setCurrInput("");
      setPrevInput("");
      return;
    }


    
    // start the game by typing any thing
    if (status !== "started" && status !== "finished") {
      start();
    }

    // space bar
    if (keyCode === 32) {
      const prevCorrectness = checkPrev();
      // advance to next regardless prev correct/not
      if (prevCorrectness === true || prevCorrectness === false) {
        // reset currInput
        setCurrInput("");
        // advance to next
        setCurrWordIndex(currWordIndex + 1);
        setCurrCharIndex(-1);
        return;
      } else {
  
        return;
      }

      // backspace
    } else if (keyCode === 8) {
      // delete the mapping match records
      delete history[keyString];

      // avoid over delete
      if (currCharIndex < 0) {
        // only allow delete prev word, rewind to previous
        if (wordsInCorrect.has(currWordIndex - 1)) {
          // console.log("detected prev incorrect, rewinding to previous");
          const prevInputWord = inputWordsHistory[currWordIndex - 1];
          // console.log(prevInputWord + " ")
          setCurrInput(prevInputWord + " ");
          setCurrCharIndex(prevInputWord.length - 1);
          setCurrWordIndex(currWordIndex - 1);
          setPrevInput(prevInputWord);
        }
        return;
      }
      setCurrCharIndex(currCharIndex - 1);
      setCurrChar("");
      return;
    } else {
      setCurrCharIndex(currCharIndex + 1);
      setCurrChar(key);
      return;
     
    }
  };

  const getExtraCharClassName = (i, idx, extra) => {
    if (
      pacingStyle === PACING_CARET &&
      currWordIndex === i &&
      idx === extra.length - 1
    ) {
      return "caret-extra-char-right-error";
    }
    return "error-char";
  };

  const getExtraCharsDisplay = (word, i) => {
    let input = inputWordsHistory[i];
    if (!input) {
      input = currInput.trim();
    }
    if (i > currWordIndex) {
      return null;
    }
    if (input.length <= word.length) {
      return null;
    } else {
      const extra = input.slice(word.length, input.length).split("");
      history[i] = extra.length;
      return extra.map((c, idx) => (
        <span key={idx} className={getExtraCharClassName(i, idx, extra)}>
          {c}
        </span>
      ));
    }
  };

  const checkPrev = () => {
    const wordToCompare = words[currWordIndex];
    const currInputWithoutSpaces = currInput.trim();
    const isCorrect = wordToCompare === currInputWithoutSpaces;
    if (!currInputWithoutSpaces || currInputWithoutSpaces.length === 0) {
      return null;
    }
    if (isCorrect) {
      // console.log("detected match");
      wordsCorrect.add(currWordIndex);
      wordsInCorrect.delete(currWordIndex);
      let inputWordsHistoryUpdate = { ...inputWordsHistory };
      inputWordsHistoryUpdate[currWordIndex] = currInputWithoutSpaces;
      setInputWordsHistory(inputWordsHistoryUpdate);
      // reset prevInput to empty (will not go back)
      setPrevInput("");

      // here count the space as effective wpm.
      setWpmKeyStrokes(wpmKeyStrokes + wordToCompare.length + 1);
      return true;
    } else {
      // console.log("detected unmatch");
      wordsInCorrect.add(currWordIndex);
      wordsCorrect.delete(currWordIndex);
      let inputWordsHistoryUpdate = { ...inputWordsHistory };
      inputWordsHistoryUpdate[currWordIndex] = currInputWithoutSpaces;
      setInputWordsHistory(inputWordsHistoryUpdate);
      // append currInput to prevInput
      setPrevInput(prevInput + " " + currInputWithoutSpaces);
      return false;
    }
  };

  const getWordClassName = (wordIdx) => {
    if (wordsInCorrect.has(wordIdx)) {
      if (currWordIndex === wordIdx) {
        if (pacingStyle === PACING_PULSE) {
          return "word error-word active-word";
        } else {
          return "word error-word active-word-no-pulse";
        }
      }
      return "word error-word";
    } else {
      if (currWordIndex === wordIdx) {
        if (pacingStyle === PACING_PULSE) {
          return "word active-word";
        } else {
          return "word active-word-no-pulse";
        }
      }
      return "word";
    }
  };





  const getCharClassName = (wordIdx, charIdx, char, word) => {
    const keyString = wordIdx + "." + charIdx;
    if (
      pacingStyle === PACING_CARET &&
      wordIdx === currWordIndex &&
      charIdx === currCharIndex + 1 &&
      status !== "finished"
    ) {
      return "caret-char-left";
    }
    if (history[keyString] === true) {
      if (
        pacingStyle === PACING_CARET &&
        wordIdx === currWordIndex &&
        word.length - 1 === currCharIndex &&
        charIdx === currCharIndex &&
        status !== "finished"
      ) {
        return "caret-char-right-correct";
      }
      return "correct-char";
    }
    if (history[keyString] === false) {
      if (
        pacingStyle === PACING_CARET &&
        wordIdx === currWordIndex &&
        word.length - 1 === currCharIndex &&
        charIdx === currCharIndex &&
        status !== "finished"
      ) {
        return "caret-char-right-error";
      }
      return "error-char";
    }
    if (
      wordIdx === currWordIndex &&
      charIdx === currCharIndex &&
      currChar &&
      status !== "finished"
    ) {
      if (char === currChar) {
        history[keyString] = true;
        return "correct-char";
      } else {
        history[keyString] = false;
        return "error-char";
      }
    } else {
      if (wordIdx < currWordIndex) {
        // missing chars
        history[keyString] = undefined;
      }

      return "char";
    }
  };




  const getPacingStyleButtonClassName = (buttonPacingStyle) => {
    if (pacingStyle === buttonPacingStyle) {
      return "active-button";
    }
    return "inactive-button";
  };

 

  const handleEnterKeyPress = (e) => {
    if (e.keyCode === 13) { // Check if Enter key was pressed
      e.preventDefault(); // Prevent the default action
    }
  };
  return (
    <div className="container area">
      {status === "finished" ? (
        <div className="stats">
          <Stats
            status={status}
            wpm={wpm}
            countDown={countDown}
            countDownConstant={countDownConstant}
            statsCharCount={statsCharCount}
            rawKeyStrokes={rawKeyStrokes}
          />
        </div>
      ) : (
        <div onClick={handleInputFocus}>
          <CapsLockSnackbar open={capsLocked} />
          <div className="stats stats-time"></div>
          {language === ENGLISH_MODE && (
            <div className="type-box">
              <div className="words">
                {paragraph.map((word , i) =>(
                      <span
                      key={i}
                      ref={wordSpanRefs[i]}
                      className={getWordClassName(i)}
                    >

{word.split("").map((char, idx) => (
                      <span 
                        key={"word" + idx}
                        className={getCharClassName(i, idx, char, word)}
                      >
                        {char} 
                      </span>
                    ))}
                    {getExtraCharsDisplay(word, i)}


                           </span>
                ))}
         
              </div>
            </div>
          )}
         <textarea
  key="hidden-input"
  ref={textInputRef}
  type="text"
  className="my-5 textarea border border-1 h-100 container"
  onKeyDown={(e) => { handleKeyDown(e); handleEnterKeyPress(e); }}
  onKeyUp={(e) => handleKeyUp(e)}
  value={currInput}
  onChange={(e) => {
    const updatedInput = e.target.value;
    setCurrInput(updatedInput);
    UpdateInput(e);
  }}
  disabled={!isTestRunning} // Disable the textarea when the test is not running
/>
        </div>
      )}
  
      <h5 className="time-data">Time: {countDown} s</h5>
  
      <div className="restart-button" key="restart-button">
        <Grid container justifyContent="center" alignItems="center">
          <Box display="flex" flexDirection="row">
            <IconButton
              aria-label={isTestRunning ? "submit" : "restart"}
              color={isTestRunning ? "primary" : "secondary"}
              size="medium"
              onClick={startTest}
            >
              {isTestRunning ? "Submit" : "Start"}
            </IconButton>
           
          </Box>
  
          {menuEnabled && (
            <Box display="flex" flexDirection="row">
              <IconButton
                onClick={() => {
                  setPacingStyle(PACING_PULSE);
                }}
              >
                <Tooltip title={PACING_PULSE_TOOLTIP}>
                  <span
                    className={getPacingStyleButtonClassName(PACING_PULSE)}
                  >
                    {PACING_PULSE}
                  </span>
                </Tooltip>
              </IconButton>
              <IconButton
                onClick={() => {
                  setPacingStyle(PACING_CARET);
                }}
              >
                <Tooltip title={PACING_CARET_TOOLTIP}>
                  <span 
                    className={getPacingStyleButtonClassName(PACING_CARET)}
                  >
                    {PACING_CARET}
                  </span>
                </Tooltip>
              </IconButton>
            </Box>
          )}
        </Grid>
      </div>
  
      <Dialog
        PaperProps={{
          style: {
            backgroundColor: "transparent",
            boxShadow: "none",
          },
        }}
        open={openRestart}
        onKeyDown={EnterkeyPressReset}
      >
      
      </Dialog>
    </div>
  );
  
};

export default TypeBox;
