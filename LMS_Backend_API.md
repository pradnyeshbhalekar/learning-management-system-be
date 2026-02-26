
# LMS Backend API Documentation (Single Source of Truth)

Base URL (Local):
http://localhost:4000

---

## Authentication

All protected APIs require:

Authorization: Bearer <JWT_TOKEN>

### JWT Payload
```json
{
  "sub": "<user-uuid>",
  "role": "admin" | "client",
  "iat": 1234567890,
  "exp": 1234567890
}
```

---

## Dev Utilities (Development Only)

### Generate Token
POST /api/dev/generate-token

Headers:
Content-Type: application/json

Body:
```json
{
  "role": "admin" | "client"
}
```

Response:
```json
{
  "token": "<JWT>"
}
```

---

# Categories

### Get All Categories
GET /api/categories  
Public

Response:
```json
[
  {
    "id": "<uuid>",
    "name": "Web Development",
    "description": "Frontend & Backend"
  }
]
```

### Create Category (Admin)
POST /api/categories  
Authorization: Bearer <ADMIN_TOKEN>

Body:
```json
{
  "name": "Web Development",
  "description": "Frontend & Backend"
}
```

---

# Courses

### Get All Courses
GET /api/courses  
Public

### Get Course By ID
GET /api/courses/:courseId  
Public

### Create Course (Admin)
POST /api/courses  
Authorization: Bearer <ADMIN_TOKEN>

Body:
```json
{
  "title": "Full Stack Development",
  "description": "Learn frontend + backend",
  "category_id": "<category-uuid>"
}
```

Response:
```json
{
  "id": "<course-uuid>",
  "title": "Full Stack Development"
}
```

---

# Topics (Course-level)

### Create Topic (Admin)
POST /api/topics  
Authorization: Bearer <ADMIN_TOKEN>

Body:
```json
{
  "courseId": "<course-uuid>",
  "title": "Introduction",
  "orderIndex": 1
}
```

### Get Topics By Course
GET /api/topics/course/:courseId  
Public

Response:
```json
[
  {
    "id": "<topic-uuid>",
    "title": "Introduction",
    "order_index": 1
  }
]
```

### Update Topic (Admin)
PUT /api/topics/:topicId  
Authorization: Bearer <ADMIN_TOKEN>

Body:
```json
{
  "title": "Updated Topic",
  "order_index": 2
}
```

### Delete Topic (Admin)
DELETE /api/topics/:topicId  
Authorization: Bearer <ADMIN_TOKEN>

Response:
```json
{ "success": true }
```

### Complete Topic (Client)
POST /api/topics/:topicId/complete  
Authorization: Bearer <CLIENT_TOKEN>

Body:
```json
{
  "course_id": "<course-uuid>",
  "watch_duration_seconds": 420
}
```

---

# Videos (Topic-level)

### Upload Video (Admin)
POST /api/video  
Authorization: Bearer <ADMIN_TOKEN>  
Content-Type: multipart/form-data

Form Data:
- video: <file>
- topicId: <topic-uuid>
- courseId: <course-uuid>
- title: Intro Video

Response:
```json
{
  "id": "<video-uuid>",
  "topic_id": "<topic-uuid>",
  "video_path": "topic-videos/<topicId>/<videoId>.mp4"
}
```

### Stream Video (Client)
GET /api/video/:videoId/stream  
Authorization: Bearer <CLIENT_TOKEN>

---

# Quiz (Course-level)

## User

### Get Quiz By Course
GET /api/quiz/course/:courseId  
Authorization: Bearer <CLIENT_TOKEN>

Response:
```json
{
  "quizId": "<quiz-uuid>",
  "title": "Final Course Quiz",
  "questions": []
}
```

### Submit Quiz
POST /api/quiz/course/:courseId/submit  
Authorization: Bearer <CLIENT_TOKEN>

Body:
```json
{
  "timeTaken": 60,
  "answers": [
    {
      "question_id": "<question-uuid>",
      "option_id": "<option-uuid>"
    }
  ]
}
```

Response:
```json
{
  "score": 80,
  "passed": true,
  "attemptId": "<attempt-uuid>"
}
```

### My Quiz Attempts
GET /api/quiz/my-attempts  
Authorization: Bearer <CLIENT_TOKEN>

---

## Admin

### Get Questions
GET /api/admin/quiz/questions?quizId=<quiz-uuid>  
Authorization: Bearer <ADMIN_TOKEN>

### Create Question
POST /api/admin/quiz/questions  
Authorization: Bearer <ADMIN_TOKEN>

Body:
```json
{
  "quiz_id": "<quiz-uuid>",
  "question_text": "2 + 2 = ?",
  "question_type": "mcq",
  "question_order": 1,
  "options": [
    { "option_text": "3", "is_correct": false },
    { "option_text": "4", "is_correct": true }
  ]
}
```

---

# Assignments (Course-level)

### Create Assignment (Admin)
POST /api/admin/assignments  
Authorization: Bearer <ADMIN_TOKEN>

Body:
```json
{
  "course_id": "<course-uuid>",
  "title": "Final Assignment",
  "description": "Upload PDF",
  "max_marks": 100,
  "passing_marks": 40
}
```

### Get Assignment By Course
GET /api/assignments/course/:courseId  
Authorization: Bearer <CLIENT_TOKEN>

### Submit Assignment
POST /api/assignments/:assignmentId/submit  
Authorization: Bearer <CLIENT_TOKEN>  
Content-Type: multipart/form-data

Form Data:
- file: assignment.pdf

Response:
```json
{ "message": "Assignment submitted successfully" }
```

### Evaluate Submission (Admin)
POST /api/admin/assignments/submissions/:submissionId/evaluate  
Authorization: Bearer <ADMIN_TOKEN>

Body:
```json
{ "marks_awarded": 75 }
```

---

# Labs

### Get Labs
GET /api/labs  
Public

### Assign Labs To Course
POST /api/labs/courses/:courseId/labs  
Authorization: Bearer <ADMIN_TOKEN>

Body:
```json
{
  "labIds": ["<lab-uuid>"]
}
```

---

# Dashboard (Client)

GET /api/dashboard/me  
Authorization: Bearer <CLIENT_TOKEN>

Response:
```json
{
  "enrolled": 1,
  "topicsCompleted": 3,
  "coursesCompleted": 1,
  "watchTimeSeconds": 1315,
  "streak": 1
}
```

---

## Final Notes

- One quiz per course
- One assignment per course
- Topics belong to courses
- Videos belong to topics
- This file is the ONLY valid API reference
