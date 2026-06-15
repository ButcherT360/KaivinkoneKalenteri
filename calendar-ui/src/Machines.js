import { useState } from "react";

export default function Machines() {
    const [selectedImage, setSelectedImage] = useState(null);

    const images = [
        "/logo.png",
        "/Kauha_1.jpeg",
        "/Kauha_2.jpeg",
        "/Kauha_3.jpeg",
        "/Kauhat_1_2.jpeg"
    ];

    return (
        <div>
            <h1 className="title-bar">Vuokrattava kone ja kauhat</h1>

            <div className="gallery">
                {images.map((img, i) => (
                    <img
                        key={i}
                        src={img}
                        alt=""
                        onClick={() => setSelectedImage(img)}
                    />
                ))}
            </div>

            {selectedImage && (
                <div
                    className="lightbox"
                    onClick={() => setSelectedImage(null)}
                >
                    <img
                        src={selectedImage}
                        alt=""
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}console.log("CLICK", img);

            onClick={() => {
                console.log("CLICK", img);
                setSelectedImage(img);
            }}
        </div>

    );
}