// /**
//  * @param title - String (State).
//  * @param setTitle - Function (Update State).To update title value of todo
//  * @returns Title Input Element.
//  */
// // review done.
// const TitleInput = ({ title, setTitle }) => {
//   /**
//    * handleChange() - Updates the title value.
//    * @param e - Event Object.
//    * @returns Updated title value.
//    *        - Sets the updated title value to title.
//    */

//   const handleChange = (e) => {
//     setTitle(e.target.value);
//   };

//   const inputStyle = {
//     backgroundColor: "transparent", // Set the background color to transparent
//     border: "1px solid #ccc", // Add a border for visibility
//   };

//   return (
//     <label htmlFor="title">
//       <input
//         className=" text-2xl md:text-4xl  h-16  text-violet-800  w-full  lg:w-5/6 pl-2 pb-1  border-t-0  border-l-0  border-r-0  border-b-2  border-violet-300  focus:border-b-2  focus:border-violet-500  placeholder-violet-500 focus:ring-0
//             "
//         type="text"
//         id="title"
//         name="title"
//         placeholder="Todo Title"
//         value={title}
//         onChange={handleChange}
//         onKeyDown={(e) => {
//           if (e.key === "Enter") {
//             e.preventDefault();
//           }
//         }}
//         style={inputStyle}
//       />
//     </label>
//   );
// };

// export default TitleInput;
