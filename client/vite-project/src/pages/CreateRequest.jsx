import { React, useState, useEffect } from "react";

const CreateRequest = () => {
  const [request, setRequest] = useState({
    title: "",
    description: "",
    location: "",
    urgency: "LOW",
    user_id: "1",
    category_id: "",
  });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const getAllCategories = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/categories");
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error("Error", error);
      }
    };
    getAllCategories();
  }, []);
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
      category_id: "",
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

          <label> Category </label>
          <select
            name="category_id"
            id="category_id"
            onChange={handleChange}
            value={request.category_id}
          >
            <option value="">Select a category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button onClick={handleSubmit}>Send Request</button>
        </form>
      </div>
    </>
  );
};

export default CreateRequest;
