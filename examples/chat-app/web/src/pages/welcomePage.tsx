import React from "react";
import { useNavigate } from "react-router-dom";

function Welcome() {
  const navigate = useNavigate();

  const handleTodoApp = () => {
    navigate("/todo");
    console.log("clicked on todoapp");
  };

  const handleChatApp = () => {
    navigate("/chat");
    console.log("clicked on chatapp");
  };

  return (
    <div className="App">
      <div className="flex flex-row items-center">
        <h1 className="mr-4">Choose an App</h1>
        <button
          className="px-4 py-2 rounded-md bg-blue-500 text-white mr-2"
          onClick={handleTodoApp}
        >
          TodoApp
        </button>
        <button
          className="px-4 py-2 rounded-md bg-green-500 text-white"
          onClick={handleChatApp}
        >
          ChatApp
        </button>
      </div>
    </div>
  );
}

export default Welcome;
