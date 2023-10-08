import React, { useState, MouseEvent } from "react";
import "./styles/TodoButtons.css"; // Import your CSS file

/**
 ** Interfaces can be define inside or outside the component
 * - if defined inside, it's only available in the component
 * - if defined outside, it's available in the component and outside
 * - if you want to use it in other components, it's better to define it outside
 */
// interface for the props
interface TodoButtonProps {
  name: string;
  passwordMatched: boolean;
}
interface ButtonStyle {
  "--x": string;
}

const TodoButton: React.FC<TodoButtonProps> = ({
  name = "Todo Button",
  passwordMatched = true,
}) => {
  // to handlet the mouse move event
  const [x, setX] = useState<number>(0);

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const newX = e.clientX * 3 - rect.left;
    setX(newX);
  };

  const buttonStyle: ButtonStyle = {
    "--x": `${x}deg`,
  };

  return (
    <button
      className={`todo-button mt-2 rounded w-full border-2 px-6 py-2 font-semibold ${
        passwordMatched
          ? "border-green-500 text-green-500 active:bg-green-300 active:text-gray-600"
          : "border-gray-400 text-gray-400 cursor-not-allowed"
      } text-lg`}
      onMouseMove={handleMouseMove}
      style={buttonStyle as React.CSSProperties} // annotate the style prop with React.CSSProperties
    >
      <i></i>
      <i></i>
      <span>{name}</span>
    </button>
  );
};

export default TodoButton;
