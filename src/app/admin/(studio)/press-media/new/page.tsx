import PostForm from "@/components/studio/PostForm";
import { createPost } from "../actions";

export default function NewPostPage() {
  return (
    <PostForm
      action={createPost}
      backHref="/admin/press-media"
      submitLabel="Create post"
    />
  );
}
