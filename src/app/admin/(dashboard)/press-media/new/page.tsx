import PostForm from "@/components/admin/PostForm";
import { createPost } from "../actions";

export default function NewPostPage() {
  return <PostForm action={createPost} backHref="/admin/press-media" />;
}
