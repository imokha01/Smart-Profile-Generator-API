# 🚀 Smart Profile Generator API

A RESTful backend service that generates enriched user profiles by aggregating data from multiple external APIs, applying classification logic, and storing results in a MongoDB database.

---

## 📌 Features

- 🔍 Accepts a **name** and generates a profile using:
  - Gender prediction
  - Age estimation
  - Nationality prediction
- 🧠 Applies classification rules:
  - Age groups (child, teenager, adult, senior)
  - Most probable nationality
- 💾 Stores results in MongoDB
- ♻️ Prevents duplicate profiles
- 🔎 Filter profiles by gender, age group, or country
- 🗑️ Delete profiles
- 🌐 Fully deployed and accessible via API

---

## 🛠️ Tech Stack

- Node.js (ES6 Modules)
- Express.js
- MongoDB (Mongoose ODM)
- MVC Architecture
- External APIs:
  - Genderize
  - Agify
  - Nationalize

---

## 📂 Project Structure
    . 
    ├── src 
    │ ├── controllers 
    │ ├── models 
    │ ├── routes 
    │ ├── services 
    │ └── app.js 
    ├── server.js 
    ├── package.json 
    └── README.md

## ⚙️ Installation
```bash
  1. Clone the repository
        git clone https://github.com/imokha01/Smart-Profile-Generator-API.git
        cd Smart-Profile-Generator-API
  2. Install dependencies
        npm install
  3. Setup environment variables

       **Create a .env file:**
          MONGO_URI=your_mongodb_connection_string
          PORT=3000

 4. Run the server
        npm start
```

## 🌍 Live API
    https://smart-profile-generator-api.pxxl.click
    
## 📡 API Endpoints

 ### 🔹1. Create Profile
   ```
        POST /api/profiles
   ```
      
  ```
        Request Body
        {
          "name": "ella"
        }
   ```
  ```  
        Response
        {
          "status": "success",
          "data": {
            "id": "uuid",
            "name": "ella",
            "gender": "female",
            "age": 46,
            "age_group": "adult",
            "country_id": "US"
          }
        }
  ```
      
  ### 🔹 2. Get All Profiles

      GET /api/profiles

#### Optional Query Params
    ?gender=male&country_id=NG&age_group=adult
    
### 🔹 3. Get Single Profile

    GET /api/profiles/:id

### 🔹 4. Delete Profile

    DELETE /api/profiles/:id

## 🧠 Business Logic
      - Age Classification
      - Age Range	Group
      - 0–12	child
      - 13–19	teenager
      - 20–59	adult
      - 60+	senior
      - Nationality Selection
      - Chooses country with highest probability from Nationalize API
      
## ⚠️ Error Handling

  ### All errors follow:
    
    {
      "status": "error",
      "message": "Error message"
    }
```
    Status Codes
    400 → Missing name
    422 → Invalid input
    404 → Profile not found
    502 → External API failure
    500 → Server error
```

##  🔒 Edge Case Handling
    Genderize returns null → ❌ reject
    Agify returns null → ❌ reject
    Nationalize returns empty → ❌ reject
    
## 🌐 CORS
    Access-Control-Allow-Origin: *
    
## 🧪 Testing

    Use:
       Postman

## 🚀 Deployment

    Deployed on Pxxl.app

## 👨‍💻 Author

    Ahmed Wahab Imokha

## 📄 License

    This project is open-source and available under the MIT License.


