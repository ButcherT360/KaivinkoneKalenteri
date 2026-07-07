import Layout from "./Layout";

export default function Home() {
    return (
        <Layout title="Etusivu">
            <div>
                <div className="container">
                    <img src="/logo.png" alt="kaivurilogo" />
                </div>
            </div>
        </Layout>
    );
}