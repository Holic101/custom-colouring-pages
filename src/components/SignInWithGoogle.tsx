"use client";

import { useAuth } from '@/lib/contexts/AuthContext';
import Image from 'next/image';

export default function SignInWithGoogle() {
  const { signInWithGoogle } = useAuth();

  return (
    <button
      onClick={signInWithGoogle}
      className="flex items-center justify-center bg-white text-gray-700 font-semibold py-2 px-4 rounded-full border border-gray-300 hover:bg-gray-100 transition duration-300 ease-in-out"
    >
      <Image src="https://authjs.dev/img/providers/google.svg" alt="Google logo" className="w-5 h-5 mr-2" width={20} height={20} />
      Sign in with Google
    </button>
  );
}
