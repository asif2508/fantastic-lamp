import React, { useState, useRef, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import axios from "axios";
import "./Home.css";

import buttonBg from "../assets/button.webp";

const Home = () => {
  const TIMEOUT = 2 * 60000; //2 minutes
  let timeoutId = useRef();
  const loopVideoRef = useRef(null);
  const responseVideoRef = useRef(null);

  const [videoInQueue, setVideoInQueue] = useState(undefined);
  const [videoName, setVideoName] = useState("welcome.mp4");
  const [responseUrl, setResponseUrl] = useState("welcome.mp4");

  const [isResponseVideoVisible, setResponseVideoVisible] = useState(true);
  const [isOverlayVisible, setOverlayVisible] = useState(true);

  useEffect(() => {
    if (isOverlayVisible) return;
    responseVideoRef.current.play();
  }, [isOverlayVisible]);

  // Sends the message to the server
  const sendDialogToServer = async (message) => {
    if (message.trim() !== "") {
      if (timeoutId.current) clearTimeout(timeoutId.current);
      console.log("Captured text : ", message);
      const res = await axios.post(
        "https://vidchatapi.herokuapp.com/text-input",
        {
          message: message,
        }
      );
      console.log(res.data.data);
      const response = res.data.data[0].queryResult.fulfillmentText.split(";");
      const responseVideoName = response[0] + ".mp4";
      const responseUrlName = response[1];
      console.log("Video to be played : ", responseVideoName);
      console.log("url : ", responseUrlName);
      setVideoInQueue(responseVideoName);
      if (responseUrlName?.split(".")[1] === "google") {
        setResponseUrl("https://www.google.com/webhp?igu=1");
      } else {
        setResponseUrl("https://" + responseUrlName);
      }
    }
  };

  const commands = [
    {
      command: "*",
      callback: (message) => sendDialogToServer(message),
    },
  ];
  const { listening, browserSupportsSpeechRecognition } = useSpeechRecognition({
    commands,
  });

  useEffect(() => {
    if (isOverlayVisible) return;
    responseVideoRef.current.play();
  }, [isOverlayVisible]);

  useEffect(() => {
    if (timeoutId.current) clearTimeout(timeoutId.current);

    console.log(`I'm ${!listening ? "not" : ""} listening`);

    if (!listening) return;
    timeoutId.current = setTimeout(() => {
      const responseVideoName = "thankyou.mp4";
      console.log("Video to be played : ", responseVideoName);
      setVideoInQueue(responseVideoName);
    }, TIMEOUT);
  }, [listening,TIMEOUT]);

  // Checks browser compatibility
  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  return (
    <div>
      <div>
        {/* Loop video plays indefinitely in background */}
        <video
          className="video"
          ref={loopVideoRef}
          muted
          onPlay={() => console.log("Playing loop.mp4")}
          onEnded={() => {
            //If no video is in queue we loop the video again from 0th second
            if (!videoInQueue) {
              // loopVideoRef.current.currentTime = 0;
              loopVideoRef.current.play();
              return;
            }

            //If there is a video in queue we set that to be played and make the response visible
            setVideoName(videoInQueue);
            setVideoInQueue(undefined);
            setResponseVideoVisible(true);
            responseVideoRef.current.load();
            SpeechRecognition.stopListening();
            responseVideoRef.current.play();
          }}
        >
          <source src="/videos/loop.mp4" type="video/mp4" />
        </video>

        {/* Loading the response video, initially the video name is welcome.mp4 */}
        <video
          className="video"
          ref={responseVideoRef}
          onPlay={() => console.log(`Playing ${videoName}`)}
          onEnded={() => {
            // To reset the loop video to 0th second
            loopVideoRef.current.currentTime = 0;
            loopVideoRef.current.play();
            if (videoName !== "thankyou.mp4")
              SpeechRecognition.startListening({ continuous: true });
            else console.log("I won't listen anymore");

            setVideoName(undefined);
            setResponseVideoVisible(false);
          }}
          style={{ display: isResponseVideoVisible ? "block" : "none" }}
        >
          <source src={`/videos/${videoName}`} type="video/mp4" />
        </video>
      </div>

      <div className="webpage">
          <iframe
            src={responseUrl}
            height="100%"
            width="100%"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture full"
            sandbox="allow-scripts"
            loading="eager"
            title={responseUrl}
          ></iframe>
      </div>

      {isOverlayVisible && (
        <div className="overlay">
          <img
            onClick={() => setOverlayVisible(false)}
            height="100px"
            style={{
              cursor: "pointer",
            }}
            src={buttonBg}
            alt="button"
          />
        </div>
      )}
    </div>
  );
};

export default Home;
