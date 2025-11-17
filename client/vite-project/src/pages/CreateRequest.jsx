import { React, useState } from "react";

const CreateRequest = () => {
  const [request, setRequest] = useState({
    title: "",
    description: "",
    location: "",
    urgency: "LOW",
    user_id: "1",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setRequest((prev) => {
      return {
        ...prev,
        [name]: value,
      };
    });
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(request);
    const options = {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(request),
    };
    fetch("http://localhost:3000/api/requests", options);
    setRequest({
      title: "",
      description: "",
      location: "",
      urgency: "LOW",
      user_id: "1",
    });
  };
  return (
    <>
      <div>
        <form>
          <label> Title </label>
          <input
            type="text"
            name="title"
            value={request.title}
            placeholder="Title of issue"
            onChange={handleChange}
          />

          <label> Description </label>
          <input
            type="text"
            name="description"
            value={request.description}
            placeholder="Write a detailed description of the issue"
            onChange={handleChange}
          />

          <label> Location </label>
          <input
            type="text"
            name="location"
            value={request.location}
            placeholder="What building is this issue at"
            onChange={handleChange}
          />

          {/* <label> Category </label>
          <select name="category" id="category">
            <option value="housing">Housing</option>
            <option value="library">Library</option>
            <option value="laboratory">Laboratory</option>
            <option value="office">Office</option>
          </select> */}

          <label> Urgency Level </label>
          <select
            name="urgency"
            id="urgency"
            onChange={handleChange}
            value={request.urgency}
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>
          <button onClick={handleSubmit}>Send Request</button>
        </form>
      </div>
    </>
  );
};

export default CreateRequest;
