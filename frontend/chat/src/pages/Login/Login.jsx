import './style.scss'
import {useContext, useState} from "react";
import {AuthContext} from "../../context/AuthContext";
import {postRequest} from "../../utils/post-request";

export const Login = () => {
    const {setUserData} = useContext(AuthContext)
    const [formData, setFormData] = useState({
        login: '',
        password: '',
    })

    const [message, setMessage] = useState(null)
    const [isSuccess, setIsSuccess] = useState(null)

    return (
        <div className="login">
            <div className="login-form__wrapper">
                <form className="login-form" onSubmit={async (e) => {
                    e.preventDefault()

                    const data = await postRequest({
                        url: 'users/auth',
                        data: formData,
                    })

                    if (data?.login) {
                        localStorage.setItem('user', JSON.stringify(data))
                        setUserData(data)
                    }

                    if (data?.message) {
                        setMessage(data.message);
                    }

                    if (data.success) {
                        setIsSuccess(data.success);
                    }
                }}>
                    <label htmlFor="login" className="login-form__label">
                        <input
                            className="login-form__input"
                            type="text"
                            name="login"
                            id="login"
                            placeholder='Введите логин'
                            onChange={(e) => {
                                setFormData({...formData, login: e.target.value})
                            }}
                        />
                    </label>

                    <label htmlFor="password" className="login-form__label">
                        <input
                            className="login-form__input"
                            type="text"
                            name="password"
                            id="password"
                            placeholder="Введите пароль"
                            onChange={(e) => {
                                setFormData({...formData, password: e.target.value})
                            }}
                        />
                    </label>

                    <button className="login-form__submit">Войти</button>
                    {message &&
                        <div className={`login-form__message ${isSuccess && 'success'}`}>
                            {message}
                        </div>}

                </form>
            </div>
        </div>
    );
}
