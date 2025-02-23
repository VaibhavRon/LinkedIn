import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import {toast} from "react-hot-toast"

const SignUpForm = () => {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");

	const queryClient = useQueryClient();

    const{ mutate: signUpMutation, isLoading }=useMutation({
        mutationFn:async(data)=>{
            const response=await axiosInstance.post("/auth/signup",data);
            return response.data
        },
        onSuccess:()=>{
          toast.success("Registered Successfully")
		  queryClient.invalidateQueries({queryKey:["authUser"]})
        },
        onError:(error)=>{
            toast.error("Error while signing In")
        }
    })
	const handleSignUp = (e) => {
		e.preventDefault();
		signUpMutation({ name, username, email, password });
	};



	return (
		<form onSubmit={handleSignUp} className='flex flex-col gap-4'>
			<input
				type='text'
				placeholder='Full name'
				value={name}
				onChange={(e) => setName(e.target.value)}
				className='input input-bordered w-full bg-slate-200 text-black'
				required
			/>
			<input
				type='text'
				placeholder='Username'
				value={username}
				onChange={(e) => setUsername(e.target.value)}
				className='input input-bordered w-full bg-slate-200  text-black'
				required
			/>
			<input
				type='email'
				placeholder='Email'
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				className='input input-bordered w-full bg-slate-200  text-black'
				required
			/>
			<input
				type='password'
				placeholder='Password (6+ characters)'
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				className='input input-bordered w-full bg-slate-200  text-black'
				required
			/>
			

			<button type='submit' className='py-2 px-4 bg-blue-500 rounded w-full text-white'>
			{isLoading ? <Loader className='size-5 animate-spin' /> : "Agree & Join"}
			</button>
		</form>
	);
};
export default SignUpForm;