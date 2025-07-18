"use client"

import { useUser } from '@clerk/nextjs'; 
import { TextInput, Select, FileInput, Button, Alert } from 'flowbite-react';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });
// https://dev.to/a7u/reactquill-with-nextjs-478b
import 'react-quill-new/dist/quill.snow.css';

// Cloudinary upload function (keep this above the component)
async function uploadImageToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'unsigned_preset'); // use your actual preset name

  const response = await fetch(
    'https://api.cloudinary.com/v1_1/dbuwqblex/image/upload',
    {
      method: 'POST',
      body: formData,
    }
  );
  const data = await response.json();
  return data.secure_url; // This is the image URL
}

export default function CreatePostPage() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [file, setFile] = useState(null);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [imageUploadError, setImageUploadError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    image: "",
    content: ""
  });
  const [publishError, setPublishError] = useState(null);
  const router = useRouter();
  console.log(formData);
  
  // Move handleUploadImage inside the component
  const handleUploadImage = async () => {
    if (!file) {
      setImageUploadError("Please select a file first.");
      return;
    }
    setImageUploadProgress(30); // Optional: show progress
    setImageUploadError("");

    try {
      const imageUrl = await uploadImageToCloudinary(file);
      setFormData({ ...formData, image: imageUrl });
      setImageUploadProgress(100);
    } catch (err) {
      setImageUploadError("Image upload failed.");
      setImageUploadProgress(0);
    }
  };

  // Move handleSubmit inside the component
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/post/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userMongoId: user.publicMetadata.userMongoId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPublishError(data.message);
        return;
      }
      if (res.ok) {
        setPublishError(null);
        router.push(`/post/${data.slug}`);
      }
    } catch (error) {
      setPublishError('Something went wrong');
    }
  };

  // Show nothing until user data is fully loaded
  if (!isLoaded) {
    return null;
  }

  // If signed in and isAdmin flag is true
  if (isSignedIn && user.publicMetadata.isAdmin) {
    return (
      <div className='p-3 max-w-3xl mx-auto min-h-screen'>
        <h1 className='text-center text-3xl my-7 font-semibold'>
          Create a post
        </h1>
        <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
          <div className='flex flex-col gap-4 sm:flex-row justify-between'>
            <TextInput
              type='text'
              placeholder='Title'
              required
              id='title'
              className='flex-1'
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
            <Select
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              <option value='uncategorized'>Select a category</option>
              <option value='javascript'>JavaScript</option>
              <option value='reactjs'>React.js</option>
              <option value='nextjs'>Next.js</option>
            </Select>
          </div>
          <div className='flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3'>
            <FileInput
              type='file'
              accept='image/*'
              onChange={e => setFile(e.target.files[0])}
            />
            <Button
              type='button'
              gradientDuoTone='purpleToBlue'
              size='sm'
              outline
              onClick={handleUploadImage}
              disabled={imageUploadProgress}
            >
              {imageUploadProgress ? (
                <div className='w-16 h-16'>
                  <CircularProgressbar
                    value={imageUploadProgress}
                    text={`${imageUploadProgress || 0}%`}
                  />
                </div>
              ) : (
                'Upload Image'
              )}
            </Button>
          </div>

          {imageUploadError && (
            <Alert color='failure'>{imageUploadError}</Alert>
          )}
          {formData.image && (
            <img
              src={formData.image}
              alt='upload'
              className='w-full h-72 object-cover'
            />
          )}

          <ReactQuill
            theme='snow'
            placeholder='Write something...'
            className='h-72 mb-12'
            required
            onChange={(value) => {
              setFormData({ ...formData, content: value });
            }}
          />
          <Button type='submit' gradientDuoTone='purpleToPink'>
            Publish
          </Button>
        </form>
      </div>
    );
  } else {
    return (
      <h1 className='text-center text-3xl my-7 font-semibold'>
        You are not authorized to view this page
      </h1>
    );
  }
}