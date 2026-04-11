# 🌐 SocialNest  
### 🚀 Full Stack Social Media Application

A modern full-stack social media app built with **Node.js, Express, MongoDB** and **React (Vite)**.

---

## ✨ Features

### 🔐 Backend (Completed)
- 🧑‍💻 User Authentication (Login / Register with JWT)
- 🍪 Secure Auth using **HTTP-only Cookies**
- 🤝 Follow / Unfollow system
- 📩 Follow Request System (Pending / Accepted / Rejected)
- ❤️ Like / Unlike Posts (Toggle Logic)
- 🛡️ Protected Routes (Middleware)
- ⚡ MongoDB Indexing (No duplicate likes/follows)
- 🚨 Error Handling & Validation

---

### 🎨 Frontend (In Progress)
- ⚛️ React + Vite setup
- 🔐 Login / Register UI
- 🔗 API Integration using Axios
- 🧭 Routing (React Router)
- 🎨 SCSS / Tailwind Styling
- 📱 Responsive Design

**Upcoming 🚧**
- 📰 Feed UI (Posts)
- 👤 Profile Page
- 🔔 Notifications
- 💬 Comments System

---

## 🛠️ Tech Stack

### 🧠 Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Cookies (httpOnly)

### 🎯 Frontend
- React.js (Vite)
- React Router
- Axios
- SCSS / Tailwind CSS

---



## 📁 Project Structure

```
SocialNest/
├── Backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   └── config/
│   ├── postman/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── Frontend/
│   ├── src/
│   │   ├── features/
│   │   │   └── auth/
│   │   │       ├── pages/
│   │   │       └── style/
│   │   ├── routes.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## ⚙️ Installation

```bash
# Clone repo
## ⚙️ Installation & Setup

### 1️⃣ Clone Repository
```bash
git clone https://github.com/imshubhryan/SocialNest.git
cd SocialNest
```

---

## 🔐 Environment Variables

Create a `.env` file in root:

```
PORT=3000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

---

## 📬 API Testing

* Postman collection available inside:

```
/postman/insta-api.postman_collection.json
```

👉 Import it in Postman to test APIs easily.

---

## 🔥 Important APIs

### Follow User

```
POST /api/users/follow/:username
```

### Unfollow User

```
POST /api/users/unfollow/:username
```

### Follow Requests List

```
GET /api/users/requests
```

### Accept / Reject Request

```
POST /api/users/requests/:id
Body:
{
  "action": "accepted" | "rejected"
}
```

### Like / Unlike Post

```
POST /api/posts/like/:postId
```

---

## 🧠 Concepts Used

* Indexing in MongoDB (Unique constraints)
* Middleware (Authentication)
* MVC Architecture
* REST APIs
* Toggle logic (Like/Unlike)

---

## 🚧 Future Improvements

* Frontend completion (React UI)
* Comments system
* Notifications
* Image upload (Cloudinary / AWS S3)
* Real-time features (Socket.io)

---

## 🙌 Author

Made with ❤️ by *[Shubham Ryan]*

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!!
