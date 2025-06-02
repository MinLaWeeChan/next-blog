import PostCard from './PostCard';

export default function RecentPosts({limit}) {
  return (
    <div className='flex flex-col justify-center items-center mb-5'>
      <h1 className='text-xl mt-5'>Recent articles</h1>
      <div className='flex flex-wrap gap-5 mt-5 justify-center'>
        <div className="text-gray-500">No posts available</div>
      </div>
    </div>
  );
}