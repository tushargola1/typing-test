import React from "react";
import { Box } from "@mui/system";
import { Tooltip } from "@mui/material";
import { CHAR_TOOLTIP_TITLE } from "../../../constants/Constants";

const Stats = ({
  status,
  wpm,
  countDown,
  countDownConstant,
  statsCharCount,
  rawKeyStrokes,
}) => {
  return (
    <>
    <div className="result-time d-flex justify-content-between">
    
      <h5>WPM: {Math.round(wpm)}</h5>
    </div>
     
      <Box display="flex" flexDirection="row">
      
     



       
        {status === "finished" && (
          <Tooltip
            title={
              <span style={{ whiteSpace: "pre-line" }}>
                {CHAR_TOOLTIP_TITLE}
              </span>
            }
          >
             <div className="container  my-3  ">
            <h5>
             
          
  <div className="row  text-dark" >
    <div className="col border border-1 py-3 col-12 col-md-6 col-lg-6 " style={{backgroundColor : "#BB86FC"}}> <span >Accuracy: {Math.round(statsCharCount[0])} %</span> </div>
    <div className="col border border-1 py-3 col-12 col-md-6 col-lg-6" style={{backgroundColor : "#BB86FC"}}>   <span >
      Inaccuracy: {Math.round(100 - statsCharCount[0])} %
    </span> </div>
    <div className="w-100"></div>
    <div className="col border border-1 py-3 col-12 col-md-6 col-lg-6 " style={{backgroundColor : "#BB86FC"}}>
<span className="correct-char-stats text-dark">Correct words : {statsCharCount[1]}</span> </div>
    <div className="col border border-1 py-3 col-12 col-md-6 col-lg-6 text-dark" style={{backgroundColor : "#BB86FC"}}><span className="incorrect-char-stats text-dark" >Incorrect words: {statsCharCount[2]}</span> </div>
    <div className="w-100"></div>
    <div className="col border border-1 py-3 col-12 col-md-6 col-lg-6 text-dark" style={{backgroundColor : "#BB86FC"}}>
    <span className="missing-char-stats text-dark"  >Missing word : { statsCharCount[3]}</span> </div>
    <div className="col border border-1 py-3 col-12 col-md-6 col-lg-6 text-dark" style={{backgroundColor : "#BB86FC"}}><span className="correct-char-stats text-dark"  >Total Character : {statsCharCount[4]}</span> </div>
  </div>  </h5>
</div>
           
 

              
            
              
             
          
          </Tooltip>
        )}
     

      </Box>
    </>
  );
};

export default Stats;
