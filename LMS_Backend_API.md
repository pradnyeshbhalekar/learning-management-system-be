# LMS Backend API Documentation

## Base URLs

Local:
http://localhost:4000

---

## Authentication

All protected APIs require a JWT sent via header:

Authorization: Bearer <JWT_TOKEN>

### JWT Payload Shape

{
  "sub": "<user-id>",
  "role": "admin" | "client",
  "iat": 1234567890,
  "exp": 1234567890
}

- sub: user identifier (UUID string)
- role: used for RBAC (admin / client)

---

## Dev-only (Testing)

### Generate Test Token

POST /api/dev/generate-token

Request body:
{
  "role": "admin" | "client"
}

Response:
{
  "token": "<JWT>"
}

Development only. Not available in production.

---

## Categories

### Get all categories
GET /api/categories  
Public

### Create category (Admin)
POST /api/categories  
Authorization: Bearer <ADMIN_TOKEN>

Body:
{
  "name": "Web Development",
  "description": "Frontend & Backend"
}

### Update category (Admin)
PUT /api/categories/:id  
Authorization: Bearer <ADMIN_TOKEN>

### Delete category (Admin)
DELETE /api/categories/:id  
Authorization: Bearer <ADMIN_TOKEN>

---

## Courses

### Get all courses
GET /api/courses  
Public

### Get course by ID
GET /api/courses/:id  
Public

### Get course details
GET /api/courses/:id/details  
Public

### Create course (Admin)
POST /api/courses  
Authorization: Bearer <ADMIN_TOKEN>

### Delete course (Admin)
DELETE /api/courses/:id  
Authorization: Bearer <ADMIN_TOKEN>

---


## Topics

### Create Topic (Admin)
POST /api/topics

Body:
{
  "title": "Introduction",
  "courseId": "<course-uuid>",
  "orderIndex": 1
}

Response:
{
  "id": "<topic-uuid>",
  "title": "Introduction",
  "course_id": "<course-uuid>"
}

---



## Enrollments

### Enroll in a course (Client)
POST /api/enrollments  
Authorization: Bearer <CLIENT_TOKEN>

Body:
{
  "courseId": "<course-uuid>"
}

### Get my enrollments (Client)
GET /api/enrollments/me  
Authorization: Bearer <CLIENT_TOKEN>

---

## Quiz – User

### Get quiz by topic
GET /api/quiz/topic/:topicId  
Public

### Submit quiz attempt (Client)
POST /api/quiz/submit  
Authorization: Bearer <CLIENT_TOKEN>

Body:
{
  "topicId": "<topic-uuid>",
  "courseId": "<course-uuid>",
  "isFinalExam": false,
  "timeTaken": 60,
  "answers": [
    {
      "questionId": "<question-uuid>",
      "selectedOptionId": "<option-uuid>"
    }
  ]
}

Response:
{
  "score": 80,
  "passed": true,
  "scoreId": "<uuid>"
}

### Get my quiz attempts (Client)
GET /api/quiz/my-attempts  
Authorization: Bearer <CLIENT_TOKEN>

---

## Quiz – Admin

### Get quiz questions
GET /api/admin/quiz  
Authorization: Bearer <ADMIN_TOKEN>

Optional query params:
?courseId=<uuid>  
?topicId=<uuid>

### Create quiz question (Admin)
POST /api/admin/quiz  
Authorization: Bearer <ADMIN_TOKEN>

Body:
{
  "course_id": "<course-uuid>",
  "topic_id": "<topic-uuid>",
  "question_text": "2 + 2 = ?",
  "question_type": "multiple_choice",
  "question_order": 1,
  "is_final_exam": false,
  "options": [
    { "option_text": "3", "is_correct": false },
    { "option_text": "4", "is_correct": true }
  ]
}

### Update quiz question (Admin)
PUT /api/admin/quiz/:id  
Authorization: Bearer <ADMIN_TOKEN>

### Delete quiz question (Admin)
DELETE /api/admin/quiz/:id  
Authorization: Bearer <ADMIN_TOKEN>

---

## Videos

### Create Video (Admin)
POST /api/video

Body:
{
  "title": "Intro Video",
  "url": "https://<project>.supabase.co/storage/v1/object/public/videos/topic-videos/intro.mp4",
  "courseId": "<course-uuid>",
  "topicId": "<topic-uuid>"
}

Stores:
- video_path in videos table
- linked via topic_id

---

### Stream Video (Public)
GET /api/video?topicId=<topic-uuid>

Supports:
- Range headers
- Inline streaming (not download)

---

### Get Signed URL (Client)
GET /api/video/signed-url?topicId=<topic-uuid>

Headers:
Authorization: Bearer <CLIENT_TOKEN>

Response:
{
  "url": "<signed-url>",
  "expiresIn": 3600
}

---

### Update Video (Admin)
PUT /api/video/:topicId

Body:
{
  "title": "Updated title",
  "url": "new-video-url"
}

---

## Labs

### Get All Labs
GET /api/labs

Public

---

### Create Lab (Admin)
POST /api/labs

Body:
{
  "name": "React Basics Lab",
  "code": "LAB001",
  "description": "Hands-on practice"
}

---

### Update Lab (Admin)
PUT /api/labs/:id

---

### Delete Lab (Admin)
DELETE /api/labs/:id

---

## Course ↔ Labs (course_labs)

### Get Labs for Course
GET /api/labs/courses/:courseId/labs

Response:
[
  {
    "id": "<lab-uuid>",
    "name": "React Basics Lab",
    "code": "LAB001"
  }
]

---

### Assign Labs to Course (Admin)
POST /api/labs/courses/:courseId/labs

Body:
{
  "labIds": ["<lab-uuid-1>", "<lab-uuid-2>"]
}

Behavior:
- Deletes old assignments
- Inserts new rows into course_labs

---
