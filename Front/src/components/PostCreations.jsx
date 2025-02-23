import { useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { Image, Loader } from "lucide-react";

export default function PostCreations({user}) {
    const [content,setContent]=useState("");
    const [image,setImage]=useState(null);
    const [previewImage,setPreviewImage]=useState(null);

    const queryClient=useQueryClient();

    const {mutate:createPost,isPending}=useMutation({
        mutationFn: async (data)=>{
            console.log(data)
            const res = await axiosInstance.post("/posts/create", data, {
				headers: { "Content-Type": "application/json" },
			});
			return res.data;
        },
        onSuccess:()=>{
            resetForm();
            toast.success("Post created successfully");
            queryClient.invalidateQueries({queryKey:["posts"]})//fetch post once again
        },
        onError:(error)=>{
            console.log("Error in mutation:", error)
            toast.error("Error while creating post");
        }
    })

    const handlePostCreation=async(e)=>{
        try{
            const data={content}
            if(image)data.image=await readFileAsDataURL(image);
            createPost(data);
        }catch(err)
        {
            toast.error("Error while creating post");
        }
    }

    const handleImageChange = (e) => {
		const file = e.target.files[0];
		setImage(file);
		if (file) {
			readFileAsDataURL(file).then(setPreviewImage);//base 64 string format
		} else {
            setPreviewImage(null);
		}
	};

    const readFileAsDataURL = (file) => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result);
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	};

    const resetForm=()=>{
        setContent("");
        setImage(null);
        setPreviewImage(null);
    }

    return (
        <>
        <div className='bg-white rounded-lg shadow mb-4 p-4'>
        <div className='flex space-x-3'>
            <img src={user.profilePicture || "/avatar.png"} alt={user.name} className='size-12 rounded-full' />
            <textarea
                placeholder="What's on your mind?"
                className='w-full p-3 rounded-lg bg-neutral-200 text-black focus:outline-none resize-none transition-colors duration-200 min-h-[100px]'
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
        </div>

        {previewImage && (
            <div className='mt-4'>
                <img src={previewImage} alt='Selected' className='w-full h-auto rounded-lg' />
            </div>
        )}

        <div className='flex justify-between items-center mt-4'>
            <div className='flex space-x-4'>
                <label className='flex items-center transition-colors duration-200 cursor-pointer'>
                    <Image size={20} className='mr-2' />
                    <span>Photo</span>
                    <input type='file' accept='image/*' className='hidden' onChange={handleImageChange} />
                </label>
            </div>

            <button
                className='bg-blue-500 text-white rounded-lg px-4 py-2 transition-colors duration-200'
                onClick={handlePostCreation}
                disabled={isPending}
            >
                {isPending ? <Loader className='size-5 animate-spin' /> : "Share"}
            </button>
        </div>
    </div>
    </>
    )
}