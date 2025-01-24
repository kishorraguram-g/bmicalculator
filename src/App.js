import React, { useState, useEffect } from "react";
import "./App.css";
import fit from "./fit.webp";
import obese from "./obese.jpg";
import lean from "./lean.jpg";


function App() {
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmi, setBmi] = useState(null);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("");
  const [bmiHistory, setBmiHistory] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [age, setAge] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedHistory = JSON.parse(localStorage.getItem("bmiHistory"));
    if (storedHistory) {
      setBmiHistory(storedHistory);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("bmiHistory", JSON.stringify(bmiHistory));
  }, [bmiHistory]);

  const validateInputs = () => {
    if (!name.trim()) {
      setError("Please enter your name.");
      return false;
    }
    if (!weight || weight <= 0) {
      setError("Please enter a valid weight.");
      return false;
    }
    if (!height || height <= 0) {
      setError("Please enter a valid height.");
      return false;
    }
    if (!age || age <= 0) {
      setError("Please enter a valid age.");
      return false;
    }
    setError("");
    return true;
  };

  const calculateBMI = () => {
    if (!validateInputs()) {
      return;
    }
    setIsLoading(true);
    const heightInMeters = height / 100;
    const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(2);
    setBmi(bmiValue);
    const bmiCategory = getBMICategory(bmiValue);
    setCategory(bmiCategory);

    const newRecord = { name, bmi: bmiValue, category: bmiCategory, age };
    setBmiHistory([...bmiHistory, newRecord]);

    setIsLoading(false);

    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });

    const utterance = new SpeechSynthesisUtterance(
      `Your BMI is ${bmiValue}. Category: ${bmiCategory}.`
    );
    window.speechSynthesis.speak(utterance);
  };

  const getBMICategory = (bmi) => {
    if (bmi < 18.5) {
      return "Underweight";
    } else if (bmi >= 18.5 && bmi < 24.9) {
      return "Normal weight";
    } else if (bmi >= 25 && bmi < 29.9) {
      return "Overweight";
    } else {
      return "Obese";
    }
  };

  const resetCalculator = () => {
    setName("");
    setWeight("");
    setHeight("");
    setAge("");
    setBmi(null);
    setCategory("");
    setError("");
  };

  const getDescription = (category) => {
    switch (category) {
      case "Underweight":
        return "Underweight individuals should focus on a nutrient-dense diet to gain healthy weight.";
      case "Normal weight":
        return "Normal weight indicates a balanced BMI. Continue maintaining a healthy lifestyle.";
      case "Overweight":
        return "Overweight individuals should consider physical activity and mindful eating habits.";
      case "Obese":
        return "Obesity may require lifestyle changes, diet planning, and medical consultation.";
      default:
        return "";
    }
  };

  const getImageForCategory = (category) => {
    switch (category) {
      case "Underweight":
        return lean; 
      case "Normal weight":
        return fit; 
      case "Obese":
        return obese; 
      default:
        return "";
    }
  };
  
  

  const handleSearch = (searchName) => {
    const record = bmiHistory.find(
      (item) => item.name.toLowerCase() === searchName.toLowerCase()
    );
    if (record) {
      alert(
        `Name: ${record.name}\nBMI: ${record.bmi}\nCategory: ${record.category}\nAge: ${record.age}`
      );
    } else {
      alert("No record found for the given name.");
    }
  };

  const handleInputChange = (e) => {
    const searchName = e.target.value;
    setName(searchName);

    const filteredSuggestions = bmiHistory.filter((item) =>
      item.name.toLowerCase().includes(searchName.toLowerCase())
    );
    setSuggestions(filteredSuggestions);
  };

  const handleSuggestionClick = (suggestedName) => {
    setName(suggestedName);
    setSuggestions([]);
    handleSearch(suggestedName);
  };

  return (
    <div className="BMICalculator">
      <h2>BMI Calculator</h2>
      <div>
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={handleInputChange}
            placeholder="Enter your name"
          />
        </label>
      </div>
      <div>
        <label>
          Weight (kg):
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Enter weight"
          />
        </label>
      </div>
      <div>
        <label>
          Height (cm):
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder="Enter height"
          />
        </label>
      </div>
      <div>
        <label>
          Age:
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter your age"
          />
        </label>
      </div>
      <button onClick={calculateBMI} disabled={isLoading}>
        {isLoading ? "Calculating..." : "Calculate BMI"}
      </button>
      <button onClick={resetCalculator}>Reset</button>
      <div>
        <label>
          Search by Name:
          <input
            type="text"
            value={name}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch(e.target.value);
            }}
            placeholder="Search BMI history"
          />
        </label>
        {suggestions.length > 0 && (
          <ul>
            {suggestions.map((record, index) => (
              <li key={index} onClick={() => handleSuggestionClick(record.name)}>
                {record.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && (
        <div style={{ color: "red" }}>
          <p>{error}</p>
        </div>
      )}
     {bmi && (
        <div>
          <h3>Your BMI is: {bmi}</h3>
          <h4>Category: {category}</h4>
          <p>{getDescription(category)}</p>
          {getImageForCategory(category) && (
            <img
              src={getImageForCategory(category)}
              alt={category}
              style={{ maxWidth: "200px", marginTop: "10px" }}
            />
          )}
        </div>
      )}

      <h3>BMI History</h3>
      {bmiHistory.length > 0 ? (
        <ul>
          {bmiHistory.map((record, index) => (
            <li key={index}>
              <strong>{record.name}</strong>: BMI {record.bmi} ({record.category}) - Age:{" "}
              {record.age}
            </li>
          ))}
        </ul>
      ) : (
        <p>No history available yet.</p>
      )}
    </div>
  );
}

export default App;
