# Product Requirements Document (PRD): Mentorship & Job Board Platform

## 1. Overview
This document outlines the core requirements for an MVP of a mentorship and job board platform connecting mentors and mentees in the healthcare/education domain. The platform aims to provide mentees with access to career opportunities and professional guidance while enabling mentors to offer fellowships, observerships, or jobs.

## 2. User Roles
- **Mentee**: Users seeking mentorship or job opportunities
- **Mentor**: Professionals offering mentorship and/or posting opportunities  
- **Admin**: Platform moderators responsible for user/content approval and analytics

## 3. Core Modules

### 3.1 Secure Authentication
- Email-based OTP login (phone and social login are out-of-scope for MVP)
- Session management with timeout and refresh

### 3.2 User Profiles
- **Mentee Profile**: Education, interests, location
- **Mentor Profile**: Specialty/sub-specialty, workplace, availability status (static text, not a calendar)
- Profile extensibility planned for future roles

### 3.3 Opportunity / Job Board
- Mentors can post fellowships, jobs, or observerships
- Mentees can browse and apply (with CV upload) — Profile will have CV details by default
- Mentees may also submit relevant job opportunities (subject to admin approval)
- Posts are moderated by admin before publishing

### 3.4 Search & Filters
- Simple filters: Location, experience level
- Available for mentees browsing opportunities
- Mentors can also filter/search mentees

### 3.5 Notifications
- Email notifications only
- Triggered on: Application submission, admin approval, post publication, and custom announcements from the admin end

### 3.6 Admin CMS & Moderation
Admin dashboard for:
- Role assignment (mentor/mentee/admin)
- Manual approval of new users and all content
- Removing flagged/inappropriate posts
- Viewing simple analytics (sign-ups, posts)
- Viewing audit logs of key actions
- Legal disclaimer and terms to be shown on first login

## 4. Functional Requirements

### 4.1 Mentee Features
- Register/login using OTP (email)
- Provide purpose of registration (job, fellowship, observership)
- Create/edit profile (education, interests, location)
- Browse job posts with filters
- Save opportunities
- Apply with CV upload
- Submit opportunities (for approval)
- Start case discussion threads or short-term opportunity threads
- Connect to mentor through job application (not direct messaging)

### 4.2 Mentor Features
- Register/login using OTP (email)
- Create/edit profile (specialty, hospital, availability)
- Post jobs/fellowships/observerships
- Search mentees (for potential invitations or reference)
- View and manage applications

### 4.3 Admin Features
- Admin dashboard
- Role management
- User and content approval (all posts and user registrations)
- Flag and remove inappropriate content
- Simple analytics dashboard (user count, post count)
- Audit logging of user/admin actions
- Legal disclaimer agreement management
- Initial job/fellowship seeding for platform launch

## 5. Non-Functional Requirements
- Modern and sleek UI
- Follow  design principles
- Mobile responsive UI
- Secure backend with encrypted storage of sensitive data
- GDPR-compliant handling of user data
- Scalable architecture for future expansion

## 6. Technical Architecture
- **Frontend**: Next.js (React, SSR, SEO-friendly)
- **Backend**: Next.js API routes
- **Database**: MongoDB (with Prisma ORM)
- **Style/UI**: Shadcn UI, Tailwind CSS
- **Authentication**: Custom email OTP logic
- **File Uploads**: AWS S3 (for CVs)
- **Email Service**: Brevo (Sendinblue)
- **Hosting**: Vercel/AWS
- **Security**: Encrypted storage for sensitive data
- **Compliance**: GDPR-ready user data handling

## 7. Development Roadmap
- **MVP Requirements**
  - Secure email OTP authentication
  - Mentee/mentor/admin roles
  - Profile creation/editing
  - Opportunity/job board (post, browse, apply)
  - Admin moderation dashboard
  - Email notifications
  - Basic analytics and audit logs
  - Mobile responsive UI
  - Legal disclaimer and terms management
  - Case discussion threads
  - Opportunity submission by mentees
  - Initial content seeding

- **Future Enhancements**
  - Social logins (Google, LinkedIn)
  - Calendar-based mentor availability
  - Real-time messaging/chat
  - Organization profiles
  - Advanced analytics and reporting
  - In-app messaging & notifications
  - Advanced search filters by specialization, date, etc.

## 8. Logical Dependency Chain
- Foundation: Authentication, user roles, and profile management
- Next: Opportunity/job board and admin moderation
- Then: Search/filters, notifications, analytics, audit logs
- MVP prioritizes visible, usable flows (register, profile, browse/apply, post jobs)
- Features are scoped to be atomic and extensible for future iterations

## 9. Risks and Mitigations
- **Technical challenges**: Custom OTP logic, secure file uploads, GDPR compliance
  - Mitigation: Use proven libraries/services (Brevo, AWS S3, Prisma)
- **MVP scoping**: Avoid feature creep (no phone/social login, no real-time chat for MVP)
- **Resource constraints**: Focus on core flows, defer advanced features

## 10. Open Questions / Future Considerations
- Support for social logins in future (Google, LinkedIn)
- Calendar-based availability (for mentors) in next iteration
- Real-time messaging or chat (if needed for later phase)
- Organization profiles and tracking
- In-app messaging & notifications
- Advanced search filters by specialization, date, etc. 