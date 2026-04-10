# 📸 SocialNest (Backend + Frontend)

A full-stack Social Media like application built with **Node.js, Express, MongoDB** (backend) and **React** (frontend - in progress).

---

## 🚀 Features

### 🔹 Backend (Completed)

* User Authentication (Login / Signup)
* Follow / Unfollow system
* Follow Request (Pending / Accepted / Rejected)
* Like / Unlike Posts
* Unique constraints (No duplicate likes/follows)
* Proper error handling & validations

### 🔹 Frontend (In Progress)

* React-based UI
* Cards for user profiles
* Feed UI (posts, likes, follow system)
* Responsive design using Tailwind CSS

---

## 🛠️ Tech Stack

### Backend:

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT Authentication

### Frontend:

* React.js
* Tailwind CSS

---

## 📁 Project Structure

```
Insta/
│
├── src/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── config/
│
├── postman/
│   └── insta-api.postman_collection.json
│
├── package.json
└── README.md
```

---

## ⚙️ Installation

```bash
# Clone repo
git clone <your-repo-link>

# Install dependencies
npm install

# Run server
npm start
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

If you like this project, give it a ⭐ on GitHub!
