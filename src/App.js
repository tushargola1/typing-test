import React, { useState, useRef, useEffect } from "react";
import { ThemeProvider } from "styled-components";
import { defaultTheme, themesOptions } from "./style/theme";
import { GlobalStyles } from "./style/global";
import TypeBox from "./components/features/TypeBox/TypeBox";
import logo from '../src/assets/Icons/logo.jpg'


function App() {
  // localStorage persist theme setting
  const [theme, setTheme] = useState(() => {
    const stickyTheme = window.localStorage.getItem("theme");
    if (stickyTheme !== null) {
      const localTheme = JSON.parse(stickyTheme);
      const upstreamTheme = themesOptions.find(
        (e) => e.label === localTheme.label
      ).value;
      // we will do a deep equal here. In case we want to support customized local theme.
      const isDeepEqual = localTheme === upstreamTheme;
      return isDeepEqual ? localTheme : upstreamTheme;
    }
    return defaultTheme;
  });

  



  const handleThemeChange = (e) => {
    window.localStorage.setItem("theme", JSON.stringify(e.value));
    setTheme(e.value);
  };

  



  // const textInputRef = useRef(null);
  // const focusTextInput = () => {
  //   textInputRef.current && textInputRef.current.focus();
  // };

  // const textAreaRef = useRef(null);
  // const focusTextArea = () => {
  //   textAreaRef.current && textAreaRef.current.focus();
  // };

  // const sentenceInputRef = useRef(null);
  // const focusSentenceInput = () => {
  //   sentenceInputRef.current && sentenceInputRef.current.focus();
  // };

  useEffect(() => {
  
    
   
    return;
  }, [
    theme
  
  ]);

  return (
    <ThemeProvider theme={theme}>
      <>
        
        <div className="canvas">
          <GlobalStyles />
          <div className="typing-heading ">
               <h3>Typing testing</h3>
          </div>

          
            <TypeBox
              // textInputRef={textInputRef}
              key="type-box"
              // handleInputFocus={() => focusTextInput()}
            ></TypeBox>
         
         
        
         
        
        </div>
      </>
    </ThemeProvider>
  );
}

export default App;
