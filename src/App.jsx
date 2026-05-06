import TodoApp from "./components/TodoApp.jsx";
import { Toaster } from "sonner";

export default function App() {
  return (
    <>
      <TodoApp />
      <Toaster position="top-center" richColors />
    </>
  );
}
