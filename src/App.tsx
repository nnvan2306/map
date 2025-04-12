import { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
    const [isActiveAudio, setIsActiveAudio] = useState<boolean>(false);
    const [inputText, setInputText] = useState<string>("");
    const refAudio = useRef<SpeechRecognition | null>(null);

    const handleGetAudioAndSend = () => {
        if (!refAudio.current) return;
        refAudio.current.start();
        setIsActiveAudio(true);
    };

    const handleNavigateToGoogleMap = (destination: string) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const googleMapUrl = `https://www.google.com/maps/dir/${latitude},${longitude}/${encodeURIComponent(
                    destination
                )}`;
                window.open(googleMapUrl, "_blank");
            },
            (error) => {
                console.log("Error getting location: ", error);
            }
        );
    };

    useEffect(() => {
        // https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        refAudio.current = recognition;
        recognition.continuous = false;
        recognition.lang = "vi";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = function (event) {
            setIsActiveAudio(false);
            const transcript = event.results[0][0].transcript;
            setInputText(transcript);
            handleNavigateToGoogleMap(transcript);
        };

        recognition.onspeechend = function () {
            recognition.stop();
        };

        recognition.onerror = function (event) {
            console.log(event);
            console.log(event.error);
        };
    }, []);

    return (
        <div className="app-wrapper">
            <div className="container">
                <h1 className="title">Tìm đường bằng giọng nói</h1>
                <p className="instruction">
                    Nhấn nút mic và nói địa điểm bạn muốn đến.
                </p>
                <button
                    className={`mic-button ${isActiveAudio ? "listening" : ""}`}
                    onClick={handleGetAudioAndSend}
                >
                    🎤 {isActiveAudio ? "Đang nghe..." : "Nhấn để nói"}
                </button>

                <div className="output-section">
                    <div className="text-output">
                        {inputText ? (
                            <p>
                                <strong>Địa điểm:</strong> {inputText}
                            </p>
                        ) : (
                            <p>Chưa có dữ liệu</p>
                        )}
                    </div>
                    {inputText && (
                        <button
                            className="map-button"
                            onClick={() => handleNavigateToGoogleMap(inputText)}
                        >
                            Xem đường đi trên bản đồ
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
