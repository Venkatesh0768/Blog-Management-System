import React from "react";
import CreatePostForm from "@/components/blog/CreatePostForm";

export default function NewPostPage() {
  return (
    <div className="w-full min-h-full bg-white">
      {/* Narrow editorial column — identical to Medium's ~680px reading width */}
      <div
        className="mx-auto px-6 sm:px-10 py-14 sm:py-20"
        style={{ maxWidth: "740px" }}
      >
        <CreatePostForm />
      </div>
    </div>
  );
}