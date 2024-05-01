import React, { useState } from "react";

function QueryForm() {
  const [formData, setFormData] = useState({
    startDateTime: "",
    endDateTime: "",
    temporalLevel: "",
    aggLevel: "",
    north: "",
    south: "",
    east: "",
    west: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch("/api/queries/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      // Reset form after successful submission
      setFormData({
        startDateTime: "",
        endDateTime: "",
        temporalLevel: "",
        aggLevel: "",
        north: "",
        south: "",
        east: "",
        west: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Start Date Time:</label>
      <input
        type="datetime-local"
        name="startDateTime"
        value={formData.startDateTime}
        onChange={handleChange}
      />
      <label>End Date Time:</label>
      <input
        type="datetime-local"
        name="endDateTime"
        value={formData.endDateTime}
        onChange={handleChange}
      />
      <label>Temporal Level:</label>
      <input
        type="text"
        name="temporalLevel"
        value={formData.temporalLevel}
        onChange={handleChange}
      />
      <label>Aggregation Level:</label>
      <input
        type="text"
        name="aggLevel"
        value={formData.aggLevel}
        onChange={handleChange}
      />
      <label>North:</label>
      <input
        type="number"
        name="north"
        value={formData.north}
        onChange={handleChange}
      />
      {/* Add other form fields similarly */}
      <button type="submit">Submit</button>
    </form>
  );
}

export default QueryForm;
