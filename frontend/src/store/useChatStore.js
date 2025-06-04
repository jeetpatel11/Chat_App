import { create } from 'zustand';
import toast from 'react-hot-toast';
import { axiosInstance } from '../lib/axios';

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUserLoading: false,
  isMessagesLoading: false,
  isSendingMessage: false,
  isLoading: false,

  getUser: async () => {
    set({ isUserLoading: true });
    try {
      const response = await axiosInstance.get('/message/users');
      console.log('Full API response:', response); // Log full response for debugging
      // Use response.data directly since it’s an array
      const users = Array.isArray(response.data) ? response.data : [];
      console.log('Processed users:', users); // Log processed users
      set({ users, isUserLoading: false });
    } catch (error) {
      console.error('Error fetching users:', error); // Log full error
      const errorMessage = error.response?.data?.message || 'Failed to fetch users';
      toast.error(errorMessage);
      set({ users: [], isUserLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const response = await axiosInstance.get(`/message/${userId}`);
      console.log('Messages response:', response.data); // Log for debugging
      const messages = Array.isArray(response.data.messages) ? response.data.messages : [];
      set({ messages, isMessagesLoading: false });
    } catch (error) {
      console.error('Error fetching messages:', error);
      const errorMessage = error.response?.data?.message || 'Failed to fetch messages';
      toast.error(errorMessage);
      set({ messages: [], isMessagesLoading: false });
    }
  },
}));