import React, { ChangeEvent } from "react";

/**
 * @param title - String (State).
 * @param setTitle - Function (Update State).To update title value of todo
 * @returns Title Input Element.
 */

interface TitleInputProps {
  title: string;
  setTitle: (newTitle: string) => void;
}

// review done.
const TitleInput: React.FC<TitleInputProps> = ({ title, setTitle }) => {
  /**
   * handleChange() - Updates the title value.
   * @param e - Event Object.
   * @returns Updated title value.
   *        - Sets the updated title value to title.
   */

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  return (
    <label htmlFor="title">
      <input
        className="Todoform_inputs text-2xl md:text-4xl  h-16  text-violet-800  w-full  lg:w-5/6 pl-2 pb-1  border-t-0  border-l-0  border-r-0  border-b-2  border-violet-300  focus:border-b-2  focus:border-violet-500  placeholder-violet-500 focus:ring-0"
        type="text"
        id="title"
        name="title"
        placeholder="Todo Title"
        value={title}
        onChange={handleChange}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
          }
        }}
      />
    </label>
  );
};

export default TitleInput;
