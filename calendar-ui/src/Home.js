export default function Home() {
    return (
        <div style={{ padding: 20 }}>
            <h1 className="title-bar">Etusivu</h1>

            <div>
                <img
                    src="/logo.png"
                    alt="Logo"
                    style={{
                        width: "100%",
                        maxWidth: "720px",
                        height: "100%",
                        maxHeight: "1080px",
                        borderRadius: "10px"
                    }}
                />
            </div>
        </div>
    );
}