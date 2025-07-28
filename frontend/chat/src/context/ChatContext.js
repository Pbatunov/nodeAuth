import {createContext, useEffect, useState} from "react";
import {getRequest} from "../utils/get-request";

export const ChatContext = createContext();

export const ChatContextProvider = ({children, user}) => {
    const [chatsList, setChatsList] = useState(null);
    const [messagesList, setMessagesList] = useState(null);
    const [messagesWarning, setMessagesWarning] = useState(null);
    const [lastChatMessage, setLastChatMessage] = useState(null)

    useEffect(() => {
            const getChatsList = async () => {
                const {id: userId} = user;
                const chatsList = await getRequest({url: `chats/${userId}`});

                setChatsList(chatsList)

                if (!messagesList?.length) {
                    return;
                }
            }

            if (user) {
                getChatsList()
            }
        }, [user]
    )

    const getChatMessages = async ({id}) => {
        const chatMessagesList = await getRequest({url: `messages/${id}`});
        setMessagesList(chatMessagesList)
        setMessagesWarning(chatMessagesList?.responseToFront?.message);
    }

    return (
        <ChatContext.Provider value={{
            chatsList,
            setChatsList,
            getChatMessages,
            messagesList,
            messagesWarning,
            setMessagesList,
            setMessagesWarning
        }}>
            {children}
        </ChatContext.Provider>
    )
}
