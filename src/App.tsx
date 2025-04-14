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
        if (!inputText) return;
        const query = inputText.toLowerCase();
        if (
            (query.includes("từ") &&
                (query.includes("đến") ||
                    query.includes("tới") ||
                    query.includes("đi"))) ||
            query.includes("về")
        ) {
            let keywordFilter = "đến";
            if (query.includes("tới")) {
                keywordFilter = "tới";
            }
            if (query.includes("đi")) {
                keywordFilter = "đi";
            }
            if (query.includes("về")) {
                keywordFilter = "về";
            }
            const parts = query.split("từ")[1]?.split(keywordFilter);
            if (parts && parts.length === 2) {
                const startLocation = parts[0].trim();
                const endLocation = parts[1].trim();
                getDirections(startLocation, endLocation);
            }
        }
    }, [inputText]);

    const getDirections = (startLocation: string, endLocation: string) => {
        const baseUrl = "https://www.google.com/maps/dir";
        const urlStart = encodeURIComponent(startLocation);
        const urlEnd = encodeURIComponent(endLocation);
        const url = `${baseUrl}/${urlStart}/${urlEnd}`;
        window.open(url, "_blank");
        console.log(
            `Đây là quãng đường ngắn nhất từ ${startLocation} đến ${endLocation}`
        );
    };

    useEffect(() => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        refAudio.current = recognition;
        recognition.continuous = false;
        // recognition.lang = "vi";
        recognition.lang = "vi-VN";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = function (event) {
            setIsActiveAudio(false);
            const transcript = event.results[0][0].transcript;
            setInputText(transcript);
            // handleNavigateToGoogleMap(transcript);
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
                    🎤{" "}
                    {isActiveAudio
                        ? "Đang nghe..."
                        : "Nhấn để nói nơi bạn muốn đến"}
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
