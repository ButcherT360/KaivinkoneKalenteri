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
            <div className="gallery-wrapper">
                <div className="gallery">
                    {images.map((img, i) => (
                        <div className="gallery-item" key={i}>
                            <img
                                key={i}
                                src={img}
                                alt=""
                                onClick={() => {
                                    console.log("Klikattiin:", img);
                                    setSelectedImage(img);
                                }}
                            />
                        </div>
                    ))}
                </div>
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
            )}
        </div>

    );
}