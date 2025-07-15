import './App.css';
import {Route, Routes} from 'react-router-dom';
import {Layout} from './components/Layout'
import {Header} from './components/Header'
import {Login} from "./pages/Login";
import {Chat} from "./pages/Chat";
import {Register} from "./pages/Register";
import {Main} from "./components/Main";
import {useState, useEffect} from "react";
import {AuthContext} from "./context/AuthContext";

const App = () => {
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        setUserData(JSON.parse(localStorage.getItem('user')) || null);
    }, []);

    return (
        <AuthContext.Provider value={{
            userData,
            setUserData,
        }}>
            <Layout>
                <Header/>
                <Main>
                    <Routes>
                        <Route path="/" element={userData ? <Chat/> : <Login/>}/>
                        <Route path="/login" element={userData ? <Chat/> : <Login/>}/>
                        <Route path="/register" element={<Register/>}/>
                    </Routes>
                </Main>
            </Layout>
        </AuthContext.Provider>
    );
}

export default App;
