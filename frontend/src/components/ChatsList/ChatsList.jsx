import './styles.scss';
import {ChatListItem} from '../ChatListItem';
import {useContext, useState} from 'react';
import {ChatContext} from '../../context/ChatContext';

export const ChatsList = () => {
    const [selectedIndex, setSelectedIndex] = useState(null);

    const handleClick = ({index, chat}) => {
        if (selectedIndex === index) {
            return;
        }

        setSelectedIndex(index);
        getChatMessages({chat});
    };

    const {chatsList, getChatMessages} = useContext(ChatContext);

    if (!chatsList?.length) {
        return null;
    }

    return (
        <div className='chats-list' >
            {chatsList.map((chat, index) => {
                return (
                    <ChatListItem
                        key={chat.id}
                        chat={chat}
                        index={index}
                        selectedIndex={selectedIndex}
                        handleClick={handleClick}
                    />
                );
            }
            )}
        </div>
    );
};
