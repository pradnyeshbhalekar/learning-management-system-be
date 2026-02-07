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

## Lessons

### Get lessons for a course
GET /api/lessons/course/:courseId  
Public

### Mark lesson complete (Client)
POST /api/lessons/:lessonId/complete  
Authorization: Bearer <CLIENT_TOKEN>

---

## Labs

### List all labs
GET /api/labs  
Public

### Get lab by ID
GET /api/labs/:id  
Public

### Get labs for a course
GET /api/labs/courses/:courseId/labs  
Public

### Create lab (Admin)
POST /api/labs  
Authorization: Bearer <ADMIN_TOKEN>

Body:
{
  "name": "Intro Lab",
  "code": "LAB001",
  "description": "Hands-on practice"
}

### Update lab (Admin)
PUT /api/labs/:id  
Authorization: Bearer <ADMIN_TOKEN>

### Delete lab (Admin)
DELETE /api/labs/:id  
Authorization: Bearer <ADMIN_TOKEN>

### Assign labs to course (Admin)
POST /api/labs/courses/:courseId/labs  
Authorization: Bearer <ADMIN_TOKEN>

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


## Video

Stream video (Public)  
GET /api/video?topicId=<topic-uuid>

Stream via direct URL (Public)  
GET /api/video?url=<public-video-url>

Get signed video URL (Client)  
GET /api/video/signed-url?topicId=<topic-uuid>  
Headers: Authorization: Bearer <CLIENT_TOKEN>

Create video (Admin)  
POST /api/video  
Headers: Authorization: Bearer <ADMIN_TOKEN>

Body:
{
  "title": "Intro Video",
  "url": "https://<supabase-project>.supabase.co/storage/v1/object/public/videos/topic-videos/file.mp4",
  "courseId": "<course-uuid>"
}
