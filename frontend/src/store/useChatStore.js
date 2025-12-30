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
      
      let messages = [];
      if (Array.isArray(response.data)) {
        messages = response.data;
      } else if (response.data && Array.isArray(response.data.messages)) {
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
      const response = await axiosInstance.post(`/message/send/${selectedUser._id}`, messageData);
      console.log('Send message response:', response.data);

      // Check if the message already exists to prevent duplicates
      const newMessage = response.data;
      const messageExists = messages.some((msg) => msg._id === newMessage._id);
      if (!messageExists) {
        set({ 
          messages: [...messages, newMessage],
          isSendingMessage: false 
        });
      } else {
        console.warn('Duplicate message detected on frontend:', newMessage);
        set({ isSendingMessage: false });
      }
      
      return newMessage;
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

    socket.off("newMessage"); // Remove previous listeners to prevent duplicates
    socket.on("newMessage", (newMessage) => {
      console.log("Received newMessage:", newMessage);
      const isRelevant =
        (newMessage.senderId === selectedUser._id && newMessage.receiverId === authUser._id) ||
        (newMessage.receiverId === selectedUser._id && newMessage.senderId === authUser._id);

      if (!isRelevant) return;

      set((state) => {
        // Prevent duplicates by checking _id
        const messageExists = state.messages.some((msg) => msg._id === newMessage._id);
        if (messageExists) {
          console.warn('Duplicate message received via socket:', newMessage);
          return state;
        }
        return {
          messages: [...state.messages, newMessage],
        };
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
    }
  },
}));
