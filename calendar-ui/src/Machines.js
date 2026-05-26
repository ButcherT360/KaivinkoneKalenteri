export default function Machines() {
    const images = [
        "logo.png",
        "/Kauha_1.jpeg",
        "/Kauha_2.jpeg",
        "/Kauha_3.jpeg",
        "/Kauhat_1_2.jpeg"
    ];

    return (
            <div className="container">
                <h1 className="title-bar">Vuokrattava kone ja kauhat</h1>
                <div className="gallery">
                    {images.map((img, i) => (
                        <img key={i} src={img} alt="" />
                    ))}
                </div>
            </div>
    );
}