import { useState } from "react";
import { useAuthStore } from "../store/useAuthstore";
import { Camera, Mail, User } from "lucide-react";


const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      console.log("Base64 image:", base64Image ? `${base64Image.substring(0, 50)}... (length: ${base64Image.length})` : null);
      setSelectedImg(base64Image);
      try {
        await updateProfile({ profilepic: base64Image });
      } catch (error) {
        console.error("Profile update failed:", error);
      }
    };
  };

  return (
    <div className='h-screen pt-20'>
      <div className='max-w-2xl mx-auto p-4 py-8'>
        <div className='bg-base-300 p-6 rounded-xl space-y-8'>
          <div className='text-center'>
            <h1 className='text-2xl font-bold'>Profile</h1>
            <p className='text-base-content/60'>Your Profile Information</p>
          </div>

          <div className='flex flex-col items-center gap-4'>
            <div className='relative'>
              <img 
                src={authUser?.profilepic || '/avatar.png'}
                alt="Profile"
                className='size-32 rounded-full object-cover border-4'
              />
              <label 
                htmlFor="file-input" 
                className='absolute bottom-4 right-2 bg-base-content hover:scale-105 rounded-full p-2 cursor-pointer'
              >
                <Camera className='w-5 h-5 text-base-200' />
                <input 
                  type="file" 
                  id="file-input" 
                  className='hidden' 
                  accept='image/*' 
                  onChange={handleImageUpload} 
                  disabled={isUpdatingProfile} 
                />
              </label>
              <p className='text-sm text-base-content/60'>
                {isUpdatingProfile ? 'Updating...' : 'Change Profile Image'}
              </p>
            </div>

            <div className='space-y-6'>
              <div className='space-y-1.5'>
                <div className='text-sm text-zinc-400 flex items-start gap-2'>
                  <User className='w-4 h-4' />
                  <span>Full Name</span>
                </div>
                <p className='px-4 py-2.5 bg-base-200 rounded-lg border'>
                  {authUser?.fullname}
                </p>
              </div>

              <div className='space-y-1.5'>
                <div className='text-sm text-zinc-400 flex items-start gap-2'>
                  <Mail className='w-4 h-4' />
                  <span>Email Address</span>
                </div>
                <p className='px-4 py-2.5 bg-base-200 rounded-lg border'>
                  {authUser?.email}
                </p>
              </div>
            </div>

            <div className='mt-6 bg-base-300 rounded-xl p-6'>
              <h2 className='text-lg font-medium mb-4'>Account Information</h2>
              <div className='space-y-3 text-sm'>
                <div className='flex items-center justify-between py-2 border-b border-zinc-700'>
                  <span>Member since</span>
                  <span>{authUser?.createdAt?.split("T")[0]}</span>
                </div>
                <div className='flex items-center justify-between py-2'>
                  <span>Account Status</span>
                  <span className='text-green-500'>Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;