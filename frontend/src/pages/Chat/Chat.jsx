import './style.scss';
import {ChatsList} from '../../components/ChatsList';
import {MessageBox} from '../../components/MessagesBox';

export const Chat = () => {
    return (
        <div className='chat-page'>
            <ChatsList/>
            <MessageBox/>
        </div>
    );
};
