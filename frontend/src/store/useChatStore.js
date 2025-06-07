import { create } from 'zustand';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';
import { useAuthStore } from './useAuthstore';


export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUserLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,

  getUser: async () => {
    set({ isUserLoading: true });
    try {
      const response = await axiosInstance.get('/message/users');
      const users = Array.isArray(response.data) ? response.data : [];
      set({ users, isUserLoading: false });
    } catch (error) {
      console.error('Error fetching users:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch users';
      toast.error(errorMessage);
      set({ users: [], isUserLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const response = await axiosInstance.get(`/message/${userId}`);
      
      // Handle different possible response structures
      let messages = [];
      if (Array.isArray(response.data)) {
        // API returns array directly
        messages = response.data;
      } else if (response.data && Array.isArray(response.data.messages)) {
        // API returns {messages: [...]}
        messages = response.data.messages;
      } else {
        console.warn('Unexpected API response structure:', response.data);
      }
      
      set({ messages, isMessagesLoading: false });
    } catch (error) {
      console.error('Error fetching messages:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch messages';
      toast.error(errorMessage);
      set({ messages: [], isMessagesLoading: false });
    }
  },

  setSelectedUser: (user) => {
    set({ selectedUser: user });
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();

    if (!selectedUser) {
      toast.error('No user selected');
      return;
    }

    set({ isSendingMessage: true });

    try {
      console.log('Sending message:', messageData);
      // This was the main issue - missing await!
      const response = await axiosInstance.post(`/message/send/${selectedUser._id}`, messageData);
      console.log('Send message response:', response.data);
      
      // Add the new message to the existing messages
      set({ 
        messages: [...messages, response.data],
        isSendingMessage: false 
      });
      
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send message';
      toast.error(errorMessage);
      set({ isSendingMessage: false });
      throw error;
    }
  },


  

 subscribeToMessages: () => {
  const socket = useAuthStore.getState().socket;
  const { selectedUser } = get();
  const authUser = useAuthStore.getState().authUser;

  if (!socket || !selectedUser || !authUser) {
    return console.warn("Socket, selectedUser, or authUser not available");
  }

  socket.on("newMessage", (newMessage) => {
    const isRelevant =
      (newMessage.senderId === selectedUser._id && newMessage.receiverId === authUser._id) ||
      (newMessage.receiverId === selectedUser._id && newMessage.senderId === authUser._id);

    if (!isRelevant) return;

    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
  });
},

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },



}));