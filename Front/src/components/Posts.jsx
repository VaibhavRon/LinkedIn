import { useMutation,useQueryClient, useQuery } from "@tanstack/react-query";
import { useState,useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import {axiosInstance} from "../lib/axios";
import { Loader,Trash2 ,MessageCircle,ThumbsUp,Share2,MoreVertical,Send} from "lucide-react";
import PostAction from "./PostAction";
import { formatDistanceToNow } from "date-fns"

export default function Posts({post}) {
    const {data:authUser}=useQuery({queryKey:["authUser"]});
  
    
    const [showComments, setShowComments] = useState(false);
    const [comments,setComments]=useState(post.comments || []);
    const [newComment,setNewComment]=useState("");
    const isOwner = authUser._id === post.author._id;
    const isLiked = authUser ? post.likes.includes(authUser._id) : false;

    const queryClient=useQueryClient();
    const {mutate:deletePost,isPending:isDeletingPost}=useMutation({
        mutationFn: async ()=>{
            const res=await axiosInstance.delete(`/posts/delete/${post._id}`);
            return res.data;
        },
        onSuccess:()=>{
            toast.success("Post deleted successfully");
            queryClient.invalidateQueries({queryKey:["posts"]})//fetch post once again
        },
        onError:(error)=>{
            console.log("Error in mutation:", error)
            toast.error("Error while deleting post");
        }
    })

    const{mutate:addComment,isPending: isAddingComment}=useMutation({
        mutationFn: async (newComment)=>{
            const res=await axiosInstance.post(`/posts/${post._id}/comment`,{content:newComment});
            return res.data;
        },
        onSuccess:()=>{
            toast.success("Comment added successfully");
            queryClient.invalidateQueries({queryKey:["posts"]})//fetch post once again
        },
        onError:(error)=>{
            console.log("Error in mutation:", error)
            toast.error("Error while adding comment");
        }})

    const {mutate:deleteComment,isPending:isDeletingComment}=useMutation({
        mutationFn: async (commentId)=>{
            const res=await axiosInstance.delete(`/posts/${post._id}/comment/${commentId}`);
            return res.data;
        },
        onSuccess:()=>{
            toast.success("Comment deleted successfully");
            queryClient.invalidateQueries({queryKey:["posts"]})//fetch post once again
        },
        onError:(error)=>{
            console.log("Error in mutation:", error)
            toast.error("Error while deleting comment");
        }
        })

    const {mutate:addLike,isPending: isLikingPost}=useMutation({

        mutationFn: async ()=>{
           const res= await axiosInstance.post(`/posts/${post._id}/like`);
            return res.data;
        },
        onSuccess:()=>{
            toast.success("Like added successfully");
            queryClient.invalidateQueries({queryKey:["posts"]})//fetch post once again after like
        },        
        onError:(error)=>{
            console.log("Error in mutation:", error)
            toast.error("Error while adding like");
        }}) 

        const handleDeletePost = () => {
            if (!window.confirm("Are you sure you want to delete this post?")) return;
            deletePost();
        };

        const handleLikePost = async() => {
            if(isLikingPost) return;
            addLike();  
        }

        const handleDeleteComment = (commentId) => {
            if (!window.confirm("Are you sure you want to delete this comment?")) return;
            deleteComment(commentId);
        }

        const handleAddComment = async (e) => {
            e.preventDefault();
            if (newComment.trim()) {
                addComment(newComment);
                setNewComment("");
                setComments([
                    ...comments,
                    {
                        content: newComment,
                        user: {
                            _id: authUser._id,
                            name: authUser.name,
                            profilePicture: authUser.profilePicture,
                        },
                        createdAt: new Date(),
                    },
                ]);
            }
        };
        useEffect(() => {
            setComments(post.comments || []);
        }, [post.comments]);
    return(
        <>
        <div className='bg-white rounded-lg shadow mb-4 text-black'>
			<div className='p-4'>
				<div className='flex items-center justify-between mb-4'>
					<div className='flex items-center'>
						<Link to={`/profile/${post?.author?.username}`}>
							<img
								src={post.author.profilePicture || "/avatar.png"}
								alt={post.author.name}
								className='size-10 rounded-full mr-3'
							/>
						</Link>

						<div>
							<Link to={`/profile/${post?.author?.username}`}>
								<h3 className='font-semibold'>{post.author.name}</h3>
							</Link>
							<p className='text-xs '>{post.author.headline}</p>
                            <p className='text-xs'> 
                                    {post.createdAt && new Date(post.createdAt).toString() !== 'Invalid Date' ? 
                                        formatDistanceToNow(new Date(post.createdAt), { addSuffix: true }) 
                                        : ''
                                    }
                            </p>
						</div>
					</div>
					{isOwner && (
						<button onClick={handleDeletePost} className='text-red-500 hover:text-red-700'>
							{isDeletingPost ? <Loader size={18} className="animate-spin" /> : <Trash2 size={18} />}
						</button>
					)}
				</div>
				<p className='mb-4'>{post.content}</p>
				{post.image && <img src={post.image} alt='Post content' className='rounded-lg w-full mb-4' />}

                <div className='flex justify-between'>
					<PostAction
						icon={<ThumbsUp size={18} className={isLiked ? "text-blue-500  fill-blue-300" : ""} />}
						text={`Like (${post.likes.length})`}
						onClick={handleLikePost}
					/>

					<PostAction
						icon={<MessageCircle size={18} />}
						text={`Comment (${comments.length})`}
						onClick={() => setShowComments(!showComments)}
					/>
					<PostAction icon={<Share2 size={18} />} text='Share' />
				</div>

                {showComments && (
				<div className='px-4 pb-4 mt-6'>
					<div className='mb-4 max-h-60 overflow-y-auto'>
						{comments.map((comment) => (
                            <>
							<div key={comment._id} className='mb-2 bg-neutral-200 p-2 rounded flex items-start'>
								<img
									src={comment.user.profilePicture || "/avatar.png"}
									alt={comment.user.name}
									className='w-8 h-8 rounded-full mr-2 flex-shrink-0'
								/>
								<div className='flex-grow'>
									<div className='flex items-center mb-1'>
										<span className='font-semibold mr-2'>{comment.user.name}</span>
                                        <span className='text-xs text-gray-600'>{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
									</div>
                                    <p>{comment.content}</p>
								</div>
                                {authUser?._id === comment.user._id && (
                                    <button
                                        onClick={() => handleDeleteComment(comment._id)}
                                        className="ml-auto text-red-500 hover:text-red-700"
                                        disabled={isDeletingComment}
                                    >
                                        {isDeletingComment ? <Loader size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                    </button>
                                )}
							</div>
                            </>
						))}
					</div>

					<form onSubmit={handleAddComment} className='flex items-center'>
						<input
							type='text'
							value={newComment}
							onChange={(e) => setNewComment(e.target.value)}
							placeholder='Add a comment...'
							className='flex-grow p-2 rounded-l-full bg-neutral-200 focus:outline-none focus:ring-2 focus:ring-primary'
						/>

						<button
							type='submit'
							className='bg-blue-500 text-white p-2 rounded-r-full hover:bg-blue-600 transition duration-300 py-2.5 '
							disabled={isAddingComment}
						>
							{isAddingComment ? <Loader size={18} className='animate-spin' /> : <Send size={18} />}
						</button>
					</form>
				</div>
			)}
            </div>
        </div>
        </>
    )
}
