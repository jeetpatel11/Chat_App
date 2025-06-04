import { useState } from "react";
import { useAuthStore } from "../store/useAuthstore";
import { Camera, Mail, User } from "lucide-react";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  console.log("authUser:", authUser);
  console.log("createdAt:", authUser?.createdAt);


  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      console.log(
        "Base64 image:",
        base64Image ? `${base64Image.substring(0, 50)}... (length: ${base64Image.length})` : null
      );
      setSelectedImg(base64Image);
      try {
        await updateProfile({ profilepic: base64Image });
      } catch (error) {
        console.error("Profile update failed:", error);
      }
    };
  };

  return (
    <div className="h-screen pt-20 bg-base-100">
      <div className="max-w-2xl mx-auto p-6 py-10">
        <div className="bg-base-300 p-8 rounded-xl space-y-10">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-1">Profile</h1>
            <p className="text-base-content/60 text-sm">Your Profile Information</p>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <img
                src={authUser?.profilepic || "/avatar.png"}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-base-content"
              />
              <label
                htmlFor="file-input"
                className="absolute bottom-3 right-3 bg-base-content hover:bg-base-content/80 rounded-full p-3 cursor-pointer shadow-lg flex items-center justify-center transition"
                title="Change Profile Image"
              >
                <Camera className="w-6 h-6 text-base-200" />
                <input
                  type="file"
                  id="file-input"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
              <p className="mt-2 text-sm text-base-content/60 text-center">
                {isUpdatingProfile ? "Updating..." : "Change Profile Image"}
              </p>
            </div>

            <div className="w-full space-y-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-base-content/60 text-sm font-semibold">
                  <User className="w-5 h-5" />
                  <span>Full Name</span>
                </div>
                <p className="px-5 py-3 bg-base-200 rounded-lg border border-base-content/30 font-medium">
                  {authUser?.fullname}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-base-content/60 text-sm font-semibold">
                  <Mail className="w-5 h-5" />
                  <span>Email Address</span>
                </div>
                <p className="px-5 py-3 bg-base-200 rounded-lg border border-base-content/30 font-medium break-words">
                  {authUser?.email}
                </p>
              </div>
            </div>

            <div className="mt-10 w-full bg-base-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-5 text-base-content">Account Information</h2>
              <div className="space-y-4 text-sm text-base-content/70">
                <div className="flex items-center justify-between border-b border-base-content/30 pb-2">
                  <span>Member since</span>
                  <span>
                    {authUser?.createdAt
                    ? new Date(authUser.createdAt).toLocaleDateString()
                    : "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span>Account Status</span>
                  <span className="text-success font-semibold">Active</span>
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
