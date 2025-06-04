// src/components/ChatContainer.jsx
import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import { useAuthStore } from "../store/useAuthstore";
import MessageSkeleton from "./skelotons/MessageSkeleton";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser?._id, getMessages]);

  if(isMessagesLoading) return(
  <div className="flex-1 items-center justify-center text-zinc-500">
    <ChatHeader/>

    <MessageSkeleton/>  

    <MessageInput/>
  </div>
  )

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-500">
        Select a user to start chatting
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      {isMessagesLoading ? (
        <div className="p-4 text-center text-zinc-500">Loading...</div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4">
          {messages
  .filter((msg) => msg && msg.senderId && msg.text)
  .map((msg, i) => (
    <div key={i} className="mb-2 flex justify-start">
      <div
        className={`p-2 rounded-md max-w-xs break-words ${
          msg.senderId === authUser._id
            ? "bg-blue-200 ml-auto"
            : "bg-gray-200 mr-auto"
        }`}
      >
        {msg.text}
      </div>
    </div>
))}

          <div ref={messageEndRef} />
        </div>
      )}

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
