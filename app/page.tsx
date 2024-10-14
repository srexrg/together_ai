"use client";

import Image from "next/image";
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Download, Loader2, Share2, ImagePlus } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#7986AC" offset="20%" />
      <stop stop-color="#68769e" offset="50%" />
      <stop stop-color="#7986AC" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#7986AC" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === "undefined"
    ? Buffer.from(str).toString("base64")
    : window.btoa(str);

const dataUrl = `data:image/svg+xml;base64,${toBase64(shimmer(1000, 1000))}`;

export default function Component() {
  const [prompt, setPrompt] = useState("");
  const [generatedImageUrl, setGeneratedImageUrl] = useState("");
  const generateImage = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) {
        throw new Error("Failed to generate image");
      }
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedImageUrl(data.url);
    },
    onError: (error:any) => {
      toast.error("Failed to generate image. Please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateImage.mutate(prompt);
  };

  const handleDownload = () => {
    if (generatedImageUrl) {
      const filename = `${prompt.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-${Date.now()}.png`;
      
      window.open(generatedImageUrl, '_blank');

      const link = document.createElement('a');
      link.href = generatedImageUrl;
      link.download = filename;
      document.body.appendChild(link);
      document.body.removeChild(link);
    }
  };

  const handleShare = () => {
    if (generatedImageUrl) {
      navigator.clipboard
        .writeText(generatedImageUrl)
        .then(() => {
          toast.info("Image URL copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy: ", err);
          toast.error("Failed to copy URL. Please try again.");
        });
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-gray-800 shadow-2xl rounded-xl overflow-hidden border border-gray-700">
        <CardHeader className="bg-gradient-to-r from-gray-800 to-gray-700 text-gray-100 p-8">
          <CardTitle className="text-3xl font-bold text-center">
            AI Image Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <Input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your image prompt..."
                className="pr-10 bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-lg"
              />
              <ImagePlus
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-lg"
              disabled={generateImage.isPending}
            >
              {generateImage.isPending ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <ImagePlus className="mr-2" size={20} />
              )}
              {generateImage.isPending ? "Generating..." : "Generate Image"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center p-8">
          {generatedImageUrl ? (
            <div className="mt-6 relative group">
              <Image
                src={generatedImageUrl}
                alt="Generated image"
                width={512}
                height={512}
                className="rounded-lg shadow-xl transition-all duration-300 group-hover:shadow-2xl"
                placeholder="blur"
                blurDataURL={dataUrl}
              />
              <div className="absolute inset-0 bg-gray-900 bg-opacity-75 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                <Button
                  onClick={handleDownload}
                  className="mr-4 bg-blue-600 text-white hover:bg-blue-700"
                  variant="secondary"
                >
                  <Download className="mr-2" size={20} />
                  Download
                </Button>
                <Button
                  onClick={handleShare}
                  className="bg-gray-700 text-white hover:bg-gray-600"
                  variant="secondary"
                >
                  <Share2 className="mr-2" size={20} />
                  Share
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 mt-6 p-16 border-2 border-dashed border-gray-700 rounded-lg">
              <ImagePlus size={48} className="mx-auto mb-4 text-gray-500" />
              <p className="text-lg">Enter a prompt and click Generate to create an image</p>
            </div>
          )}
        </CardFooter>
      </Card>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        theme="dark"
      />
    </div>
  );
}
