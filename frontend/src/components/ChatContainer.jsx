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
    subscribeToMessages,
    setSelectedUser,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  // Fetch messages when user is selected
  useEffect(() => {
    if (selectedUser?._id) {
      getMessages(selectedUser._id);
      subscribeToMessages();

      return () => {
        console.log('Unsubscribing from messages for user:', selectedUser._id);
        unsubscribeFromMessages();
      }
    }
  }, [selectedUser?._id, getMessages,subscribeToMessages, unsubscribeFromMessages]);




  // Auto scroll to bottom when messages change
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Debug logging
 

  // Show user selection prompt
  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-base-100 ">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-xl font-semibold text-base-content mb-2">
            Welcome to Chat
          </h2>
          <p className="text-base-content/70">
            Select a user from the sidebar to start chatting
          </p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col bg-base-100">
        <ChatHeader />
        <div className="flex-1 bg-base-200">
          <MessageSkeleton />
        </div>
        <MessageInput />
      </div>
    );
  }

  // Main chat interface
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-base-100">
      {/* Chat Header */}
      <ChatHeader />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 mr-7 space-y-4 bg-base-200 custom-scrollbar">

        {messages && messages.length > 0 ? (
          messages.map((msg) => {
            // Skip invalid messages
            if (!msg || !msg._id) {
              console.warn('Invalid message object:', msg);
              return null;
            }

            const isSender = msg.senderId === authUser?._id;
            const avatar = isSender
              ? authUser?.profilepic || "/avatar.png"
              : selectedUser?.profilepic || "/avatar.png";

            return (
              <div 
                key={msg._id} 
                className={`chat ${isSender ? "chat-end" : "chat-start"}`}
              >
                {/* User Avatar */}
                <div className="chat-image avatar">
                  <div className="w-10 h-10 rounded-full border-2 border-base-300 overflow-hidden">
                    <img 
                      src={avatar} 
                      alt="User avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Message Bubble */}
                <div className={`chat-bubble max-w-xs lg:max-w-md ${
                  isSender 
                    ? 'chat-bubble-primary text-primary-content' 
                    : 'bg-base-300 text-base-content'
                }`}>
                  {/* Text Message */}
                  {msg.text && (
                    <p className="break-words whitespace-pre-wrap">
                      {msg.text}
                    </p>
                  )}
                  
                  {/* Image Message */}
                  {msg.image && (
                    <div className="mt-2 ">
                      <img
                        src={msg.image}
                        alt="Shared image"
                        className="max-w-full rounded-lg border border-base-300 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(msg.image, '_blank')}
                      />
                    </div>
                  )}
                </div>

                {/* Message Timestamp */}
                <div className="chat-footer opacity-50 text-xs text-base-content mt-1">
                  {msg.createdAt ? (
                    <time dateTime={msg.createdAt}>
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </time>
                  ) : (
                    <span>No timestamp</span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          // Empty State
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="text-6xl mb-4">🗨️</div>
              <h3 className="text-lg font-semibold text-base-content mb-2">
                No messages yet
              </h3>
              <p className="text-sm text-base-content/60">
                Be the first to send a message to {selectedUser?.fullName || selectedUser?.username || 'this user'}!
              </p>
            </div>
          </div>
        )}

        {/* Auto-scroll anchor */}
        <div ref={messageEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput />
    </div>
  );
};

export default ChatContainer;