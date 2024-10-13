"use client"
import Image from 'next/image';
import React, { useState } from 'react'
import { useMutation } from 'react-query';
import { Download, Loader2, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const [prompt, setPrompt] = useState("");
  const router = useRouter();

  const { mutate, data, isLoading } = useMutation({
    mutationFn: async (prompt: string) => {
      let res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });
      return res.json();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      mutate(prompt);
    }
  };

  const handleDownload = () => {
    if (data && data.url) {
      const link = document.createElement("a");
      link.href = data.url;
      link.download = `${prompt.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = () => {
    if (data && data.url) {
      navigator.clipboard.writeText(data.url).then(() => {
        alert('Image URL copied to clipboard!');
      }).catch((err) => {
        console.error('Failed to copy: ', err);
        alert('Failed to copy URL. Please try again.');
      });
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6 text-center">Image Generator</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your image prompt..."
          className="w-full p-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="mt-2 w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="animate-spin mx-auto" />
          ) : (
            'Generate Image'
          )}
        </button>
      </form>
      {data ? (
        <div className="mt-6 relative">
          <h2 className="text-xl font-semibold mb-2">Generated Image:</h2>
          <div className="relative group">
            <Image
              src={data.url}
              alt="Generated image"
              width={1024}
              height={768}
              className="w-full rounded-md shadow-lg"
            />
            <div className="absolute top-2 left-2 flex space-x-2">
              <button
                onClick={handleDownload}
                className="p-2 bg-black bg-opacity-50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                title="Download Image"
              >
                <Download size={24} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 bg-black bg-opacity-50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                title="Share Image URL"
              >
                <Share2 size={24} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-6">
          Enter a prompt and click Generate to create an image
        </p>
      )}
    </div>
  );
}
