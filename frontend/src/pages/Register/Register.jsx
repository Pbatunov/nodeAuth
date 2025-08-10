import './style.scss';
import {postRequest} from '../../utils/post-request';
import {useState} from 'react';

export const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        login: '',
        password: '',
    });

    const [message, setMessage] = useState(null);
    const [isSuccess, setIsSuccess] = useState(null);

    return (
        <div className='register'>
            <div className='register-form__wrapper'>
                <form className='register-form' onSubmit={async (e) => {
                    e.preventDefault();

                    const data = await postRequest({
                        url: 'users/registration',
                        data: formData,
                    });

                    if (data?.message) {
                        setMessage(data.message);
                    }

                    if (data.success) {
                        setIsSuccess(data.success);
                    }
                }}>
                    <label htmlFor='name' className='register-form__label'>
                        <input
                            className='register-form__input'
                            type='text'
                            name='name'
                            id='name'
                            placeholder='Введите имя'
                            onChange={(e) => {
                                setFormData({...formData, name: e.target.value});
                            }}
                        />
                    </label>

                    <label htmlFor='login' className='register-form__label'>
                        <input
                            className='register-form__input'
                            type='text'
                            name='login'
                            id='login'
                            placeholder='Введите логин'
                            onChange={(e) => {
                                setFormData({...formData, login: e.target.value});
                            }}
                        />
                    </label>

                    <label htmlFor='password' className='register-form__label'>
                        <input
                            className='register-form__input'
                            type='text'
                            name='password'
                            id='password'
                            placeholder='Введите пароль'
                            onChange={(e) => {
                                setFormData({...formData, password: e.target.value});
                            }}
                        />
                    </label>

                    <button className='register-form__submit'>Зарегистрироваться</button>
                    {message &&
                        <div className={`register-form__message ${isSuccess && 'success'}`}>
                            {message}
                        </div>}
                </form>
            </div>
        </div>
    );
};
