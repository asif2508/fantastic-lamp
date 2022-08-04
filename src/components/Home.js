import React, { useEffect, useState, useRef } from "react";
import { Row, Col } from "react-simple-flex-grid";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import "./Home.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCoffee,
  faMicrophone,
  faMicrophoneSlash,
  faPhoneFlip,
  faPhoneSlash,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import videoFile from "../assets/video1.mp4";
import axios from "axios";

const Home = () => {
  const videoRef = useRef(null);

  const sendDialogToServer = async (message) => {
    if (message.trim() !== "") {
      setTitle(message);
      const res = await axios.get("http://localhost:8000/test");
      const responseVideoName = res.data.message;
      console.log(responseVideoName);
      videoRef.current.play();
    }
    setMessage("");
  };

  const commands = [
    {
      command: "*",
      callback: (message) => sendDialogToServer(message),
    },
  ];

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition({ commands });

  const [title, setTitle] = useState("Say Hello 👋 to me");
  const [message, setMessage] = useState("Say Hello 👋 to me");

  const startListening = () =>
    SpeechRecognition.startListening({ continuous: true });

  useEffect(() => {
    // startListening();
  }, []);

  const toggleListening = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      startListening();
      // SpeechRecognition.startListening({ continuous: true });
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  return (
    <>
      <Row>
        <Col span={2}></Col>
        <Col span={8} align="center">
          <h2 style={{ color: "#3498db" }}>{title}</h2>
        </Col>
        <Col span={2}></Col>
      </Row>
      <Row className="main-row">
        <Col span={2}></Col>
        <Col span={8} className="video-container">
          <video className="video" ref={videoRef}>
            <source src={videoFile} type="video/mp4" controls />
          </video>
        </Col>
        <Col span={2}></Col>
      </Row>
      <Row className="footer-row">
        <Col span={2}></Col>

        <Col span={8} align="center" className="icons-container">
          <button
            className={`mic-button ${listening ? "muted-icon" : ""}`}
            onClick={toggleListening}
          >
            {listening ? (
              <FontAwesomeIcon icon={faMicrophone} className="mic-icon" />
            ) : (
              <FontAwesomeIcon icon={faMicrophoneSlash} className="mic-icon" />
            )}
          </button>
          <button className={`clear-button`}>
            <FontAwesomeIcon icon={faPhoneSlash} className="mic-icon" />
          </button>
          {/*
           <p>Microphone: {listening ? "on" : "off"}</p>
          <button onClick={SpeechRecognition.startListening}>Start</button>
          <button onClick={SpeechRecognition.stopListening}>Stop</button>
          <button onClick={resetTranscript}>Reset</button>
          <p>{transcript}</p> */}
        </Col>
        <Col span={2}></Col>
      </Row>

      <div></div>
    </>
  );
};

export default Home;
