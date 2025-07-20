import './styles.scss'

export const MessageBox = () => {
    return (
        <div className="message-box">
        <div className="message-box__list">
            <div className="message-box__message-item">Привет!</div>
            <div className="message-box__message-item rigth">Привет!</div>
            <div className="message-box__message-item">Привет!</div>
            <div className="message-box__message-item">Привет!</div>
        </div>
            <div className="message-box__input-wrapper">
                <input type="text" className="message-box__input"/>
            </div>
        </div>
    )
}
