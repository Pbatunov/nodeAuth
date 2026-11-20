import './App.css';
import {Route, Routes} from 'react-router-dom';
import {Layout} from './components/Layout';
import {Header} from './components/Header';
import {Login} from './pages/Login';
import {Chat} from './pages/Chat';
import {Register} from './pages/Register';
import {Main} from './components/Main';
import {useState, useEffect} from 'react';
import {AuthContext} from './context/AuthContext';
import {ChatContextProvider} from './context/ChatContext';
import {getRequest} from './utils/get-request';

const App = () => {
    const [userData, setUserData] = useState(null);
    const [isAuthChecked, setIsAuthChecked] = useState(false);

    // Сессия хранится в httpOnly-cookie, поэтому спрашиваем сервер, кто вошёл.
    useEffect(() => {
        getRequest({url: 'users/me'}).then((data) => {
            setUserData(data?.id ? data : null);
            setIsAuthChecked(true);
        });
    }, []);

    if (!isAuthChecked) {
        return null;
    }

    return (
        <AuthContext.Provider value={{
            userData,
            setUserData,
        }}>
            <ChatContextProvider user={userData}>
                <Layout>
                    <Header/>
                    <Main>
                        <Routes>
                            <Route path='/' element={userData ? <Chat/> : <Login/>}/>
                            <Route path='/login' element={userData ? <Chat/> : <Login/>}/>
                            <Route path='/chat/:chatId' element={userData ? <Chat/> : <Login/>}/>
                            <Route path='/register' element={<Register/>}/>
                        </Routes>
                    </Main>
                </Layout>
            </ChatContextProvider>
        </AuthContext.Provider>
    );
};

export default App;
