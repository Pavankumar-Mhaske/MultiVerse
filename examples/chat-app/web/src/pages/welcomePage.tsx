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
      <div className="flex flex-row">
        <h1>Choose an App</h1>
        <button onClick={handleTodoApp}>TodoApp </button>
        <button onClick={handleChatApp}>ChatApp </button>
      </div>
    </div>
  );
}

export default Welcome;
