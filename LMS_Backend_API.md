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
# Topics API

This document describes **only the Topics-related APIs** in the LMS backend.

---

## Create Topic (Admin)

POST /api/topics
Authorization: Bearer <ADMIN_TOKEN>

Request:
{
  "title": "Introduction",
  "courseId": "COURSE_UUID",
  "orderIndex": 1
}

Response 201:
{
  "id": "TOPIC_UUID",
  "title": "Introduction",
  "course_id": "COURSE_UUID",
  "order_index": 1
}

---

## Get Topics by Course (Public)

GET /api/topics/course/:courseId

Response:
[
  {
    "id": "TOPIC_UUID",
    "title": "Introduction",
    "order_index": 1,
    "videos": []
  }
]

---

## Update Topic (Admin)

PUT /api/topics/:id
Authorization: Bearer <ADMIN_TOKEN>

Request:
{
  "title": "Updated Topic",
  "order_index": 2
}

---

## Delete Topic (Admin)

DELETE /api/topics/:id
Authorization: Bearer <ADMIN_TOKEN>

Response:
{
  "success": true
}

## Complete a Topic

### Endpoint
```
POST /api/topics/:topicId/complete
```

### Description
Marks a topic as completed and optionally records watch duration.

### URL Params
- `topicId` – UUID of the topic

### Request Body
```json
{
  "course_id": "<COURSE_UUID>",
  "watch_duration_seconds": 420
}
```

### Response
```json
{
  "message": "Topic completed"
}
```




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
PUT /api/admin/quiz/:questionId  
Authorization: Bearer <ADMIN_TOKEN>
Body:
{
  "question_text": "2 + 2 = ?",
  "question_type": "multiple_choice",
  "question_order": 1,
  "is_final_exam": false,
  "options": [
    { "option_text": "3", "is_correct": false },
    { "option_text": "4", "is_correct": true }
  ]
}

### Delete quiz question (Admin)
DELETE /api/admin/quiz/:id  
Authorization: Bearer <ADMIN_TOKEN>

---

## Videos


# Upload Video (Admin)

Uploads a video file for a specific topic.  
The backend stores the file in Supabase Storage and creates a DB record in `videos`.

---

## Endpoint

**POST** `/api/video/upload`

---

## Auth

**Required**  
`Authorization: Bearer <ADMIN_TOKEN>`

---

## Content-Type

`multipart/form-data`

---

## Form Fields

| Field     | Type | Required | Description |
|----------|------|----------|-------------|
| file     | File | Yes | Video file (`.mp4`, `.mov`, etc.) |
| topicId  | UUID | Yes | Topic ID the video belongs to |
| courseId | UUID | Yes | Course ID (must match topic) |
| title    | Text | No  | Video title (defaults to filename) |

---

## Example (curl)

```bash
curl -X POST http://localhost:4000/api/video/upload \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -F "file=@intro.mp4" \
  -F "topicId=442f03d6-f13c-4135-a5d3-b45adcf20ef2" \
  -F "courseId=38ca2086-c979-4f09-b9e0-c54922ac73fc" \
  -F "title=Intro Video"
```

---


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


## Dashboard Stats (User)

### Endpoint
```
GET /api/dashboard/me
```

### Description
Returns aggregated learning statistics for the authenticated user.

### Response
```json
{
  "enrolled": 1,
  "topicsCompleted": 3,
  "coursesCompleted": 1,
  "watchTimeSeconds": 1315,
  "streak": 1
}
```

### What Each Field Means
- `enrolled` → total courses enrolled
- `topicsCompleted` → total topics completed
- `coursesCompleted` → courses where `completed_at` is not null
- `watchTimeSeconds` → sum of `watch_duration_seconds` across all topics

---

## Tables Involved

- `enrollments`
- `topics`
- `topic_completions`
- `users` (mock user via Supabase Auth)

---

## Design Notes

- No counters are stored; all stats are **derived**
- Enrollment completion is **driven by topic completion**
- Watch duration is **telemetry**, not a completion gate
- Clean separation between real auth and analytics auth

---

# Assignments API

This document describes **only the Assignment-related APIs** in the LMS backend.

---

## Create Assignment (Admin)

POST /api/admin/assignments  
Authorization: Bearer <ADMIN_TOKEN>

Request:
```json
{
  "course_id": "COURSE_UUID",
  "title": "Final Practical Assignment",
  "description": "Upload your final project PDF",
  "max_marks": 100,
  "passing_marks": 40
}
```

Response 201:
```json
{
  "id": "ASSIGNMENT_UUID",
  "course_id": "COURSE_UUID",
  "title": "Final Practical Assignment",
  "description": "Upload your final project PDF",
  "max_marks": 100,
  "passing_marks": 40,
  "created_at": "2026-02-18T10:00:00Z"
}
```

---

## Get Assignment by Course (User)

GET /api/assignments/course/:courseId  
Authorization: Bearer <USER_TOKEN>

Response:
```json
{
  "id": "ASSIGNMENT_UUID",
  "course_id": "COURSE_UUID",
  "title": "Final Practical Assignment",
  "description": "Upload your final project PDF",
  "max_marks": 100,
  "passing_marks": 40
}
```

---

## Submit Assignment (User)

POST /api/assignments/:assignmentId/submit  
Authorization: Bearer <USER_TOKEN>  
Content-Type: multipart/form-data

Form Data:
```
file = assignment.pdf
```

Response 201:
```json
{
  "message": "Assignment submitted successfully"
}
```

---

## View Assignment Submissions (Admin)

GET /api/admin/assignments/:assignmentId/submissions  
Authorization: Bearer <ADMIN_TOKEN>

Response:
```json
[
  {
    "id": "SUBMISSION_UUID",
    "user_id": "USER_UUID",
    "file_url": "https://storage.example.com/assignment.pdf",
    "submitted_at": "2026-02-18T10:30:00Z",
    "marks_awarded": null,
    "status": "submitted"
  }
]
```

---

## Evaluate Assignment Submission (Admin)

POST /api/admin/assignments/submissions/:submissionId/evaluate  
Authorization: Bearer <ADMIN_TOKEN>

Request:
```json
{
  "marks_awarded": 75
}
```

Response:
```json
{
  "message": "Submission evaluated",
  "status": "evaluated"
}
```

---

## Delete Assignment (Admin)

DELETE /api/admin/assignments/:assignmentId  
Authorization: Bearer <ADMIN_TOKEN>

Response:
```json
{
  "message": "Assignment deleted successfully"
}
```

---

## Notes

- Assignments are **course-level**, not topic-level.
- Users can submit **only once** per assignment.
- Files are uploaded to Supabase Storage (`assignments` bucket).
- Assignment is considered **passed** if:
  ```
  marks_awarded >= passing_marks
  ```

---

_End of document_
